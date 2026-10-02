package org.minelog.core;

public final class MinelogConfig {
    public final String apiBase;
    public final String siteBase;
    public final int timeoutMs;
    public final String source;

    public MinelogConfig(String apiBase, String siteBase, int timeoutMs, String source) {
        this.apiBase = trim(apiBase, "https://api.minelog.org");
        this.siteBase = trim(siteBase, "https://minelog.org");
        this.timeoutMs = timeoutMs <= 0 ? 15000 : timeoutMs;
        this.source = source == null || source.isEmpty() ? "minelog Service" : source;
    }

    public static MinelogConfig defaults(String source) {
        return new MinelogConfig(
                "https://api.minelog.org",
                "https://minelog.org",
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
