package org.minelog.core;

import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

public final class MinelogWorker {
    private final ScheduledThreadPoolExecutor executor;
    private final Logger logger;

    public MinelogWorker(Logger logger) {
        this.logger = logger;
        this.executor = new ScheduledThreadPoolExecutor(2, new ThreadFactory() {
            private int count;

            @Override
            public synchronized Thread newThread(Runnable task) {
                Thread thread = new Thread(task, "minelog-worker-" + (++count));
                thread.setDaemon(true);
                return thread;
            }
        });
        this.executor.setRemoveOnCancelPolicy(true);
    }

    public void submit(Runnable task) {
        try {
            executor.execute(guarded(task));
        } catch (RuntimeException rejected) {
            logger.log(Level.FINE, "Background task refused.", rejected);
        }
    }

    public ScheduledFuture<?> every(long periodMillis, Runnable task) {
        return executor.scheduleWithFixedDelay(
                guarded(task), periodMillis, periodMillis, TimeUnit.MILLISECONDS);
    }

    public void shutdown() {
        executor.shutdownNow();
    }

    private Runnable guarded(final Runnable task) {
        return new Runnable() {
            @Override
            public void run() {
                try {
                    task.run();
                } catch (RuntimeException failed) {
                    logger.log(Level.FINE, "Background task failed.", failed);
                }
            }
        };
    }
}
