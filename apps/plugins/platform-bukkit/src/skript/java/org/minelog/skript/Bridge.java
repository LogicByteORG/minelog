package org.minelog.skript;

import org.minelog.bukkit.MinelogPlugin;

final class Bridge {
    private static volatile MinelogPlugin core;

    private Bridge() {
    }

    static void set(MinelogPlugin plugin) {
        core = plugin;
    }

    static MinelogPlugin core() {
        return core;
    }
}
