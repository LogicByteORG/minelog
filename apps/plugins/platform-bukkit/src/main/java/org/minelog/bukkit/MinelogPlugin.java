package org.minelog.bukkit;

import java.lang.reflect.Method;
import java.util.logging.Level;
import org.bukkit.plugin.java.JavaPlugin;
import org.minelog.core.MinelogClient;
import org.minelog.core.MinelogConfig;
import org.minelog.core.TokenStore;

public final class MinelogPlugin extends JavaPlugin {
    private MinelogClient client;
    private TokenStore tokens;
    private MinelogConfig config;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        config = new MinelogConfig(
                getConfig().getString("api-base", "https://api.minelog.org"),
                getConfig().getString("site-base", "https://minelog.org"),
                getConfig().getInt("timeout-seconds", 15) * 1000,
                getConfig().getString("source-name", "minelog Service"));
        client = new MinelogClient(config, "minelog-bukkit/1.0.0");
        tokens = new TokenStore(new java.io.File(getDataFolder(), "tokens.properties"));

        ShareCommand command = new ShareCommand(this);
        getCommand("minelog").setExecutor(command);
        getCommand("minelog").setTabCompleter(command);
        getLogger().info("Minelog ready. Use /minelog share to upload logs/latest.log.");
    }

    public MinelogClient client() {
        return client;
    }

    public TokenStore tokens() {
        return tokens;
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
