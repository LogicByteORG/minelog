package org.minelog.velocity;

import com.velocitypowered.api.command.SimpleCommand;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.event.ClickEvent;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextDecoration;
import org.minelog.core.LogFileResolver;
import org.minelog.core.Messages;
import org.minelog.core.UploadResult;

public final class ShareCommand implements SimpleCommand {
    private final MinelogPlugin plugin;

    public ShareCommand(MinelogPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public void execute(Invocation invocation) {
        String[] args = invocation.arguments();
        if (args.length == 0 || args[0].equalsIgnoreCase("share")) {
            if (!invocation.source().hasPermission("minelog.share")) {
                invocation.source().sendMessage(Component.text(Messages.noPermission(), NamedTextColor.RED));
                return;
            }
            share(invocation, args.length >= 2 ? args[1] : null);
            return;
        }
        if (args[0].equalsIgnoreCase("delete")) {
            if (!invocation.source().hasPermission("minelog.delete")) {
                invocation.source().sendMessage(Component.text(Messages.noPermission(), NamedTextColor.RED));
                return;
            }
            if (args.length < 2) {
                invocation.source().sendMessage(Component.text(Messages.needFileName(), NamedTextColor.RED));
                return;
            }
            delete(invocation, args[1]);
            return;
        }
        invocation.source().sendMessage(Component.text(Messages.usage(), NamedTextColor.RED));
    }

    private void share(final Invocation invocation, final String fileArg) {
        final File target;
        try {
            target = LogFileResolver.resolve(plugin.logsDir(), fileArg);
        } catch (LogFileResolver.ResolveExceptionWithHints missing) {
            invocation.source().sendMessage(Component.text(missing.getMessage(), NamedTextColor.RED));
            if (!missing.hints.isEmpty()) {
                invocation.source().sendMessage(Component.text(
                        "Try one of these: " + join(missing.hints), NamedTextColor.GRAY));
            }
            return;
        } catch (LogFileResolver.ResolveException refused) {
            invocation.source().sendMessage(Component.text(refused.getMessage(), NamedTextColor.RED));
            return;
        }
        invocation.source().sendMessage(
                Component.text(Messages.uploading(target.getName()), NamedTextColor.YELLOW));
        plugin.server().getScheduler()
                .buildTask(plugin, () -> {
                    try {
                        UploadResult result = plugin.client().upload(target);
                        plugin.tokens().put(result.id, result.deleteToken);
                        sendResult(invocation, result);
                    } catch (Exception failed) {
                        invocation.source().sendMessage(
                                Component.text(Messages.uploadFailed(), NamedTextColor.RED));
                    }
                })
                .schedule();
    }

    private void delete(final Invocation invocation, final String id) {
        final String token = plugin.tokens().get(id);
        if (token == null || token.isEmpty()) {
            invocation.source().sendMessage(Component.text(Messages.deleteFailed(), NamedTextColor.RED));
            return;
        }
        plugin.server().getScheduler()
                .buildTask(plugin, () -> {
                    try {
                        plugin.client().delete(id, token);
                        plugin.tokens().remove(id);
                        invocation.source().sendMessage(
                                Component.text(Messages.deleted(id), NamedTextColor.GREEN));
                    } catch (Exception failed) {
                        invocation.source().sendMessage(
                                Component.text(Messages.deleteFailed(), NamedTextColor.RED));
                    }
                })
                .schedule();
    }

    private static void sendResult(Invocation invocation, UploadResult result) {
        invocation.source().sendMessage(Component.empty());
        invocation.source().sendMessage(Component.text("Your log is ready!", NamedTextColor.GREEN));
        invocation.source().sendMessage(Component.text(result.url, NamedTextColor.AQUA)
                .decorate(TextDecoration.UNDERLINED)
                .clickEvent(ClickEvent.openUrl(result.url)));
        if (result.problemCount >= 0) {
            invocation.source().sendMessage(Component.text(
                    Messages.problems(result.problemCount, result.url), NamedTextColor.YELLOW));
        }
        invocation.source().sendMessage(
                Component.text(Messages.rawLine(result.raw), NamedTextColor.GRAY));
        invocation.source().sendMessage(Component.text(
                Messages.deleteHint(result.id), NamedTextColor.GRAY));
        invocation.source().sendMessage(Component.empty());
    }

    @Override
    public List<String> suggest(Invocation invocation) {
        String[] args = invocation.arguments();
        List<String> out = new ArrayList<String>();
        if (args.length <= 1) {
            String prefix = args.length == 0 ? "" : args[0].toLowerCase(Locale.ENGLISH);
            for (String option : new String[] {"share", "delete"}) {
                if (option.startsWith(prefix)) {
                    out.add(option);
                }
            }
            return out;
        }
        if (args.length == 2 && args[0].equalsIgnoreCase("share")) {
            String prefix = args[1].toLowerCase(Locale.ENGLISH);
            for (String name : LogFileResolver.listLogs(new File("logs"))) {
                if (name.toLowerCase(Locale.ENGLISH).startsWith(prefix)) {
                    out.add(name);
                }
            }
        }
        return out;
    }

    @Override
    public boolean hasPermission(Invocation invocation) {
        String[] args = invocation.arguments();
        if (args.length > 0 && args[0].equalsIgnoreCase("delete")) {
            return invocation.source().hasPermission("minelog.delete");
        }
        return invocation.source().hasPermission("minelog.share");
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
