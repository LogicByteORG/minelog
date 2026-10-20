package org.minelog.core;

public final class MinelogConfig {
    public static final String DEFAULT_API_BASE = "https://api.minelog.org";

    public final String apiBase;
    public final int timeoutMs;
    public final String source;

    public MinelogConfig(String apiBase, int timeoutMs, String source) {
        this.apiBase = trim(apiBase, DEFAULT_API_BASE);
        this.timeoutMs = timeoutMs <= 0 ? 15000 : timeoutMs;
        this.source = source == null || source.isEmpty() ? "minelog Service" : source;
    }

    public static MinelogConfig defaults(String source) {
        return new MinelogConfig(
                DEFAULT_API_BASE,
                15000,
                source);
    }

    private static String trim(String value, String fallback) {
        if (value == null || value.isEmpty()) {
            return fallback;
        }
        String out = value.trim();
        while (out.endsWith("/")) {
            out = out.substring(0, out.length() - 1);
        }
        return out.isEmpty() ? fallback : out;
    }
}
