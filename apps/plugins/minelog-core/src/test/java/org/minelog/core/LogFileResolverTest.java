package org.minelog.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

public class LogFileResolverTest {
    @Rule
    public TemporaryFolder folder = new TemporaryFolder();

    @Test
    public void defaultsToLatestLog() throws Exception {
        File logs = folder.newFolder("logs");
        write(new File(logs, "latest.log"), "line one\n");
        File resolved = LogFileResolver.resolve(logs, null);
        assertEquals("latest.log", resolved.getName());
    }

    @Test
    public void acceptsPlainLogName() throws Exception {
        File logs = folder.newFolder("logs");
        write(new File(logs, "2026-10-01-1.log"), "hello\n");
        File resolved = LogFileResolver.resolve(logs, "2026-10-01-1.log");
        assertTrue(resolved.isFile());
    }

    @Test
    public void rejectsTraversal() throws Exception {
        File logs = folder.newFolder("logs");
        try {
            LogFileResolver.resolve(logs, "../server.properties");
            fail("Traversal should be refused");
        } catch (LogFileResolver.ResolveException expected) {
            assertTrue(expected.getMessage().contains("logs"));
        }
    }

    @Test
    public void rejectsGzipInV1() throws Exception {
        File logs = folder.newFolder("logs");
        try {
            LogFileResolver.resolve(logs, "2026-10-01-1.log.gz");
            fail("Gzip should be refused in v1");
        } catch (LogFileResolver.ResolveException expected) {
            assertTrue(expected.getMessage().contains("v1"));
        }
    }

    @Test
    public void missingFileListsHints() throws Exception {
        File logs = folder.newFolder("logs");
        write(new File(logs, "latest.log"), "hello\n");
        try {
            LogFileResolver.resolve(logs, "nope.log");
            fail("Missing file should throw");
        } catch (LogFileResolver.ResolveExceptionWithHints expected) {
            assertEquals(Arrays.asList("latest.log"), expected.hints);
        }
    }

    @Test
    public void jsonFieldParsing() {
        String json = "{\"id\":\"abc123\",\"url\":\"https://minelog.org/abc123\"}";
        assertEquals("abc123", MinelogClient.field(json, "id"));
        assertEquals("https://minelog.org/abc123", MinelogClient.field(json, "url"));
        assertEquals("", MinelogClient.field(json, "missing"));
    }

    private static void write(File file, String text) throws Exception {
        Files.write(file.toPath(), text.getBytes(StandardCharsets.UTF_8));
    }
}
