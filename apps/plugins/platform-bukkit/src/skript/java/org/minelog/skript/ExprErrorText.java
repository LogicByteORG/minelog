package org.minelog.skript;

import ch.njol.skript.Skript;
import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.skript.lang.parser.ParserInstance;
import ch.njol.skript.lang.util.SimpleExpression;
import ch.njol.util.Kleenean;
import org.bukkit.event.Event;

@Name("Minelog error text")
@Description("The error line, or all the log lines around it, in a 'minelog error detected' event.")
@Examples({
    "on minelog error detected:",
    "    broadcast \"Error: %the minelog error summary%\""
})
@Since("1.2.0")
public final class ExprErrorText extends SimpleExpression<String> {
    static final String PATTERN = "[the] minelog error (0¦summary|1¦text)";

    private boolean whole;

    @Override
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        if (!ParserInstance.get().isCurrentEvent(MinelogErrorEvent.class)) {
            Skript.error("The minelog error text only exists in a 'minelog error detected' event.");
            return false;
        }
        whole = parseResult.mark == 1;
        return true;
    }

    @Override
    protected String[] get(Event event) {
        if (!(event instanceof MinelogErrorEvent)) {
            return new String[0];
        }
        MinelogErrorEvent error = (MinelogErrorEvent) event;
        return new String[] {whole ? error.getText() : error.getSummary()};
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
        return whole ? "minelog error text" : "minelog error summary";
    }
}
