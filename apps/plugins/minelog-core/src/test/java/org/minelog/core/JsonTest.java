package org.minelog.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.junit.Test;

public class JsonTest {
    @Test
    public void readsNestedObjectsAndArrays() throws IOException {
        Object parsed = Json.parse(
                "{\"server\":{\"name\":\"Paper 1.21.1\"},\"events\":[\"error\",\"tps\"],"
                        + "\"webhooks\":[{\"handle\":\"ops\",\"enabled\":true}],"
                        + "\"limits\":{\"eventsPerMinute\":60},\"gone\":null}");
        Map<String, Object> root = Json.object(parsed);
        assertEquals("Paper 1.21.1", Json.string(Json.object(root.get("server")).get("name")));
        List<Object> events = Json.array(root.get("events"));
        assertEquals(2, events.size());
        assertEquals("tps", events.get(1));
        Map<String, Object> hook = Json.object(Json.array(root.get("webhooks")).get(0));
        assertEquals("ops", hook.get("handle"));
        assertTrue(Json.bool(hook.get("enabled"), false));
        assertEquals(60, Json.integer(Json.object(root.get("limits")).get("eventsPerMinute"), 0));
        assertNull(root.get("gone"));
    }

    @Test
    public void readsEscapesAndUnicode() throws IOException {
        Object parsed = Json.parse("\"a\\\"b\\\\c\\nd\\u00e7\\t\"");
        assertEquals("a\"b\\c\ndç\t", parsed);
    }

    @Test
    public void readsNumbers() throws IOException {
        assertEquals(Long.valueOf(42), Json.parse("42"));
        assertEquals(Double.valueOf(-1.5), Json.parse("-1.5"));
        assertEquals(Double.valueOf(1000), Json.parse("1e3"));
    }

    @Test
    public void wrongTypesFallBackInsteadOfCrashing() {
        assertEquals("", Json.string(5));
        assertEquals(7, Json.integer("x", 7));
        assertTrue(Json.bool("x", true));
        assertTrue(Json.object("x").isEmpty());
        assertTrue(Json.array(null).isEmpty());
    }

    @Test
    public void refusesBrokenJson() {
        String[] bad = {"", "{", "{\"a\":}", "[1,]", "{\"a\" 1}", "\"open", "{} extra", "nope"};
        for (String text : bad) {
            try {
                Json.parse(text);
                fail("Should refuse: " + text);
            } catch (IOException expected) {
                assertTrue(expected.getMessage().startsWith("Could not read the answer"));
            }
        }
    }

    @Test
    public void refusesDeepNesting() {
        StringBuilder deep = new StringBuilder();
        for (int i = 0; i < 40; i++) {
            deep.append('[');
        }
        try {
            Json.parse(deep.toString());
            fail("Should refuse");
        } catch (IOException expected) {
            assertTrue(expected.getMessage().contains("deeply"));
        }
    }
}
