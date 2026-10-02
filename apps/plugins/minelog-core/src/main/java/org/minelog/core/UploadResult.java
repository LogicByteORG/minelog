package org.minelog.core;

public final class UploadResult {
    public final String id;
    public final String url;
    public final String raw;
    public final String deleteToken;
    public final String deletableUntil;
    public final int problemCount;

    public UploadResult(
            String id,
            String url,
            String raw,
            String deleteToken,
            String deletableUntil,
            int problemCount) {
        this.id = id;
        this.url = url;
        this.raw = raw;
        this.deleteToken = deleteToken;
        this.deletableUntil = deletableUntil;
        this.problemCount = problemCount;
    }
}
