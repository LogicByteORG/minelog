package org.minelog.skript;

import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.skript.lang.util.SimpleExpression;
import ch.njol.util.Kleenean;
import java.util.List;
import org.bukkit.event.Event;
import org.minelog.bukkit.MinelogPlugin;

@Name("Minelog webhooks")
@Description("The handles of your webhooks, as listed in your minelog dashboard. Empty until the server is connected.")
@Examples({
    "broadcast \"Webhooks: %minelog webhooks%\"",
    "loop minelog webhooks:",
    "    send minelog alert \"Hello\" to webhook loop-value"
})
@Since("1.2.0")
public final class ExprWebhooks extends SimpleExpression<String> {
    static final String PATTERN = "[all] [the] minelog webhooks";

    @Override
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        return true;
    }

    @Override
    protected String[] get(Event event) {
        MinelogPlugin core = Bridge.core();
        if (core == null) {
            return new String[0];
        }
        List<String> handles = core.connection().webhookHandles();
        return handles.toArray(new String[0]);
    }

    @Override
    public boolean isSingle() {
        return false;
    }

    @Override
    public Class<? extends String> getReturnType() {
        return String.class;
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "minelog webhooks";
    }
}
