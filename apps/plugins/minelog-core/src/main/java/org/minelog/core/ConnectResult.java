package org.minelog.core;

import java.util.Collections;
import java.util.List;

public final class ConnectResult {
    public final String serverName;
    public final List<String> events;
    public final List<WebhookInfo> webhooks;
    public final int eventsPerMinute;

    public ConnectResult(
            String serverName,
            List<String> events,
            List<WebhookInfo> webhooks,
            int eventsPerMinute) {
        this.serverName = serverName;
        this.events = Collections.unmodifiableList(events);
        this.webhooks = Collections.unmodifiableList(webhooks);
        this.eventsPerMinute = eventsPerMinute;
    }

    public List<String> handles() {
        List<String> out = new java.util.ArrayList<String>();
        for (WebhookInfo webhook : webhooks) {
            out.add(webhook.handle);
        }
        return out;
    }
}
