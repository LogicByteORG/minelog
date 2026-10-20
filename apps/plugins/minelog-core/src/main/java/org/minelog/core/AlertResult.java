package org.minelog.core;

public final class AlertResult {
    public final String id;
    public final int occurrences;
    public final boolean isNew;

    public AlertResult(String id, int occurrences, boolean isNew) {
        this.id = id;
        this.occurrences = occurrences;
        this.isNew = isNew;
    }
}
