package org.minelog.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

import java.util.Random;
import org.junit.Test;

public class TestErrorLineTest {
    @Test
    public void theCodeIsSixLettersThatCannotBeHex() {
        for (int i = 0; i < 200; i++) {
            String code = Messages.testCode(new Random(i));
            assertEquals(6, code.length());
            assertTrue(code, code.matches("[ghjkmnpqrstvwxyz]{6}"));
        }
    }

    @Test
    public void twoRunsDoNotGiveTheSameLine() {
        Random random = new Random(7);
        assertNotEquals(
                Messages.testErrorLine(Messages.testCode(random)),
                Messages.testErrorLine(Messages.testCode(random)));
    }

    @Test
    public void theLineStillSaysItIsATest() {
        String line = Messages.testErrorLine("abc");
        assertTrue(line.startsWith("Test error from minelog (run abc)."));
        assertTrue(line.contains("/minelog test"));
    }
}
