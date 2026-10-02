package org.minelog.bukkit;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.minelog.core.LogFileResolver;
import org.minelog.core.Messages;
import org.minelog.core.UploadResult;

public final class ShareCommand implements CommandExecutor, TabCompleter {
    private final MinelogPlugin plugin;

    public ShareCommand(MinelogPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("share")) {
            String fileArg = args.length >= 2 ? args[1] : null;
            if (!sender.hasPermission("minelog.share")) {
                sender.sendMessage(ChatColor.RED + Messages.noPermission());
                return true;
            }
            share(sender, fileArg);
            return true;
        }
        if (args[0].equalsIgnoreCase("delete")) {
            if (!sender.hasPermission("minelog.delete")) {
                sender.sendMessage(ChatColor.RED + Messages.noPermission());
                return true;
            }
            if (args.length < 2) {
                sender.sendMessage(ChatColor.RED + Messages.needFileName());
                return true;
            }
            delete(sender, args[1]);
            return true;
        }
        sender.sendMessage(ChatColor.RED + Messages.usage());
        return true;
    }

    private void share(final CommandSender sender, final String fileArg) {
        final File logsDir = new File(plugin.getDataFolder().getParentFile().getParentFile(), "logs");
        final File target;
        try {
            target = LogFileResolver.resolve(logsDir, fileArg);
        } catch (LogFileResolver.ResolveExceptionWithHints missing) {
            sender.sendMessage(ChatColor.RED + missing.getMessage());
            if (!missing.hints.isEmpty()) {
                sender.sendMessage(ChatColor.GRAY + "Try one of these: " + join(missing.hints));
            }
            return;
        } catch (LogFileResolver.ResolveException refused) {
            sender.sendMessage(ChatColor.RED + refused.getMessage());
            return;
        }
        sender.sendMessage(ChatColor.YELLOW + Messages.uploading(target.getName()));
        plugin.runAsync(() -> {
            try {
                UploadResult result = plugin.client().upload(target);
                plugin.tokens().put(result.id, result.deleteToken);
                sendResult(sender, result);
            } catch (Exception failed) {
                plugin.getLogger().fine("Upload failed: " + failed.getMessage());
                sender.sendMessage(ChatColor.RED + Messages.uploadFailed());
            }
        });
    }

    private void delete(final CommandSender sender, final String id) {
        final String token = plugin.tokens().get(id);
        if (token == null || token.isEmpty()) {
            sender.sendMessage(ChatColor.RED + Messages.deleteFailed());
            return;
        }
        plugin.runAsync(() -> {
            try {
                plugin.client().delete(id, token);
                plugin.tokens().remove(id);
                sender.sendMessage(ChatColor.GREEN + Messages.deleted(id));
            } catch (Exception failed) {
                plugin.getLogger().fine("Delete failed: " + failed.getMessage());
                sender.sendMessage(ChatColor.RED + Messages.deleteFailed());
            }
        });
    }

    private void sendResult(CommandSender sender, UploadResult result) {
        if (sender instanceof Player) {
            Player player = (Player) sender;
            player.sendMessage("");
            TextComponent head = new TextComponent("Your log is ready!");
            head.setColor(net.md_5.bungee.api.ChatColor.GREEN);
            player.spigot().sendMessage(head);
            TextComponent link = new TextComponent(result.url);
            link.setColor(net.md_5.bungee.api.ChatColor.AQUA);
            link.setUnderlined(true);
            link.setClickEvent(new ClickEvent(ClickEvent.Action.OPEN_URL, result.url));
            player.spigot().sendMessage(link);
            if (result.problemCount >= 0) {
                TextComponent problems = new TextComponent(
                        Messages.problems(result.problemCount, result.url));
                problems.setColor(net.md_5.bungee.api.ChatColor.YELLOW);
                player.spigot().sendMessage(problems);
            }
            TextComponent raw = new TextComponent(Messages.rawLine(result.raw));
            raw.setColor(net.md_5.bungee.api.ChatColor.GRAY);
            player.spigot().sendMessage(raw);
            TextComponent remove = new TextComponent(Messages.deleteHint(result.id));
            remove.setColor(net.md_5.bungee.api.ChatColor.GRAY);
            remove.setClickEvent(new ClickEvent(
                    ClickEvent.Action.SUGGEST_COMMAND, "/minelog delete " + result.id));
            player.spigot().sendMessage(remove);
            player.sendMessage("");
            return;
        }
        sender.sendMessage("");
        sender.sendMessage(ChatColor.GREEN + "Your log is ready!");
        sender.sendMessage(ChatColor.AQUA + result.url);
        if (result.problemCount >= 0) {
            sender.sendMessage(ChatColor.YELLOW + Messages.problems(result.problemCount, result.url));
        }
        sender.sendMessage(ChatColor.GRAY + Messages.rawLine(result.raw));
        sender.sendMessage(ChatColor.GRAY + Messages.deleteHint(result.id));
        sender.sendMessage("");
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            return match(args[0], Arrays.asList("share", "delete"));
        }
        if (args.length == 2 && args[0].equalsIgnoreCase("share")) {
            File logsDir = new File(plugin.getDataFolder().getParentFile().getParentFile(), "logs");
            return match(args[1], LogFileResolver.listLogs(logsDir));
        }
        return Collections.emptyList();
    }

    private static List<String> match(String input, List<String> options) {
        String lower = input == null ? "" : input.toLowerCase(Locale.ENGLISH);
        List<String> out = new ArrayList<String>();
        for (String option : options) {
            if (option.toLowerCase(Locale.ENGLISH).startsWith(lower)) {
                out.add(option);
            }
        }
        return out;
    }

    private static String join(List<String> names) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < names.size(); i++) {
            if (i > 0) {
                out.append(", ");
            }
            out.append(names.get(i));
        }
        return out.toString();
    }
}
