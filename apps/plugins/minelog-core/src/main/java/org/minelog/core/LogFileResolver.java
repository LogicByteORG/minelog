package org.minelog.core;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

public final class LogFileResolver {
    public static final long MAX_BYTES = 15L * 1024L * 1024L;
    public static final int MAX_LINES = 30000;

    private static final Pattern SAFE_NAME = Pattern.compile("[A-Za-z0-9._-]+");
    private static final int SUGGEST_LIMIT = 5;

    private LogFileResolver() {
    }

    public static File resolve(File logsDir, String input) throws ResolveException {
        String name = input == null ? "" : input.trim();
        if (name.isEmpty()) {
            name = "latest.log";
        }
        if (name.contains("/") || name.contains("\\") || name.contains("..")) {
            throw new ResolveException(Messages.refused("Only a file name inside logs is allowed."));
        }
        if (!SAFE_NAME.matcher(name).matches()) {
            throw new ResolveException(Messages.refused("Only letters, numbers, dots, dashes and underscores."));
        }
        if (name.endsWith(".gz")) {
            throw new ResolveException("Compressed archives are not supported in v1. Share a plain .log file.");
        }
        if (!name.endsWith(".log")) {
            throw new ResolveException(Messages.refused("Only .log files are supported in v1."));
        }
        File file = new File(logsDir, name);
        if (!file.isFile()) {
            throw new ResolveExceptionWithHints(Messages.fileNotFound(name), listLogs(logsDir));
        }
        if (file.length() > MAX_BYTES) {
            throw new ResolveException(Messages.tooLarge());
        }
        try {
            int lines = countLines(file);
            if (lines > MAX_LINES) {
                throw new ResolveException(Messages.tooManyLines());
            }
        } catch (IOException failed) {
            throw new ResolveException(Messages.uploadFailed());
        }
        return file;
    }

    public static List<String> listLogs(File logsDir) {
        File[] files = logsDir.listFiles();
        if (files == null) {
            return Collections.emptyList();
        }
        List<String> names = new ArrayList<String>();
        for (File file : files) {
            if (file.isFile() && file.getName().endsWith(".log")) {
                names.add(file.getName());
            }
        }
        Collections.sort(names);
        if (names.size() > SUGGEST_LIMIT) {
            return names.subList(0, SUGGEST_LIMIT);
        }
        return names;
    }

    private static int countLines(File file) throws IOException {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8));
        try {
            int lines = 0;
            while (reader.readLine() != null) {
                lines++;
                if (lines > MAX_LINES) {
                    return lines;
                }
            }
            return lines;
        } finally {
            reader.close();
        }
    }

    public static class ResolveException extends Exception {
        public ResolveException(String message) {
            super(message);
        }
    }

    public static final class ResolveExceptionWithHints extends ResolveException {
        public final List<String> hints;

        public ResolveExceptionWithHints(String message, List<String> hints) {
            super(message);
            this.hints = hints;
        }
    }
}
