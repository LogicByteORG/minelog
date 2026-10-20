package org.minelog.core;

public final class WebhookInfo {
    public final String handle;
    public final String name;
    public final String kind;
    public final boolean enabled;

    public WebhookInfo(String handle, String name, String kind, boolean enabled) {
        this.handle = handle;
        this.name = name;
        this.kind = kind;
        this.enabled = enabled;
    }
}
