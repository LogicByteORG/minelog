package org.minelog.core;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.zip.GZIPOutputStream;

public final class MinelogClient {
    private final MinelogConfig config;
    private final String userAgent;

    public MinelogClient(MinelogConfig config, String userAgent) {
        this.config = config;
        this.userAgent = userAgent == null ? "minelog-plugin" : userAgent;
    }

    public UploadResult upload(File file) throws IOException {
        byte[] content = Files.readAllBytes(file.toPath());
        String text = new String(content, StandardCharsets.UTF_8);
        return uploadText(text);
    }

    public UploadResult uploadText(String text) throws IOException {
        String body = "{\"content\":" + quote(text) + ",\"source\":" + quote(config.source) + "}";
        byte[] gzipped = gzip(body.getBytes(StandardCharsets.UTF_8));

        HttpURLConnection connection =
                (HttpURLConnection) url(config.apiBase + "/v2/logs").openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(config.timeoutMs);
        connection.setReadTimeout(config.timeoutMs);
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Content-Encoding", "gzip");
        connection.setRequestProperty("User-Agent", userAgent);
        OutputStream out = connection.getOutputStream();
        try {
            out.write(gzipped);
        } finally {
            out.close();
        }

        int status = connection.getResponseCode();
        String response = readBody(connection, status);
        if (status != 200 && status != 201) {
            throw new IOException("Upload failed with status " + status + ": " + response);
        }
        String id = field(response, "id");
        String url = field(response, "url");
        String raw = field(response, "raw");
        String token = field(response, "deleteToken");
        String until = field(response, "deletableUntil");
        if (id.isEmpty() || url.isEmpty()) {
            throw new IOException("Upload gave an empty answer: " + response);
        }
        if (url.startsWith("http://localhost") || url.contains("localhost")) {
            url = config.siteBase + "/" + id;
        }
        if (raw.isEmpty() || raw.contains("localhost")) {
            raw = config.apiBase + "/v2/logs/" + id + "/raw";
        }
        int problems = fetchProblemCount(id);
        return new UploadResult(id, url, raw, token, until, problems);
    }

    public void delete(String id, String token) throws IOException {
        HttpURLConnection connection =
                (HttpURLConnection) url(config.apiBase + "/v2/logs/" + id).openConnection();
        connection.setRequestMethod("DELETE");
        connection.setConnectTimeout(config.timeoutMs);
        connection.setReadTimeout(config.timeoutMs);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Authorization", "Bearer " + token);
        connection.setRequestProperty("User-Agent", userAgent);
        int status = connection.getResponseCode();
        String response = readBody(connection, status);
        if (status != 200) {
            throw new IOException("Delete failed with status " + status + ": " + response);
        }
    }

    private int fetchProblemCount(String id) {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) url(config.apiBase + "/v2/logs/" + id + "/insights")
                    .openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(Math.min(config.timeoutMs, 10000));
            connection.setReadTimeout(Math.min(config.timeoutMs, 10000));
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("User-Agent", userAgent);
            if (connection.getResponseCode() != 200) {
                return -1;
            }
            String response = readBody(connection, 200);
            return countProblems(response);
        } catch (IOException ignored) {
            return -1;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static int countProblems(String response) {
        int at = response.indexOf("\"problems\"");
        if (at < 0) {
            return -1;
        }
        int open = response.indexOf('[', at);
        int close = response.indexOf(']', open);
        if (open < 0 || close < 0 || close <= open + 1) {
            return 0;
        }
        String inside = response.substring(open + 1, close).trim();
        if (inside.isEmpty()) {
            return 0;
        }
        int count = 1;
        int from = 0;
        while (true) {
            int comma = indexOfTopLevelComma(inside, from);
            if (comma < 0) {
                break;
            }
            count++;
            from = comma + 1;
        }
        return count;
    }

    private static int indexOfTopLevelComma(String text, int from) {
        int depth = 0;
        boolean inString = false;
        for (int i = from; i < text.length(); i++) {
            char c = text.charAt(i);
            if (inString) {
                if (c == '\\') {
                    i++;
                } else if (c == '"') {
                    inString = false;
                }
                continue;
            }
            if (c == '"') {
                inString = true;
            } else if (c == '{' || c == '[') {
                depth++;
            } else if (c == '}' || c == ']') {
                depth--;
            } else if (c == ',' && depth == 0) {
                return i;
            }
        }
        return -1;
    }

    private static URL url(String spec) throws IOException {
        try {
            return new URI(spec).toURL();
        } catch (URISyntaxException bad) {
            throw new IOException("Bad address: " + spec, bad);
        }
    }

    private static String readBody(HttpURLConnection connection, int status) throws IOException {
        InputStream in = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        if (in == null) {
            return "";
        }
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        } finally {
            in.close();
        }
    }

    private static byte[] gzip(byte[] input) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        GZIPOutputStream gzip = new GZIPOutputStream(out);
        try {
            gzip.write(input);
        } finally {
            gzip.close();
        }
        return out.toByteArray();
    }

    static String field(String json, String key) {
        String needle = "\"" + key + "\"";
        int at = json.indexOf(needle);
        if (at < 0) {
            return "";
        }
        int colon = json.indexOf(':', at + needle.length());
        if (colon < 0) {
            return "";
        }
        int firstQuote = json.indexOf('"', colon + 1);
        if (firstQuote < 0) {
            return "";
        }
        StringBuilder out = new StringBuilder();
        for (int i = firstQuote + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '\\') {
                if (i + 1 >= json.length()) {
                    break;
                }
                char next = json.charAt(++i);
                if (next == 'n') {
                    out.append('\n');
                } else if (next == 't') {
                    out.append('\t');
                } else {
                    out.append(next);
                }
            } else if (c == '"') {
                break;
            } else {
                out.append(c);
            }
        }
        return out.toString();
    }

    static String quote(String text) {
        StringBuilder out = new StringBuilder(text.length() + 2);
        out.append('"');
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '"') {
                out.append("\\\"");
            } else if (c == '\\') {
                out.append("\\\\");
            } else if (c == '\n') {
                out.append("\\n");
            } else if (c == '\r') {
                out.append("\\r");
            } else if (c == '\t') {
                out.append("\\t");
            } else if (c < 0x20) {
                out.append(String.format("\\u%04x", (int) c));
            } else {
                out.append(c);
            }
        }
        out.append('"');
        return out.toString();
    }
}
