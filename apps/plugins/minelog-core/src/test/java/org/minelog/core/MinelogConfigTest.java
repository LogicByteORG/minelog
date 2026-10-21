package org.minelog.core;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class MinelogConfigTest {
    private static String base(String value) {
        return new MinelogConfig(value, 15000, "test").apiBase;
    }

    @Test
    public void aBareHostGetsHttps() {
        assertEquals("https://api.minelog.org", base("api.minelog.org"));
        assertEquals("https://api.minelog.org", base("  api.minelog.org/  "));
    }

    @Test
    public void anAddressWithASchemeIsLeftAlone() {
        assertEquals("https://api.minelog.org", base("https://api.minelog.org"));
        assertEquals("http://localhost:3000/svc", base("http://localhost:3000/svc/"));
        assertEquals("HTTPS://Api.Minelog.org", base("HTTPS://Api.Minelog.org"));
    }

    @Test
    public void anEmptyValueFallsBackToTheDefault() {
        assertEquals(MinelogConfig.DEFAULT_API_BASE, base(null));
        assertEquals(MinelogConfig.DEFAULT_API_BASE, base("   "));
        assertEquals(MinelogConfig.DEFAULT_API_BASE, base("/"));
    }
}
