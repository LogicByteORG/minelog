package org.minelog.bukkit;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ScheduledFuture;
import java.util.function.Consumer;
import java.util.logging.Level;
import org.bstats.bukkit.Metrics;
import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;
import org.minelog.core.ConnectResult;
import org.minelog.core.ErrorBlock;
import org.minelog.core.EventMessage;
import org.minelog.core.LogWatcher;
import org.minelog.core.MinelogApiException;
import org.minelog.core.MinelogClient;
import org.minelog.core.MinelogConfig;
import org.minelog.core.MinelogConnection;
import org.minelog.core.MinelogWorker;
import org.minelog.core.Messages;
import org.minelog.core.ServerInfo;
import org.minelog.core.TokenStore;
import org.minelog.core.UploadResult;

public final class MinelogPlugin extends JavaPlugin {
    private static final int BSTATS_PLUGIN_ID = 34710;
    private static final long RETRY_MILLIS = 60_000L;
    private static final long WATCH_MILLIS = 2_000L;
    private static final long WARN_EVERY_MILLIS = 300_000L;

    private static final long FAILED_SIGNAL_GAP_MILLIS = 30_000L;

    /** Something worth telling Skript about. Delivered on a worker thread. */
    public static final class Signal {
        public static final String CONNECTED = "connected";
        public static final String DISCONNECTED = "disconnected";
        public static final String SHARED = "shared";
        public static final String FAILED = "failed";

        public final String kind;
        public final UploadResult upload;
        public final String reason;

        Signal(String kind, UploadResult upload, String reason) {
            this.kind = kind;
            this.upload = upload;
            this.reason = reason;
        }
    }

    private final List<Consumer<ErrorBlock>> errorListeners = new CopyOnWriteArrayList<Consumer<ErrorBlock>>();
    private final List<Consumer<Signal>> signalListeners = new CopyOnWriteArrayList<Consumer<Signal>>();

    private volatile MinelogClient client;
    private volatile MinelogConnection connection;
    private volatile MinelogConfig settings;
    private volatile boolean alertsOn;
    private volatile long lastWarning;
    private volatile long lastFailedSignal;
    private Object skriptHook;
    private volatile UploadResult lastUpload;
    private MinelogWorker worker;
    private TokenStore tokens;
    private TokenStore keys;
    private LogCommand logCommand;
    private ShareCommand shareCommand;
    private LogWatcher watcher;
    private ScheduledFuture<?> watchTask;
    private ScheduledFuture<?> retryTask;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        worker = new MinelogWorker(getLogger());
        tokens = new TokenStore(new File(getDataFolder(), "tokens.properties"));
        keys = new TokenStore(
                new File(getDataFolder(), "connection.properties"),
                "minelog server key. Keep this file private.");

        shareCommand = new ShareCommand(this);
        getCommand("minelog").setExecutor(shareCommand);
        getCommand("minelog").setTabCompleter(shareCommand);
        applySettings();
        connectInBackground(true);

        new Metrics(this, BSTATS_PLUGIN_ID);
        enableSkript();

