package org.minelog.bukkit;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandMap;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;

/**
 * The short {@code /log} command. It is registered at runtime instead of in
 * plugin.yml so the {@code log-command} setting can switch it off completely,
 * and so it never shadows another plugin's {@code /log} when disabled.
 */
final class LogCommand extends Command {
    private final MinelogPlugin plugin;
    private final CommandExecutor executor;
    private final TabCompleter completer;

    LogCommand(MinelogPlugin plugin, ShareCommand delegate) {
        super("log", "Share a log on minelog.org.", "/log [share|delete]",
                java.util.Collections.<String>emptyList());
        this.plugin = plugin;
        this.executor = delegate;
        this.completer = delegate;
        setPermission("minelog.share");
    }

    @Override
    public boolean execute(CommandSender sender, String label, String[] args) {
        if (!plugin.isEnabled()) {
            return false;
        }
        return executor.onCommand(sender, this, label, args);
    }

    @Override
    public List<String> tabComplete(CommandSender sender, String alias, String[] args) {
        List<String> options = completer.onTabComplete(sender, this, alias, args);
        return options == null ? java.util.Collections.<String>emptyList() : options;
    }

    static LogCommand register(MinelogPlugin plugin, ShareCommand delegate) {
        CommandMap map = commandMap();
        if (map == null) {
            plugin.getLogger().warning("Could not find the command map, so /log is unavailable. "
                    + "/minelog still works.");
            return null;
        }
        LogCommand command = new LogCommand(plugin, delegate);
        map.register("minelog", command);
        return command;
    }

    static void unregister(LogCommand command) {
        CommandMap map = commandMap();
        if (map == null || command == null) {
            return;
        }
        try {
            Field known = findKnownCommands(map.getClass());
            if (known == null) {
                return;
            }
            known.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<String, Command> commands = (Map<String, Command>) known.get(map);
            Iterator<Map.Entry<String, Command>> entries = commands.entrySet().iterator();
            while (entries.hasNext()) {
                if (entries.next().getValue() == command) {
                    entries.remove();
                }
            }
            command.unregister(map);
        } catch (Exception ignored) {
            // The server is shutting down or the field moved. Nothing to clean up that matters.
        }
    }

    private static Field findKnownCommands(Class<?> type) {
        for (Class<?> c = type; c != null; c = c.getSuperclass()) {
            try {
                return c.getDeclaredField("knownCommands");
            } catch (NoSuchFieldException next) {
                // keep walking up
            }
        }
        return null;
    }

    private static CommandMap commandMap() {
        Object server = Bukkit.getServer();
        try {
            Method getter = server.getClass().getMethod("getCommandMap");
            return (CommandMap) getter.invoke(server);
        } catch (Exception noGetter) {
            try {
                Field field = server.getClass().getDeclaredField("commandMap");
                field.setAccessible(true);
                return (CommandMap) field.get(server);
            } catch (Exception missing) {
                return null;
            }
        }
    }
}
