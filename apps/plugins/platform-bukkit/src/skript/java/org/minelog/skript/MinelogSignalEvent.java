package org.minelog.skript;

import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;
import org.minelog.core.UploadResult;

public final class MinelogSignalEvent extends Event {
    public static final String[] KINDS = {"connected", "disconnected", "shared", "failed"};

    private static final HandlerList HANDLERS = new HandlerList();

    private final String kind;
    private final UploadResult upload;
    private final String reason;

    public MinelogSignalEvent(String kind, UploadResult upload, String reason) {
        this.kind = kind;
        this.upload = upload;
        this.reason = reason;
    }

    public String getKind() {
        return kind;
    }

    public UploadResult getUpload() {
        return upload;
    }

    public String getReason() {
        return reason;
    }

    @Override
    public HandlerList getHandlers() {
        return HANDLERS;
    }

    public static HandlerList getHandlerList() {
        return HANDLERS;
    }
}
