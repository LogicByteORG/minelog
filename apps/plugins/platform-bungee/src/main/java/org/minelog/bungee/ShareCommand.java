package org.minelog.bungee;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import net.md_5.bungee.api.ChatColor;
import net.md_5.bungee.api.CommandSender;
import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.TextComponent;
import net.md_5.bungee.api.connection.ProxiedPlayer;
import net.md_5.bungee.api.plugin.Command;
import net.md_5.bungee.api.plugin.TabExecutor;
import org.minelog.core.LogFileResolver;
import org.minelog.core.Messages;
import org.minelog.core.UploadResult;

public final class ShareCommand extends Command implements TabExecutor {
    private final MinelogPlugin plugin;

    public ShareCommand(MinelogPlugin plugin) {
        super("minelog", "minelog.share", "mlog");
        this.plugin = plugin;
    }

    @Override
    public void execute(CommandSender sender, String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("share")) {
            if (!sender.hasPermission("minelog.share")) {
                say(sender, ChatColor.RED + Messages.noPermission());
                return;
            }
            share(sender, args.length >= 2 ? args[1] : null);
            return;
        }
        if (args[0].equalsIgnoreCase("delete")) {
            if (!sender.hasPermission("minelog.delete")) {
                say(sender, ChatColor.RED + Messages.noPermission());
                return;
            }
            if (args.length < 2) {
                say(sender, ChatColor.RED + Messages.needFileName());
                return;
            }
            delete(sender, args[1]);
            return;
        }
        say(sender, ChatColor.RED + Messages.usage());
    }

    private void share(final CommandSender sender, final String fileArg) {
        final File target;
        try {
            target = LogFileResolver.resolve(plugin.logsDir(), fileArg);
        } catch (LogFileResolver.ResolveExceptionWithHints missing) {
            say(sender, ChatColor.RED + missing.getMessage());
            if (!missing.hints.isEmpty()) {
                say(sender, ChatColor.GRAY + "Try one of these: " + join(missing.hints));
            }
            return;
        } catch (LogFileResolver.ResolveException refused) {
            say(sender, ChatColor.RED + refused.getMessage());
            return;
        }
        say(sender, ChatColor.YELLOW + Messages.uploading(target.getName()));
        plugin.runAsync(() -> {
            try {
                UploadResult result = plugin.client().upload(target);
                plugin.tokens().put(result.id, result.deleteToken);
                sendResult(sender, result);
            } catch (Exception failed) {
                plugin.getLogger().fine("Upload failed: " + failed.getMessage());
                say(sender, ChatColor.RED + Messages.uploadFailed());
            }
        });
    }

    private void delete(final CommandSender sender, final String id) {
        final String token = plugin.tokens().get(id);
        if (token == null || token.isEmpty()) {
            say(sender, ChatColor.RED + Messages.deleteFailed());
            return;
        }
        plugin.runAsync(() -> {
            try {
                plugin.client().delete(id, token);
                plugin.tokens().remove(id);
                say(sender, ChatColor.GREEN + Messages.deleted(id));
            } catch (Exception failed) {
                plugin.getLogger().fine("Delete failed: " + failed.getMessage());
                say(sender, ChatColor.RED + Messages.deleteFailed());
            }
        });
    }

    private static void sendResult(CommandSender sender, UploadResult result) {
        if (sender instanceof ProxiedPlayer) {
            ProxiedPlayer player = (ProxiedPlayer) sender;
            player.sendMessage(new TextComponent(""));
            TextComponent head = new TextComponent("Your log is ready!");
            head.setColor(ChatColor.GREEN);
            player.sendMessage(head);
            TextComponent link = new TextComponent(result.url);
            link.setColor(ChatColor.AQUA);
            link.setUnderlined(true);
            link.setClickEvent(new ClickEvent(ClickEvent.Action.OPEN_URL, result.url));
            player.sendMessage(link);
            if (result.problemCount >= 0) {
                TextComponent problems = new TextComponent(
                        Messages.problems(result.problemCount, result.url));
                problems.setColor(ChatColor.YELLOW);
                player.sendMessage(problems);
            }
            TextComponent raw = new TextComponent(Messages.rawLine(result.raw));
            raw.setColor(ChatColor.GRAY);
            player.sendMessage(raw);
            TextComponent remove = new TextComponent(Messages.deleteHint(result.id));
            remove.setColor(ChatColor.GRAY);
            remove.setClickEvent(new ClickEvent(
                    ClickEvent.Action.SUGGEST_COMMAND, "/minelog delete " + result.id));
            player.sendMessage(remove);
            player.sendMessage(new TextComponent(""));
            return;
        }
        say(sender, "");
        say(sender, ChatColor.GREEN + "Your log is ready!");
        say(sender, ChatColor.AQUA + result.url);
        if (result.problemCount >= 0) {
            say(sender, ChatColor.YELLOW + Messages.problems(result.problemCount, result.url));
        }
        say(sender, ChatColor.GRAY + Messages.rawLine(result.raw));
        say(sender, ChatColor.GRAY + Messages.deleteHint(result.id));
        say(sender, "");
    }

    private static void say(CommandSender sender, String text) {
        sender.sendMessage(new TextComponent(text));
    }

    @Override
    public Iterable<String> onTabComplete(CommandSender sender, String[] args) {
        List<String> out = new ArrayList<String>();
        if (args.length == 1) {
            match(args[0], new String[] {"share", "delete"}, out);
            return out;
        }
        if (args.length == 2 && args[0].equalsIgnoreCase("share")) {
            for (String name : LogFileResolver.listLogs(plugin.logsDir())) {
                if (name.toLowerCase(Locale.ENGLISH).startsWith(args[1].toLowerCase(Locale.ENGLISH))) {
                    out.add(name);
                }
            }
        }
        return out;
    }

    private static void match(String input, String[] options, List<String> out) {
        String lower = input == null ? "" : input.toLowerCase(Locale.ENGLISH);
        for (String option : options) {
            if (option.startsWith(lower)) {
                out.add(option);
            }
        }
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
