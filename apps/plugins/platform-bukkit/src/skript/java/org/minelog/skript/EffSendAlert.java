package org.minelog.skript;

import ch.njol.skript.doc.Description;
import ch.njol.skript.doc.Examples;
import ch.njol.skript.doc.Name;
import ch.njol.skript.doc.Since;
import ch.njol.skript.lang.Effect;
import ch.njol.skript.lang.Expression;
import ch.njol.skript.lang.SkriptParser.ParseResult;
import ch.njol.util.Kleenean;
import java.util.Arrays;
import java.util.List;
import org.bukkit.event.Event;
import org.minelog.bukkit.MinelogPlugin;
import org.minelog.core.EventMessage;

@Name("Send a minelog alert")
@Description({
    "Sends a message to your minelog webhooks, on Discord, Slack or your own URL.",
    "Without 'to webhook' it goes to the webhooks that listen to this server, the way you set them up in your dashboard.",
    "Name a webhook by its handle to send only there. The type changes the title and colour: tps, crash, start or stop."
})
@Examples({
    "send minelog alert \"Shop plugin is down\"",
    "send minelog alert \"Backup finished\" with message \"Took 42 seconds\" as info",
    "send minelog tps alert \"TPS dropped to %minelog tps%\" to webhook \"ops-discord\"",
    "send minelog alert \"Big spender\" to webhooks \"ops-discord\" and \"lobby-alerts\""
})
@Since("1.2.0")
public final class EffSendAlert extends Effect {
    static final String PATTERN =
            "(send|post) minelog (0¦alert|8¦tps alert|16¦crash alert|24¦start alert|32¦stop alert) %string% "
                    + "[with message %-string%] [as (1¦info|2¦warning|3¦error)] "
                    + "[(to|via) webhook[s] %-strings%]";

    private Expression<String> title;
    private Expression<String> message;
    private Expression<String> webhooks;
    private int mark;

    @Override
    @SuppressWarnings("unchecked")
    public boolean init(Expression<?>[] exprs, int matchedPattern, Kleenean isDelayed, ParseResult parseResult) {
        title = (Expression<String>) exprs[0];
        message = (Expression<String>) exprs[1];
        webhooks = (Expression<String>) exprs[2];
        mark = parseResult.mark;
        return true;
    }

    @Override
    protected void execute(Event event) {
        MinelogPlugin core = Bridge.core();
        String heading = title.getSingle(event);
        if (core == null || heading == null) {
            return;
        }
        String kind = AlertKind.event(mark);
        String level = AlertKind.level(mark);
        EventMessage alert = new EventMessage(
                kind,
                heading,
                message == null ? null : message.getSingle(event),
                level == null ? AlertKind.defaultLevel(kind) : level);
        if (webhooks != null) {
            List<String> handles = Arrays.asList(webhooks.getArray(event));
            alert.to(handles);
        }
        core.sendAsync(alert);
    }

    @Override
    public String toString(Event event, boolean debug) {
        return "send minelog " + AlertKind.event(mark) + " alert " + title.toString(event, debug);
    }
}
