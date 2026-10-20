package org.minelog.core;

public final class ServerInfo {
    public final String software;
    public final String version;
    public final String pluginVersion;

    public ServerInfo(String software, String version, String pluginVersion) {
        this.software = software;
        this.version = version;
        this.pluginVersion = pluginVersion;
    }

    String toJson() {
        return "{\"software\":" + quoteOrNull(software)
                + ",\"version\":" + quoteOrNull(version)
                + ",\"pluginVersion\":" + quoteOrNull(pluginVersion) + "}";
    }

    private static String quoteOrNull(String value) {
        return value == null || value.isEmpty() ? "null" : MinelogClient.quote(value);
    }
}
