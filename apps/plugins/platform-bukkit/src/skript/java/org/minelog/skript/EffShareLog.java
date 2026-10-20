package org.minelog.skript;

import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Effect;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.util.Kleenean;
import java.io.File;
import java.io.IOException;
import org.bukkit.event.Event;
import org.minelog.bukkit.MinelogPlugin;
import org.minelog.core.LogFileResolver;

@Name("Share a log with minelog")
@Description({
    "Uploads logs/latest.log, or the log file you name, and gives you a link.",
    "It runs in the background. Use the 'minelog log shared' event to get the link, or 'minelog send failed' if it did not work."
})
@Examples({
    "share minelog log",
    "on minelog log shared:",
    "    send minelog alert \"Log shared\" with message minelog link"
})
@Since("1.2.0")
public final class EffShareLog extends Effect {
    static final String PATTERN = "share minelog log [(named|file) %-string%]";

    private Expression<String> file;

    @Override
    @SuppressWarnings("unchecked")
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        file = (Expression<String>) exprs[0];
        return true;
    }

    @Override
    protected void execute(Event event) {
        final MinelogPlugin core = Bridge.core();
        if (core == null) {
            return;
        }
        final String name = file == null ? null : file.getSingle(event);
        core.runAsync(new Runnable() {
            @Override
            public void run() {
                try {
                    File target = LogFileResolver.resolve(core.logsDir(), name);
                    core.uploadLog(target);
                } catch (LogFileResolver.ResolveException refused) {
                    core.signalFailure(refused.getMessage());
                } catch (IOException failed) {
                    core.getLogger().fine("Upload from Skript failed: " + failed.getMessage());
                }
            }
        });
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "share minelog log" + (file == null ? "" : " " + file.toString(event, debug));
    }
}
