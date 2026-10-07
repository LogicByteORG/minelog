package org.minelog.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import org.junit.Test;

public class MinelogClientTest {
    private static final String ANSWER =
            "{\"id\":\"aB3dE5gH9\",\"url\":\"https://minelog.org/aB3dE5gH9\","
                    + "\"deleteToken\":null,\"deletableUntil\":\"2026-10-07T12:00:00.000Z\"}";

    @Test
    public void readsStringFields() {
        assertEquals("aB3dE5gH9", MinelogClient.field(ANSWER, "id"));
        assertEquals("https://minelog.org/aB3dE5gH9", MinelogClient.field(ANSWER, "url"));
    }

    @Test
    public void aNullValueIsEmptyAndNeverTheNextFieldsText() {
        assertEquals("", MinelogClient.field(ANSWER, "deleteToken"));
        assertEquals("2026-10-07T12:00:00.000Z", MinelogClient.field(ANSWER, "deletableUntil"));
    }

    @Test
    public void aNumberIsNotReadAsAString() {
        assertEquals("", MinelogClient.field("{\"count\": 3, \"name\": \"x\"}", "count"));
        assertEquals("x", MinelogClient.field("{\"count\": 3, \"name\": \"x\"}", "name"));
    }

    @Test
    public void missingFieldsAreEmpty() {
        assertEquals("", MinelogClient.field(ANSWER, "raw"));
        assertEquals("", MinelogClient.field("", "id"));
    }

    @Test
    public void quotesTextForJson() {
        assertEquals("\"a\\\"b\\\\c\\nd\"", MinelogClient.quote("a\"b\\c\nd"));
    }

    @Test
    public void refusesIdsThatCouldChangeThePath() {
        MinelogClient client = new MinelogClient(MinelogConfig.defaults("test"), "test");
        String[] bad = {"../x", "abc/def", "a b", "", "abcdefghijk", "abc", "?x=1xxxx"};
        for (String id : bad) {
            try {
                client.delete(id, "token");
                fail("Should refuse " + id);
            } catch (IOException expected) {
                assertEquals("That is not a log id: " + id, expected.getMessage());
            }
        }
    }
}
