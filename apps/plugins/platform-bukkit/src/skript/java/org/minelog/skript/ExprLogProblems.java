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

@Name("Minelog problem count")
@Description("How many problems minelog found in the log that was shared. Empty when minelog did not count them.")
@Examples({
    "on minelog log shared:",
    "    if minelog problem count is more than 0:",
    "        send minelog alert \"Log has problems\" with message minelog link as warning"
})
@Since("1.2.0")
public final class ExprLogProblems extends SimpleExpression<Number> {
    static final String PATTERN = "[the] [last] minelog problem count";

    @Override
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        return true;
    }

    @Override
    protected Number[] get(Event event) {
        UploadResult upload = null;
        if (event instanceof MinelogSignalEvent) {
            upload = ((MinelogSignalEvent) event).getUpload();
        }
        if (upload == null) {
            MinelogPlugin core = Bridge.core();
            upload = core == null ? null : core.lastUpload();
        }
        if (upload == null || upload.problemCount < 0) {
            return new Number[0];
        }
        return new Number[] {upload.problemCount};
    }

    @Override
    public boolean isSingle() {
        return true;
    }

    @Override
    public Class<? extends Number> getReturnType() {
        return Number.class;
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "minelog problem count";
    }
}
