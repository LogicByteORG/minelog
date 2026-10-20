package org.minelog.core;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Consumer;
import java.util.regex.Pattern;

public final class LogWatcher {
    private static final Pattern STAMP =
            Pattern.compile("^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?[\\] ]");
    private static final Pattern ERROR = Pattern.compile(
            "^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:\\] \\[[^\\]]*/| )(?:ERROR|FATAL)\\]");
    private static final int CONTEXT_LINES = 3;
    private static final int BLOCK_MAX_LINES = 80;
    private static final int READ_MAX_BYTES = 1024 * 1024;
    private static final int SUMMARY_MAX = 200;
    private static final String OWN_TAG = "[minelog]";

    private final File file;
    private final Consumer<ErrorBlock> sink;
    private final LinkedList<String> context = new LinkedList<String>();
    private List<String> block;
    private String blockHead;
    private int blockContext;
    private long position = -1;

    public LogWatcher(File file, Consumer<ErrorBlock> sink) {
        this.file = file;
        this.sink = sink;
    }

    public synchronized void poll() {
        if (!file.isFile()) {
            return;
        }
        long length = file.length();
        if (position < 0) {
            position = length;
            return;
        }
        if (length < position) {
            flush();
            context.clear();
            position = 0;
        }
        if (length == position) {
            flush();
            return;
        }
        byte[] chunk;
        try {
            chunk = read(length);
        } catch (IOException failed) {
            return;
        }
        int end = lastNewline(chunk);
        if (end < 0) {
            return;
        }
        position += end + 1;
        String text = new String(chunk, 0, end, StandardCharsets.UTF_8);
        for (String line : text.split("\n", -1)) {
            handle(line.endsWith("\r") ? line.substring(0, line.length() - 1) : line);
        }
    }

    private byte[] read(long length) throws IOException {
        RandomAccessFile in = new RandomAccessFile(file, "r");
        try {
            int size = (int) Math.min(READ_MAX_BYTES, length - position);
            byte[] chunk = new byte[size];
            in.seek(position);
            in.readFully(chunk);
            return chunk;
        } finally {
            in.close();
        }
    }

    private static int lastNewline(byte[] chunk) {
        for (int i = chunk.length - 1; i >= 0; i--) {
            if (chunk[i] == '\n') {
                return i;
            }
        }
        return -1;
    }

    private void handle(String line) {
        if (block != null) {
            if (!STAMP.matcher(line).find()) {
                if (block.size() < BLOCK_MAX_LINES) {
                    block.add(line);
                }
                return;
            }
            flush();
        }
        if (ERROR.matcher(line).find()) {
            block = new ArrayList<String>(context);
            blockContext = block.size();
            block.add(line);
            blockHead = line;
            context.clear();
            return;
        }
        context.add(line);
        while (context.size() > CONTEXT_LINES) {
            context.removeFirst();
        }
    }

    private void flush() {
        if (block == null) {
            return;
        }
        List<String> lines = block;
        String head = blockHead;
        block = null;
        blockHead = null;
        StringBuilder text = new StringBuilder();
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            // Only the error itself decides. The lines before it are context, and minelog's own
            // chatter right before a real error must not hide it.
            if (i >= blockContext && line.contains(OWN_TAG)) {
                return;
            }
            text.append(line).append('\n');
        }
        String summary = head.trim();
        if (summary.length() > SUMMARY_MAX) {
            summary = summary.substring(0, SUMMARY_MAX);
        }
        sink.accept(new ErrorBlock(text.toString(), summary));
    }
}
