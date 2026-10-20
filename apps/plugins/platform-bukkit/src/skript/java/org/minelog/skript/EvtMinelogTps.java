package org.minelog.skript;

import ch.njol.skript.lang.Literal;
import ch.njol.skript.lang.SkriptEvent;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import org.bukkit.event.Event;

public final class EvtMinelogTps extends SkriptEvent {
    static final String PATTERN = "minelog tps (drop|dip) [below %-number%]";

    private TpsGate gate;

    @Override
    public boolean init(Literal<?>[] args, int matchedPattern, ParseResult parseResult) {
        double threshold = TpsGate.DEFAULT_THRESHOLD;
        if (args.length > 0 && args[0] != null) {
            Object value = args[0].getSingle();
            if (value instanceof Number) {
                threshold = ((Number) value).doubleValue();
            }
        }
        gate = new TpsGate(threshold);
        return true;
    }

    @Override
    public boolean check(Event event) {
        return event instanceof MinelogTpsEvent && gate.drops(((MinelogTpsEvent) event).getTps());
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "minelog tps drop";
    }
}
