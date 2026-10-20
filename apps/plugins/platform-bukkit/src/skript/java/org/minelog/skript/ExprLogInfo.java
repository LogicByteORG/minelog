package org.minelog.skript;

import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.skript.lang.util.SimpleExpression;
import ch.njol.util.Kleenean;
import org.bukkit.event.Event;
import org.minelog.bukkit.MinelogPlugin;
import org.minelog.core.UploadResult;

@Name("Minelog shared log")
@Description({
    "The link, id or raw link of a log shared with minelog, or why a send failed.",
    "In a 'minelog log shared' event it is the log that was just shared. Anywhere else it is the last log this server shared."
})
@Examples({
    "on minelog log shared:",
    "    broadcast \"Log ready: %minelog link%\"",
    "on minelog send failed:",
    "    broadcast \"minelog problem: %minelog failure reason%\""
})
@Since("1.2.0")
public final class ExprLogInfo extends SimpleExpression<String> {
    static final String PATTERN = "[the] [last] minelog (0¦link|1¦log id|2¦raw link|3¦failure reason)";

    private int mark;

    @Override
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        mark = parseResult.mark;
        return true;
    }

    @Override
    protected String[] get(Event event) {
        if (mark == 3) {
            if (event instanceof MinelogSignalEvent && ((MinelogSignalEvent) event).getReason() != null) {
                return new String[] {((MinelogSignalEvent) event).getReason()};
            }
            return new String[0];
        }
        UploadResult upload = null;
        if (event instanceof MinelogSignalEvent) {
            upload = ((MinelogSignalEvent) event).getUpload();
        }
        if (upload == null) {
            MinelogPlugin core = Bridge.core();
            upload = core == null ? null : core.lastUpload();
        }
        if (upload == null) {
            return new String[0];
        }
        String value = mark == 0 ? upload.url : mark == 1 ? upload.id : upload.raw;
        return value == null ? new String[0] : new String[] {value};
    }

    @Override
    public boolean isSingle() {
        return true;
    }

    @Override
    public Class<? extends String> getReturnType() {
        return String.class;
    }

    @Override
    public String toString(Event event, boolean debug) {
        return mark == 0 ? "minelog link" : mark == 1 ? "minelog log id" : mark == 2 ? "minelog raw link"
                : "minelog failure reason";
    }
}
