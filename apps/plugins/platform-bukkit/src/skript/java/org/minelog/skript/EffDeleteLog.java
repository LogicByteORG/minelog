package org.minelog.skript;

import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Effect;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.util.Kleenean;
import java.io.IOException;
import org.bukkit.event.Event;
import org.minelog.bukkit.MinelogPlugin;

@Name("Delete a shared log")
@Description("Deletes a log this server shared earlier. Give the log id or its link. Logs shared from other servers cannot be deleted from here.")
@Examples({
    "delete minelog log minelog log id",
    "delete minelog log \"Ab3dEf9\""
})
@Since("1.2.0")
public final class EffDeleteLog extends Effect {
    static final String PATTERN = "delete minelog log %string%";

    private Expression<String> target;

    @Override
    @SuppressWarnings("unchecked")
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        target = (Expression<String>) exprs[0];
        return true;
    }

    @Override
    protected void execute(Event event) {
        final MinelogPlugin core = Bridge.core();
        String given = target.getSingle(event);
        if (core == null || given == null || given.trim().isEmpty()) {
            return;
        }
        final String id = idFrom(given.trim());
        core.runAsync(new Runnable() {
            @Override
            public void run() {
                try {
                    core.deleteLog(id);
                } catch (IOException failed) {
                    core.signalFailure("Could not delete " + id + ": " + failed.getMessage());
                }
            }
        });
    }

    static String idFrom(String value) {
        int cut = value.indexOf('?');
        String path = cut >= 0 ? value.substring(0, cut) : value;
        while (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        int slash = path.lastIndexOf('/');
        return slash >= 0 ? path.substring(slash + 1) : path;
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "delete minelog log " + target.toString(event, debug);
    }
}
