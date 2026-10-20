package org.minelog.skript;

import ch.njol.skript.Skript;
import ch.njol.skript.lang.ExpressionType;
import java.util.function.Consumer;
import org.bukkit.Bukkit;
import org.minelog.bukkit.MinelogPlugin;
import org.minelog.core.ErrorBlock;

/**
 * Adds the minelog syntax to Skript (https://github.com/SkriptLang/Skript).
 * Only loaded when Skript is installed, so servers without it never touch it.
 */
public final class SkriptHook {
    private final MinelogPlugin core;
    private TpsMonitor monitor;
    private Consumer<ErrorBlock> errors;
    private Consumer<MinelogPlugin.Signal> signals;

    public SkriptHook(MinelogPlugin core) {
        this.core = core;
    }

    public void enable() {
        Bridge.set(core);

        Skript.registerAddon(core);
        Skript.registerEffect(EffSendAlert.class, EffSendAlert.PATTERN);
        Skript.registerEffect(EffSendError.class, EffSendError.PATTERN);
        Skript.registerEffect(EffShareLog.class, EffShareLog.PATTERN);
        Skript.registerEffect(EffDeleteLog.class, EffDeleteLog.PATTERN);
        Skript.registerEvent("Minelog TPS Drop", EvtMinelogTps.class, MinelogTpsEvent.class, EvtMinelogTps.PATTERN)
                .description("Runs once when the TPS falls below the number you give (15 if you give none).",
                        "It runs again only after the TPS has recovered and dropped again.")
                .examples("on minelog tps drop below 15:", "    send minelog tps alert \"TPS is %minelog tps%\"")
                .since("1.2.0");
        Skript.registerEvent("Minelog Status", EvtMinelogSignal.class, MinelogSignalEvent.class,
                EvtMinelogSignal.PATTERN)
                .description("Runs when the server connects to minelog, loses its key, shares a log, or cannot send to minelog.",
                        "A failed send runs this at most once every 30 seconds.")
                .examples("on minelog log shared:", "    broadcast \"Log ready: %minelog link%\"")
                .since("1.2.0");
        Skript.registerEvent("Minelog Error Detected", EvtMinelogError.class, MinelogErrorEvent.class,
                EvtMinelogError.PATTERN)
                .description("Runs when minelog finds an error in the server log.")
                .examples("on minelog error detected:", "    send minelog alert the minelog error summary")
                .since("1.2.0");
        Skript.registerExpression(ExprTps.class, Number.class, ExpressionType.SIMPLE, ExprTps.PATTERN);
        Skript.registerExpression(ExprErrorText.class, String.class, ExpressionType.SIMPLE, ExprErrorText.PATTERN);
        Skript.registerExpression(ExprLogInfo.class, String.class, ExpressionType.SIMPLE, ExprLogInfo.PATTERN);
        Skript.registerExpression(ExprLogProblems.class, Number.class, ExpressionType.SIMPLE,
                ExprLogProblems.PATTERN);
        Skript.registerExpression(ExprWebhooks.class, String.class, ExpressionType.SIMPLE, ExprWebhooks.PATTERN);

        monitor = new TpsMonitor();
        monitor.start(core);

        errors = new Consumer<ErrorBlock>() {
            @Override
            public void accept(final ErrorBlock block) {
                Bukkit.getScheduler().runTask(core, new Runnable() {
                    @Override
                    public void run() {
                        Bukkit.getPluginManager().callEvent(new MinelogErrorEvent(block.summary, block.text));
                    }
                });
            }
        };
        core.addErrorListener(errors);

        signals = new Consumer<MinelogPlugin.Signal>() {
            @Override
            public void accept(final MinelogPlugin.Signal signal) {
                Bukkit.getScheduler().runTask(core, new Runnable() {
                    @Override
                    public void run() {
                        Bukkit.getPluginManager().callEvent(
                                new MinelogSignalEvent(signal.kind, signal.upload, signal.reason));
                    }
                });
            }
        };
        core.addSignalListener(signals);
    }

    public void disable() {
        if (errors != null) {
            core.removeErrorListener(errors);
        }
        if (signals != null) {
            core.removeSignalListener(signals);
        }
        if (monitor != null) {
            monitor.stop();
        }
        Bridge.set(null);
    }
}
