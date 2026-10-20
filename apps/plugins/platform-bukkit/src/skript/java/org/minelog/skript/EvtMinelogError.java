package org.minelog.skript;

import ch.njol.skript.lang.Literal;
import ch.njol.skript.lang.SkriptEvent;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import org.bukkit.event.Event;

public final class EvtMinelogError extends SkriptEvent {
    static final String PATTERN = "minelog error [detected|found]";

    @Override
    public boolean init(Literal<?>[] args, int matchedPattern, ParseResult parseResult) {
        return true;
    }

    @Override
    public boolean check(Event event) {
        return event instanceof MinelogErrorEvent;
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "minelog error detected";
    }
}
