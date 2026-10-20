package org.minelog.skript;

public final class AlertKind {
    public static final String[] EVENTS = {"custom", "tps", "crash", "start", "stop"};
    public static final String[] LEVELS = {"", "info", "warning", "error"};

    private static final int LEVEL_BITS = 7;
    private static final int TYPE_SHIFT = 3;

    private AlertKind() {
    }

    public static String event(int mark) {
        int index = (mark >> TYPE_SHIFT) % EVENTS.length;
        return EVENTS[index];
    }

    public static String level(int mark) {
        int index = mark & LEVEL_BITS;
        return index < LEVELS.length && !LEVELS[index].isEmpty() ? LEVELS[index] : null;
    }

    public static String defaultLevel(String event) {
        if ("tps".equals(event)) {
            return "warning";
        }
        if ("crash".equals(event)) {
            return "error";
        }
        return "info";
    }
}
