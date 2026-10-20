package org.minelog.skript;

import ch.njol.skript.lang.Literal;
import ch.njol.skript.lang.SkriptEvent;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import org.bukkit.event.Event;

public final class EvtMinelogSignal extends SkriptEvent {
    static final String PATTERN = "minelog (0¦connected|1¦disconnected|2¦log shared|3¦send failed)";

    private String kind;

    @Override
    public boolean init(Literal<?>[] args, int matchedPattern, ParseResult parseResult) {
        kind = MinelogSignalEvent.KINDS[parseResult.mark];
        return true;
    }

    @Override
    public boolean check(Event event) {
        return event instanceof MinelogSignalEvent && kind.equals(((MinelogSignalEvent) event).getKind());
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "minelog " + kind;
    }
}
