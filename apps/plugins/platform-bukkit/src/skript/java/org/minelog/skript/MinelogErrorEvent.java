package org.minelog.skript;

import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;

public final class MinelogErrorEvent extends Event {
    private static final HandlerList HANDLERS = new HandlerList();

    private final String summary;
    private final String text;

    public MinelogErrorEvent(String summary, String text) {
        this.summary = summary;
        this.text = text;
    }

    public String getSummary() {
        return summary;
    }

    public String getText() {
        return text;
    }

    @Override
    public HandlerList getHandlers() {
        return HANDLERS;
    }

    public static HandlerList getHandlerList() {
        return HANDLERS;
    }
}
