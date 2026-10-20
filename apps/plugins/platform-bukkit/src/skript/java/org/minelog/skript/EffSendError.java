package org.minelog.skript;

import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Effect;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.util.Kleenean;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import org.bukkit.event.Event;
import org.minelog.bukkit.MinelogPlugin;
import org.minelog.core.ErrorBlock;

@Name("Save an error to minelog")
@Description({
    "Saves an error under Alerts in your minelog account, the same place errors from the server log go.",
    "The same error is counted instead of saved again. It is encrypted and only you can read it.",
    "Webhooks get a notice the first time a new error shows up."
})
@Examples({
    "send minelog error \"Could not load the shop file\"",
    "send minelog error \"Economy sync failed for %player%\" to webhook \"ops-discord\""
})
@Since("1.2.0")
public final class EffSendError extends Effect {
    static final String PATTERN = "(send|post) minelog error %string% [(to|via) webhook[s] %-strings%]";

    private static final DateTimeFormatter CLOCK = DateTimeFormatter.ofPattern("HH:mm:ss");

    private Expression<String> text;
    private Expression<String> webhooks;

    @Override
    @SuppressWarnings("unchecked")
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        text = (Expression<String>) exprs[0];
        webhooks = (Expression<String>) exprs[1];
        return true;
    }

    @Override
    protected void execute(Event event) {
        MinelogPlugin core = Bridge.core();
        String said = text.getSingle(event);
        if (core == null || said == null || said.trim().isEmpty()) {
            return;
        }
        String[] lines = said.trim().split("\\R", 2);
        String head = "[" + LocalTime.now().format(CLOCK) + "] [Skript/ERROR]: " + lines[0];
        String content = lines.length > 1 ? head + "\n" + lines[1] + "\n" : head + "\n";
        List<String> handles = webhooks == null ? null : Arrays.asList(webhooks.getArray(event));
        core.alertAsync(new ErrorBlock(content, head), handles);
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "send minelog error " + text.toString(event, debug);
    }
}
