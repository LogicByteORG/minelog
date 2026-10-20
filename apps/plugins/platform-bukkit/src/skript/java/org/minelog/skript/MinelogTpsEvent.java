package org.minelog.skript;

import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;

public final class MinelogTpsEvent extends Event {
    private static final HandlerList HANDLERS = new HandlerList();

    private final double tps;

    public MinelogTpsEvent(double tps) {
        this.tps = tps;
    }

    public double getTps() {
        return tps;
    }

    @Override
    public HandlerList getHandlers() {
        return HANDLERS;
    }

    public static HandlerList getHandlerList() {
        return HANDLERS;
    }
}
