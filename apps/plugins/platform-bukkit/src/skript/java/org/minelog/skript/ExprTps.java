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

@Name("Minelog TPS")
@Description("The server's TPS over the last five seconds, from 0 to 20.")
@Examples({
    "broadcast \"TPS is %minelog tps%\"",
    "if minelog tps is less than 12:"
})
@Since("1.2.0")
public final class ExprTps extends SimpleExpression<Number> {
    static final String PATTERN = "[the] [current] minelog tps";

    @Override
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        return true;
    }

    @Override
    protected Number[] get(Event event) {
        return new Number[] {TpsMonitor.current()};
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
        return "minelog tps";
    }
}
