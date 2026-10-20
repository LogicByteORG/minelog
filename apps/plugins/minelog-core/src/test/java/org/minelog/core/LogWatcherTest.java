package org.minelog.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import org.junit.Before;
import org.junit.Test;

public class LogWatcherTest {
    private File file;
    private final List<ErrorBlock> seen = new ArrayList<ErrorBlock>();
    private LogWatcher watcher;

    @Before
    public void setUp() throws IOException {
        file = File.createTempFile("minelog-watch", ".log");
        file.deleteOnExit();
        write("[10:00:00] [Server thread/INFO]: Old history that must not be sent\n"
                + "[10:00:01] [Server thread/ERROR]: Old error from before we started\n", false);
        watcher = new LogWatcher(file, new Consumer<ErrorBlock>() {
            @Override
            public void accept(ErrorBlock block) {
                seen.add(block);
            }
        });
        watcher.poll();
    }

    private void write(String text, boolean append) throws IOException {
        FileOutputStream out = new FileOutputStream(file, append);
        try {
            out.write(text.getBytes(StandardCharsets.UTF_8));
        } finally {
            out.close();
        }
    }

    @Test
    public void historyBeforeStartIsNeverSent() {
        watcher.poll();
        watcher.poll();
        assertTrue(seen.isEmpty());
    }

    @Test
    public void minelogsOwnLinesBeforeAnErrorDoNotHideIt() throws IOException {
        write("[11:00:00] [Server thread/INFO]: [minelog] Connected to minelog as Paper\n"
                + "[11:00:01] [Server thread/INFO]: Player joined\n"
                + "[11:00:02] [Server thread/ERROR]: Could not pass event PlayerJoinEvent to Foo\n"
                + "[11:00:03] [Server thread/INFO]: Something else\n", true);
        watcher.poll();
        assertEquals(1, seen.size());
        assertTrue(seen.get(0).summary.contains("Could not pass event PlayerJoinEvent to Foo"));
    }

    @Test
    public void anErrorWithItsStackAndContextIsOneBlock() throws IOException {
        write("[11:00:00] [Server thread/INFO]: Saving chunks\n"
                + "[11:00:01] [Server thread/INFO]: Player joined\n"
                + "[11:00:02] [Server thread/ERROR]: Could not pass event PlayerJoinEvent to Foo\n"
                + "org.bukkit.event.EventException: null\n"
                + "\tat org.foo.Plugin.onJoin(Plugin.java:42)\n"
                + "Caused by: java.lang.NullPointerException\n"
                + "[11:00:03] [Server thread/INFO]: Something else\n", true);
        watcher.poll();
        assertEquals(1, seen.size());
        ErrorBlock block = seen.get(0);
        assertTrue(block.summary.contains("Could not pass event PlayerJoinEvent to Foo"));
        assertTrue(block.text.contains("Saving chunks"));
        assertTrue(block.text.contains("\tat org.foo.Plugin.onJoin(Plugin.java:42)"));
        assertTrue(block.text.contains("Caused by: java.lang.NullPointerException"));
        assertTrue(!block.text.contains("Something else"));
    }

    @Test
    public void anErrorAtTheEndIsSentOnceTheLogGoesQuiet() throws IOException {
        write("[11:00:02] [Server thread/ERROR]: Last words\n\tat a.B.c(B.java:1)\n", true);
        watcher.poll();
        assertEquals(0, seen.size());
        watcher.poll();
        assertEquals(1, seen.size());
        watcher.poll();
        assertEquals(1, seen.size());
    }

    @Test
    public void readsTheShortConsoleFormatToo() throws IOException {
        write("[12:30:00 ERROR]: Short format error\n[12:30:01 INFO]: next\n", true);
        watcher.poll();
        assertEquals(1, seen.size());
        assertTrue(seen.get(0).summary.contains("Short format error"));
    }

    @Test
    public void warningsAndInfoAreIgnored() throws IOException {
        write("[11:00:00] [Server thread/WARN]: Can't keep up!\n"
                + "[11:00:01] [Server thread/INFO]: error mentioned in chat\n", true);
        watcher.poll();
        watcher.poll();
        assertTrue(seen.isEmpty());
    }

    @Test
    public void aHalfWrittenLineWaitsForItsEnd() throws IOException {
        write("[11:00:00] [Server thread/ERROR]: Half", true);
        watcher.poll();
        write(" a line\n[11:00:01] [Server thread/INFO]: after\n", true);
        watcher.poll();
        assertEquals(1, seen.size());
        assertTrue(seen.get(0).summary.endsWith("Half a line"));
    }

    @Test
    public void ourOwnMessagesNeverLoopBack() throws IOException {
        write("[11:00:00] [Server thread/ERROR]: [minelog] Could not reach minelog\n"
                + "[11:00:01] [Server thread/INFO]: next\n", true);
        watcher.poll();
        watcher.poll();
        assertTrue(seen.isEmpty());
    }

    @Test
    public void startsOverWhenTheLogIsRotated() throws IOException {
        write("[11:00:00] [Server thread/INFO]: a long line to make the file bigger than the new one\n", true);
        watcher.poll();
        write("[12:00:00] [Server thread/ERROR]: After rotation\n[12:00:01] [Server thread/INFO]: x\n", false);
        watcher.poll();
        assertEquals(1, seen.size());
        assertTrue(seen.get(0).summary.contains("After rotation"));
    }

    @Test
    public void aRunawayStackTraceIsCapped() throws IOException {
        StringBuilder text = new StringBuilder("[11:00:00] [Server thread/ERROR]: Deep\n");
        for (int i = 0; i < 500; i++) {
            text.append("\tat a.B.c").append(i).append("(B.java:1)\n");
        }
        text.append("[11:00:01] [Server thread/INFO]: done\n");
        write(text.toString(), true);
        watcher.poll();
        assertEquals(1, seen.size());
        assertTrue(seen.get(0).text.split("\n").length <= 81);
    }
}
