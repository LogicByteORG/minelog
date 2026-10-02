package org.minelog.bungee;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import net.md_5.bungee.api.plugin.Plugin;
import net.md_5.bungee.config.Configuration;
import net.md_5.bungee.config.ConfigurationProvider;
import net.md_5.bungee.config.YamlConfiguration;
import org.minelog.core.MinelogClient;
import org.minelog.core.MinelogConfig;
import org.minelog.core.TokenStore;

public final class MinelogPlugin extends Plugin {
    private MinelogClient client;
    private TokenStore tokens;
    private File logsDir;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        Map<String, String> values = readConfig();
        MinelogConfig config = new MinelogConfig(
                values.get("api-base"),
                values.get("site-base"),
                parseSeconds(values.get("timeout-seconds")) * 1000,
                values.get("source-name"));
        client = new MinelogClient(config, "minelog-bungee/1.0.0");
        tokens = new TokenStore(new File(getDataFolder(), "tokens.properties"));
        logsDir = new File("logs");
        getProxy().getPluginManager().registerCommand(this, new ShareCommand(this));
        getLogger().info("Minelog ready. Use /minelog share to upload logs/latest.log.");
    }

    public MinelogClient client() {
        return client;
    }

    public TokenStore tokens() {
        return tokens;
    }

    public File logsDir() {
        return logsDir;
    }

    public void runAsync(Runnable task) {
        getProxy().getScheduler().runAsync(this, task);
    }

    private void saveDefaultConfig() {
        if (!getDataFolder().exists()) {
            getDataFolder().mkdirs();
        }
        File out = new File(getDataFolder(), "config.yml");
        if (out.isFile()) {
            return;
        }
        InputStream in = getResourceAsStream("config.yml");
        if (in == null) {
            return;
        }
        try {
            java.nio.file.Files.copy(in, out.toPath());
        } catch (Exception ignored) {
            // Admin can create the file by hand.
        } finally {
            try {
                in.close();
            } catch (Exception ignored) {
                // Nothing to do.
            }
        }
    }

    private Map<String, String> readConfig() {
        Map<String, String> values = new HashMap<String, String>();
        values.put("api-base", "https://api.minelog.org");
        values.put("site-base", "https://minelog.org");
        values.put("timeout-seconds", "15");
        values.put("source-name", "minelog Service");
        try {
            Configuration loaded = ConfigurationProvider.getProvider(YamlConfiguration.class)
                    .load(new FileInputStream(new File(getDataFolder(), "config.yml")));
            for (String key : values.keySet().toArray(new String[0])) {
                String read = loaded.getString(key, values.get(key));
                values.put(key, read);
            }
        } catch (Exception ignored) {
            // Defaults above stay in place.
        }
        return values;
    }

    private static int parseSeconds(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException bad) {
            return 15;
        }
    }
}
