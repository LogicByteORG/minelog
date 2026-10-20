package org.minelog.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class EventMessage {
    public final String event;
    public final String title;
    public final String message;
    public final String level;
    public final Map<String, String> fields = new LinkedHashMap<String, String>();
    public final List<String> webhooks = new ArrayList<String>();

    public EventMessage(String event, String title, String message, String level) {
        this.event = event;
        this.title = title;
        this.message = message;
        this.level = level;
    }

    public EventMessage field(String name, String value) {
        if (name != null && value != null) {
            fields.put(name, value);
        }
        return this;
    }

    public EventMessage to(List<String> handles) {
        if (handles != null) {
            webhooks.addAll(handles);
        }
        return this;
    }

    String toJson() {
        StringBuilder out = new StringBuilder("{\"event\":").append(MinelogClient.quote(event));
        if (title != null && !title.isEmpty()) {
            out.append(",\"title\":").append(MinelogClient.quote(title));
        }
        if (message != null && !message.isEmpty()) {
            out.append(",\"message\":").append(MinelogClient.quote(message));
        }
        if (level != null && !level.isEmpty()) {
            out.append(",\"level\":").append(MinelogClient.quote(level));
        }
        if (!fields.isEmpty()) {
            out.append(",\"fields\":{");
            boolean first = true;
            for (Map.Entry<String, String> field : fields.entrySet()) {
                if (!first) {
                    out.append(',');
                }
                first = false;
                out.append(MinelogClient.quote(field.getKey())).append(':')
                        .append(MinelogClient.quote(field.getValue()));
            }
            out.append('}');
        }
        appendWebhooks(out, webhooks);
        return out.append('}').toString();
    }

    static void appendWebhooks(StringBuilder out, List<String> handles) {
        if (handles == null || handles.isEmpty()) {
            return;
        }
        out.append(",\"webhooks\":[");
        for (int i = 0; i < handles.size(); i++) {
            if (i > 0) {
                out.append(',');
            }
            out.append(MinelogClient.quote(handles.get(i)));
        }
        out.append(']');
    }
}
