package org.minelog.skript;

public final class TpsGate {
    public static final double DEFAULT_THRESHOLD = 15.0;
    public static final double RECOVERY = 1.0;

    private final double threshold;
    private boolean low;

    public TpsGate(double threshold) {
        this.threshold = threshold;
    }

    public boolean drops(double tps) {
        if (!low && tps < threshold) {
            low = true;
            return true;
        }
        if (low && tps >= threshold + RECOVERY) {
            low = false;
        }
        return false;
    }
}
