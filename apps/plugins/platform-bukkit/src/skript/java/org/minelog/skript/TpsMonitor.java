package org.minelog.skript;

import org.bukkit.Bukkit;
import org.bukkit.plugin.Plugin;
import org.bukkit.scheduler.BukkitTask;

public final class TpsMonitor implements Runnable {
    private static final int SAMPLE_TICKS = 100;
    private static final double FULL_SPEED = 20.0;

    private static volatile double current = FULL_SPEED;

    private BukkitTask task;
    private int ticks;
    private long since;

    public static double current() {
        return current;
    }

    public void start(Plugin plugin) {
        since = System.nanoTime();
        task = Bukkit.getScheduler().runTaskTimer(plugin, this, 1L, 1L);
    }

    public void stop() {
        if (task != null) {
            task.cancel();
            task = null;
        }
        current = FULL_SPEED;
    }

    @Override
    public void run() {
        ticks++;
        if (ticks < SAMPLE_TICKS) {
            return;
        }
        long now = System.nanoTime();
        double seconds = (now - since) / 1_000_000_000.0;
        since = now;
        int counted = ticks;
        ticks = 0;
        double measured = seconds <= 0 ? FULL_SPEED : counted / seconds;
        current = Math.min(FULL_SPEED, Math.round(measured * 100.0) / 100.0);
        Bukkit.getPluginManager().callEvent(new MinelogTpsEvent(current));
    }
}
