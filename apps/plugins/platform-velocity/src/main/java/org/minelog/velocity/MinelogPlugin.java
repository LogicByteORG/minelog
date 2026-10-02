package org.minelog.velocity;

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.ProxyServer;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Path;
import java.util.Properties;
import java.util.logging.Logger;
import org.minelog.core.MinelogClient;
import org.minelog.core.MinelogConfig;
import org.minelog.core.TokenStore;

@Plugin(
        id = "minelog",
        name = "minelog",
        version = "0.0.0+dev",
        description = "Share proxy logs on minelog.org with a link.",
        authors = {"LogicByte"})
public final class MinelogPlugin {
    private final ProxyServer server;
    private final Logger logger;
    private final Path dataDirectory;
    private MinelogClient client;
    private TokenStore tokens;
    private File logsDir;

    @Inject
    public MinelogPlugin(ProxyServer server, Logger logger, @DataDirectory Path dataDirectory) {
        this.server = server;
        this.logger = logger;
        this.dataDirectory = dataDirectory;
    }

    @Subscribe
    public void onProxyInitialize(ProxyInitializeEvent event) {
        Properties config = loadConfig();
        MinelogConfig parsed = new MinelogConfig(
                config.getProperty("api-base", "https://api.minelog.org"),
                config.getProperty("site-base", "https://minelog.org"),
                parseSeconds(config.getProperty("timeout-seconds", "15")) * 1000,
                config.getProperty("source-name", "minelog Service"));
        client = new MinelogClient(parsed, "minelog-velocity/1.0.0");
        tokens = new TokenStore(dataDirectory.resolve("tokens.properties").toFile());
        logsDir = new File("logs");
        com.velocitypowered.api.command.CommandMeta meta =
                server.getCommandManager().metaBuilder("minelog").aliases("mlog").build();
        server.getCommandManager().register(meta, new ShareCommand(this));
        logger.info("Minelog ready. Use /minelog share to upload logs/latest.log.");
    }

    public ProxyServer server() {
        return server;
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

    private Properties loadConfig() {
        Properties out = new Properties();
        out.setProperty("api-base", "https://api.minelog.org");
        out.setProperty("site-base", "https://minelog.org");
        out.setProperty("timeout-seconds", "15");
        out.setProperty("source-name", "minelog Service");
        try {
            java.nio.file.Files.createDirectories(dataDirectory);
            File file = dataDirectory.resolve("minelog.properties").toFile();
            if (!file.isFile()) {
                OutputStream created = new FileOutputStream(file);
                try {
                    out.store(created, "minelog settings");
                } finally {
                    created.close();
                }
                return out;
            }
            InputStream in = new FileInputStream(file);
            try {
                out.load(in);
            } finally {
                in.close();
            }
        } catch (IOException failed) {
            logger.fine("Using default minelog config: " + failed.getMessage());
        }
        return out;
    }

    private static int parseSeconds(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException bad) {
            return 15;
        }
    }
}