        getLogger().info("Minelog ready. Use /minelog share to upload logs/latest.log.");
    }

    @Override
    public void onDisable() {
        disableSkript();
        announceStop();
        stopWatching();
        cancelRetry();
        worker.shutdown();
        LogCommand.unregister(logCommand);
        logCommand = null;
    }

    /** Adds the minelog syntax to Skript when it is installed. Reflection keeps Skript classes out of reach otherwise. */
    private void enableSkript() {
        if (getServer().getPluginManager().getPlugin("Skript") == null) {
            return;
        }
        try {
            Class<?> type = Class.forName("org.minelog.skript.SkriptHook");
            skriptHook = type.getConstructor(MinelogPlugin.class).newInstance(this);
            type.getMethod("enable").invoke(skriptHook);
            getLogger().info("Skript found. The minelog syntax is ready.");
        } catch (Throwable failed) {
            skriptHook = null;
            getLogger().log(Level.WARNING, "Could not add the minelog syntax to Skript: " + failed, failed);
        }
    }

    /** What the owner should hear about Skript right after connecting, or null when all is well. */
    private String skriptNotice() {
        if (skriptHook != null) {
            return null;
        }
        return getServer().getPluginManager().getPlugin("Skript") == null
                ? Messages.skriptMissing()
                : Messages.skriptUnavailable();
    }

    private void disableSkript() {
        if (skriptHook == null) {
            return;
        }
        try {
            skriptHook.getClass().getMethod("disable").invoke(skriptHook);
        } catch (Throwable failed) {
            getLogger().log(Level.FINE, "Skript hook did not stop cleanly.", failed);
        }
        skriptHook = null;
    }

    public void reload() {
        reloadConfig();
        stopWatching();
        cancelRetry();
        applySettings();
        connectInBackground(false);
    }

    private void applySettings() {
        MinelogConfig config = new MinelogConfig(
                getConfig().getString("api-base", MinelogConfig.DEFAULT_API_BASE),
                getConfig().getInt("timeout-seconds", 15) * 1000,
                getConfig().getString("source-name", "minelog Service"));
        settings = config;
        client = new MinelogClient(config, "minelog-bukkit/" + getDescription().getVersion());
        connection = new MinelogConnection(client, keys, serverInfo());
        alertsOn = getConfig().getBoolean("alerts", true);

        boolean wantLog = getConfig().getBoolean("log-command", true);
        if (wantLog && logCommand == null) {
            logCommand = LogCommand.register(this, shareCommand);
        } else if (!wantLog && logCommand != null) {
            LogCommand.unregister(logCommand);
            logCommand = null;
        }
    }

    private ServerInfo serverInfo() {
        String name = getServer().getName();
        if ("CraftBukkit".equals(name) && getServer().getVersion().contains("Spigot")) {
            name = "Spigot";
        }
        String version = getServer().getBukkitVersion();
        int dash = version.indexOf('-');
        return new ServerInfo(name, dash > 0 ? version.substring(0, dash) : version, getDescription().getVersion());
    }

    public MinelogClient client() {
        return client;
    }

    public MinelogConnection connection() {
        return connection;
    }

    public MinelogWorker worker() {
        return worker;
    }

    public TokenStore tokens() {
        return tokens;
    }

    public boolean watching() {
        return watchTask != null;
    }

    public void addErrorListener(Consumer<ErrorBlock> listener) {
        errorListeners.add(listener);
    }

    public void removeErrorListener(Consumer<ErrorBlock> listener) {
        errorListeners.remove(listener);
    }

    public void addSignalListener(Consumer<Signal> listener) {
        signalListeners.add(listener);
    }

    public void removeSignalListener(Consumer<Signal> listener) {
        signalListeners.remove(listener);
    }

    private void signal(Signal signal) {
        for (Consumer<Signal> listener : signalListeners) {
            try {
                listener.accept(signal);
            } catch (RuntimeException failed) {
                getLogger().log(Level.FINE, "A signal listener failed.", failed);
            }
        }
    }

    public void signalFailure(String reason) {
        long now = System.currentTimeMillis();
        if (now - lastFailedSignal < FAILED_SIGNAL_GAP_MILLIS) {
            return;
        }
        lastFailedSignal = now;
        signal(new Signal(Signal.FAILED, null, reason));
    }

    public File logsDir() {
        return new File(getDataFolder().getParentFile().getParentFile(), "logs");
    }

    public UploadResult lastUpload() {
        return lastUpload;
    }

    /** Uploads a log file, remembers the delete token and tells listeners. Call off the main thread. */
    public UploadResult uploadLog(File target) throws IOException {
        try {
            UploadResult result = client.upload(target);
            tokens.put(result.id, result.deleteToken);
            lastUpload = result;
            signal(new Signal(Signal.SHARED, result, null));
            return result;
        } catch (IOException failed) {
            signalFailure("Could not upload " + target.getName() + ".");
            throw failed;
        }
    }

    /** Deletes an upload made from this server. Call off the main thread. */
    public void deleteLog(String id) throws IOException {
        String token = tokens.get(id);
        if (token == null || token.isEmpty()) {
            throw new IOException(Messages.deleteFailed());
        }
        client.delete(id, token);
        tokens.remove(id);
    }

    public void authenticate(final CommandSender sender, final String key) {
        worker.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    ConnectResult result = connection.authenticate(key);
                    cancelRetry();
                    sender.sendMessage(Messages.connected(result.serverName, enabledCount(result)));
                    getLogger().info("Connected to minelog as " + result.serverName + ".");
                    signal(new Signal(Signal.CONNECTED, null, null));
                    if (alertsOn) {
                        startWatching();
                        sender.sendMessage(Messages.errorWatchOn());
                    }
                    String skriptNotice = skriptNotice();
                    if (skriptNotice != null) {
                        sender.sendMessage(ChatColor.YELLOW + skriptNotice);
                    }
                } catch (MinelogApiException refused) {
                    sender.sendMessage(Messages.authFailed(refused.getMessage()));
                } catch (IOException failed) {
                    sender.sendMessage(Messages.authFailed(failed.getMessage()));
                }
            }
        });
    }

    public void disconnect() {
        stopWatching();
        cancelRetry();
        boolean was = connection.connected();
        connection.forget();
        if (was) {
            signal(new Signal(Signal.DISCONNECTED, null, null));
        }
    }

    private static int enabledCount(ConnectResult result) {
        int count = 0;
        for (org.minelog.core.WebhookInfo hook : result.webhooks) {
            if (hook.enabled) {
                count++;
            }
        }
        return count;
    }

    private void connectInBackground(final boolean announceStart) {
        if (!connection.hasKey()) {
            return;
        }
        worker.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    ConnectResult result = connection.reconnect();
                    cancelRetry();
                    getLogger().info("Connected to minelog as " + result.serverName + ".");
                    signal(new Signal(Signal.CONNECTED, null, null));
                    if (alertsOn) {
                        startWatching();
                    }
                    if (announceStart && getConfig().getBoolean("notify-start", true)) {
                        send(new EventMessage("start", "Server started", result.serverName + " is online.", "info"));
                    }
                } catch (MinelogApiException refused) {
                    if (refused.isInvalidKey()) {
                        getLogger().warning("The saved minelog key was revoked. Run /minelog auth <key> with a new one.");
                        signal(new Signal(Signal.DISCONNECTED, null, null));
                    } else {
                        getLogger().warning("Could not connect to minelog: " + refused.getMessage());
                        scheduleRetry();
                    }
                } catch (IOException failed) {
                    getLogger().warning("Could not reach minelog, trying again in a minute.");
                    scheduleRetry();
                }
            }
        });
    }

    private synchronized void scheduleRetry() {
        if (retryTask != null) {
            return;
        }
        retryTask = worker.every(RETRY_MILLIS, new Runnable() {
            @Override
            public void run() {
                if (!connection.hasKey() || connection.connected()) {
                    cancelRetry();
                    return;
                }
                connectInBackground(false);
            }
        });
    }

    private synchronized void cancelRetry() {
        if (retryTask != null) {
            retryTask.cancel(false);
            retryTask = null;
        }
    }

    private synchronized void startWatching() {
        if (watchTask != null) {
            return;
        }
        File latest = new File(getDataFolder().getParentFile().getParentFile(), "logs/latest.log");
        watcher = new LogWatcher(latest, new Consumer<ErrorBlock>() {
            @Override
            public void accept(ErrorBlock block) {
                onError(block);
            }
        });
        final LogWatcher active = watcher;
        watchTask = worker.every(WATCH_MILLIS, new Runnable() {
            @Override
            public void run() {
                active.poll();
            }
        });
    }

    private synchronized void stopWatching() {
        if (watchTask != null) {
            watchTask.cancel(false);
            watchTask = null;
        }
        watcher = null;
    }

    private void onError(final ErrorBlock block) {
        for (Consumer<ErrorBlock> listener : errorListeners) {
            try {
                listener.accept(block);
            } catch (RuntimeException failed) {
                getLogger().log(Level.FINE, "An error listener failed.", failed);
            }
        }
        if (!alertsOn || !connection.connected()) {
            return;
        }
        if (!connection.allowAlert(block.summary, System.currentTimeMillis())) {
            return;
        }
        try {
            connection.sendAlert(block, null);
        } catch (MinelogApiException refused) {
            if (refused.isInvalidKey()) {
                getLogger().warning("The minelog key was revoked, alerts are off. Run /minelog auth <key> to turn them on again.");
                disconnect();
                return;
            }
            warnRarely("Could not send an alert: " + refused.getMessage());
            signalFailure("Could not send an alert: " + refused.getMessage());
        } catch (IOException failed) {
            warnRarely("Could not reach minelog to send an alert.");
            signalFailure("Could not reach minelog to send an alert.");
        }
    }

    public void sendAsync(final EventMessage message) {
        if (!connection.connected()) {
            warnRarely(Messages.notConnected());
            return;
        }
        worker.submit(new Runnable() {
            @Override
            public void run() {
                send(message);
            }
        });
    }

    public void alertAsync(final ErrorBlock block, final List<String> webhooks) {
        if (!connection.connected()) {
            warnRarely(Messages.notConnected());
            return;
        }
        worker.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    connection.sendAlert(block, webhooks);
                } catch (MinelogApiException refused) {
                    warnRarely("minelog refused the alert: " + refused.getMessage());
                    signalFailure("minelog refused the alert: " + refused.getMessage());
                } catch (IOException failed) {
                    warnRarely("Could not reach minelog to send the alert.");
                    signalFailure("Could not reach minelog to send the alert.");
                }
            }
        });
    }

    public void send(EventMessage message) {
        try {
            connection.sendEvent(message);
        } catch (MinelogApiException refused) {
            warnRarely("minelog refused the " + message.event + " event: " + refused.getMessage());
            signalFailure("minelog refused the " + message.event + " alert: " + refused.getMessage());
        } catch (IOException failed) {
            warnRarely("Could not reach minelog to send the " + message.event + " event.");
            signalFailure("Could not reach minelog to send the " + message.event + " alert.");
        }
    }

    private void warnRarely(String text) {
        long now = System.currentTimeMillis();
        if (now - lastWarning < WARN_EVERY_MILLIS) {
            return;
        }
        lastWarning = now;
        getLogger().warning(text);
    }

    private void announceStop() {
        if (connection == null || !connection.connected() || !getConfig().getBoolean("notify-stop", true)) {
            return;
        }
        MinelogConfig quick = new MinelogConfig(settings.apiBase, 3000, settings.source);
        MinelogConnection fast = new MinelogConnection(
                new MinelogClient(quick, "minelog-bukkit/" + getDescription().getVersion()), keys, serverInfo());
        try {
            fast.sendEvent(new EventMessage("stop", "Server stopped", connection.serverName() + " shut down.", "info"));
        } catch (IOException ignored) {
            getLogger().fine("The stop notice did not reach minelog.");
        }
    }

    public void runAsync(Runnable task) {
        if (tryFoliaAsync(task)) {
            return;
        }
        getServer().getScheduler().runTaskAsynchronously(this, task);
    }

    private boolean tryFoliaAsync(Runnable task) {
        try {
            Method asyncScheduler = getServer().getClass().getMethod("getAsyncScheduler");
            Object scheduler = asyncScheduler.invoke(getServer());
            Method runNow = scheduler.getClass().getMethod("runNow", org.bukkit.plugin.Plugin.class,
                    java.util.function.Consumer.class);
            final Runnable work = task;
            Object consumer = (java.util.function.Consumer<Object>) tick -> work.run();
            runNow.invoke(scheduler, this, consumer);
            return true;
        } catch (NoSuchMethodException missing) {
            return false;
        } catch (Exception failed) {
            getLogger().log(Level.FINE, "Folia scheduler not used, falling back to Bukkit.", failed);
            return false;
        }
    }
}
