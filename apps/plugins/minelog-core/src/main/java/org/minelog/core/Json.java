package org.minelog.core;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Json {
    private final String text;
    private int at;

    private Json(String text) {
        this.text = text;
    }

    public static Object parse(String text) throws IOException {
        if (text == null) {
            throw new IOException("There is no JSON to read.");
        }
        Json reader = new Json(text);
        reader.skipSpace();
        Object value = reader.readValue(0);
        reader.skipSpace();
        if (reader.at != text.length()) {
            throw reader.fail("Unexpected text after the value");
        }
        return value;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> object(Object value) {
        return value instanceof Map ? (Map<String, Object>) value : new LinkedHashMap<String, Object>();
    }

    @SuppressWarnings("unchecked")
    public static List<Object> array(Object value) {
        return value instanceof List ? (List<Object>) value : new ArrayList<Object>();
    }

    public static String string(Object value) {
        return value instanceof String ? (String) value : "";
    }

    public static boolean bool(Object value, boolean fallback) {
        return value instanceof Boolean ? ((Boolean) value).booleanValue() : fallback;
    }

    public static int integer(Object value, int fallback) {
        return value instanceof Number ? ((Number) value).intValue() : fallback;
    }

    private Object readValue(int depth) throws IOException {
        if (depth > 32) {
            throw fail("Too deeply nested");
        }
        if (at >= text.length()) {
            throw fail("Unexpected end");
        }
        char c = text.charAt(at);
        if (c == '{') {
            return readObject(depth);
        }
        if (c == '[') {
            return readArray(depth);
        }
        if (c == '"') {
            return readString();
        }
        if (text.startsWith("true", at)) {
            at += 4;
            return Boolean.TRUE;
        }
        if (text.startsWith("false", at)) {
            at += 5;
            return Boolean.FALSE;
        }
        if (text.startsWith("null", at)) {
            at += 4;
            return null;
        }
        return readNumber();
    }

    private Map<String, Object> readObject(int depth) throws IOException {
        Map<String, Object> out = new LinkedHashMap<String, Object>();
        at++;
        skipSpace();
        if (peek() == '}') {
            at++;
            return out;
        }
        while (true) {
            skipSpace();
            if (peek() != '"') {
                throw fail("Expected a field name");
            }
            String name = readString();
            skipSpace();
            expect(':');
            skipSpace();
            out.put(name, readValue(depth + 1));
            skipSpace();
            char next = peek();
            at++;
            if (next == '}') {
                return out;
            }
            if (next != ',') {
                throw fail("Expected , or }");
            }
        }
    }

    private List<Object> readArray(int depth) throws IOException {
        List<Object> out = new ArrayList<Object>();
        at++;
        skipSpace();
        if (peek() == ']') {
            at++;
            return out;
        }
        while (true) {
            skipSpace();
            out.add(readValue(depth + 1));
            skipSpace();
            char next = peek();
            at++;
            if (next == ']') {
                return out;
            }
            if (next != ',') {
                throw fail("Expected , or ]");
            }
        }
    }

    private String readString() throws IOException {
        at++;
        StringBuilder out = new StringBuilder();
        while (at < text.length()) {
            char c = text.charAt(at++);
            if (c == '"') {
                return out.toString();
            }
            if (c != '\\') {
                out.append(c);
                continue;
            }
            if (at >= text.length()) {
                break;
            }
            char escape = text.charAt(at++);
            switch (escape) {
                case 'n':
                    out.append('\n');
                    break;
                case 'r':
                    out.append('\r');
                    break;
                case 't':
                    out.append('\t');
                    break;
                case 'b':
                    out.append('\b');
                    break;
                case 'f':
                    out.append('\f');
                    break;
                case 'u':
                    if (at + 4 > text.length()) {
                        throw fail("Short unicode escape");
                    }
                    try {
                        out.append((char) Integer.parseInt(text.substring(at, at + 4), 16));
                    } catch (NumberFormatException bad) {
                        throw fail("Bad unicode escape");
                    }
                    at += 4;
                    break;
                default:
                    out.append(escape);
                    break;
            }
        }
        throw fail("Unterminated string");
    }

    private Object readNumber() throws IOException {
        int start = at;
        while (at < text.length() && "+-0123456789.eE".indexOf(text.charAt(at)) >= 0) {
            at++;
        }
        if (start == at) {
            throw fail("Unexpected character");
        }
        String number = text.substring(start, at);
        try {
            if (number.indexOf('.') < 0 && number.indexOf('e') < 0 && number.indexOf('E') < 0) {
                return Long.valueOf(Long.parseLong(number));
            }
            return Double.valueOf(Double.parseDouble(number));
        } catch (NumberFormatException bad) {
            throw fail("Bad number");
        }
    }

    private void skipSpace() {
        while (at < text.length() && Character.isWhitespace(text.charAt(at))) {
            at++;
        }
    }

    private char peek() throws IOException {
        if (at >= text.length()) {
            throw fail("Unexpected end");
        }
        return text.charAt(at);
    }

    private void expect(char c) throws IOException {
        if (peek() != c) {
            throw fail("Expected " + c);
        }
        at++;
    }

    private IOException fail(String why) {
        return new IOException("Could not read the answer: " + why + " at " + at);
    }
}
