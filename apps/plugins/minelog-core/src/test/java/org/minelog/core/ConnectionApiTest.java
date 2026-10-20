package org.minelog.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class ConnectionApiTest {
    private static final String KEY = "mlk_abcdefghijklmnopqrstuvwxyz012345";

    private HttpServer server;
    private String lastPath;
    private String lastAuth;
    private String lastBody;
    private int status;
    private String answer;
    private MinelogClient client;

    @Before
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                lastPath = exchange.getRequestURI().getPath();
                lastAuth = exchange.getRequestHeaders().getFirst("Authorization");
                lastBody = read(exchange.getRequestBody());
                byte[] bytes = answer.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(status, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            }
        });
        server.start();
        String base = "http://127.0.0.1:" + server.getAddress().getPort() + "/svc";
        client = new MinelogClient(new MinelogConfig(base, 5000, "test"), "test");
        status = 200;
        answer = "{}";
    }

    @After
    public void stop() {
        server.stop(0);
    }

    private static String read(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int count;
        while ((count = in.read(buffer)) != -1) {
            out.write(buffer, 0, count);
        }
        return new String(out.toByteArray(), StandardCharsets.UTF_8);
    }

    @Test
    public void connectSendsTheKeyAndReadsTheServerNameAndWebhooks() throws IOException {
        answer = "{\"server\":{\"name\":\"Paper 1.21.1\"},\"events\":[\"error\",\"tps\"],"
                + "\"webhooks\":[{\"handle\":\"ops-discord\",\"name\":\"Ops\",\"kind\":\"discord\",\"enabled\":true},"
                + "{\"handle\":\"old\",\"name\":\"Old\",\"kind\":\"custom\",\"enabled\":false}],"
                + "\"limits\":{\"eventsPerMinute\":60}}";
        ConnectResult result = client.connect(KEY, new ServerInfo("Paper", "1.21.1", "1.2.0"));
        assertEquals("/svc/v2/connect", lastPath);
        assertEquals("Bearer " + KEY, lastAuth);
        assertTrue(lastBody.contains("\"software\":\"Paper\""));
        assertTrue(lastBody.contains("\"version\":\"1.21.1\""));
        assertTrue(lastBody.contains("\"pluginVersion\":\"1.2.0\""));
        assertEquals("Paper 1.21.1", result.serverName);
        assertEquals(Arrays.asList("error", "tps"), result.events);
        assertEquals(Arrays.asList("ops-discord", "old"), result.handles());
        assertFalse(result.webhooks.get(1).enabled);
        assertEquals(60, result.eventsPerMinute);
    }

    @Test
    public void aRefusedKeyIsReportedAsAnInvalidKey() throws IOException {
        status = 401;
        answer = "{\"error\":{\"code\":\"invalid_key\",\"message\":\"That API key isn't valid.\"}}";
        try {
            client.connect(KEY, new ServerInfo(null, null, null));
            fail("Should refuse");
        } catch (MinelogApiException refused) {
            assertTrue(refused.isInvalidKey());
            assertEquals("That API key isn't valid.", refused.getMessage());
            assertEquals(401, refused.status);
        }
    }

    @Test
    public void anAlertCarriesTheLinesTheTitleAndTheWebhooks() throws IOException {
        answer = "{\"id\":\"abc\",\"occurrences\":3,\"new\":false}";
        AlertResult result = client.sendAlert(KEY, "line one\n\"two\"", "Boom", Arrays.asList("ops", "lobby"));
        assertEquals("/svc/v2/alerts", lastPath);
        assertTrue(lastBody.contains("\"content\":\"line one\\n\\\"two\\\"\""));
        assertTrue(lastBody.contains("\"title\":\"Boom\""));
        assertTrue(lastBody.contains("\"webhooks\":[\"ops\",\"lobby\"]"));
        assertEquals("abc", result.id);
        assertEquals(3, result.occurrences);
        assertFalse(result.isNew);
    }

    @Test
    public void anAlertWithoutTargetsLeavesTheFieldOut() throws IOException {
        answer = "{\"id\":\"abc\",\"occurrences\":1,\"new\":true}";
        client.sendAlert(KEY, "x", null, null);
        assertFalse(lastBody.contains("webhooks"));
        assertFalse(lastBody.contains("title"));
    }

    @Test
    public void anEventBuildsItsFieldsAndReturnsHowManyWebhooksGotIt() throws IOException {
        answer = "{\"accepted\":true,\"webhooks\":2}";
        EventMessage message = new EventMessage("tps", "TPS dropped", "Below 15", "warning")
                .field("TPS", "12.4")
                .field("Players", "20");
        int delivered = client.sendEvent(KEY, message);
        assertEquals(2, delivered);
        assertEquals("/svc/v2/events", lastPath);
        assertTrue(lastBody.contains("\"event\":\"tps\""));
        assertTrue(lastBody.contains("\"fields\":{\"TPS\":\"12.4\",\"Players\":\"20\"}"));
        assertTrue(lastBody.contains("\"level\":\"warning\""));
    }

    @Test
    public void anUnknownWebhookErrorKeepsItsReason() throws IOException {
        status = 400;
        answer = "{\"error\":{\"code\":\"unknown_webhook\",\"message\":\"No webhook with the handle x. Yours: ops.\"}}";
        try {
            client.sendEvent(KEY, new EventMessage("custom", "t", "", "info").to(Arrays.asList("x")));
            fail("Should refuse");
        } catch (MinelogApiException refused) {
            assertEquals("unknown_webhook", refused.code);
            assertTrue(refused.getMessage().contains("Yours: ops"));
            assertFalse(refused.isInvalidKey());
        }
    }

    @Test
    public void aBrokenAnswerStillGivesAReadableError() throws IOException {
        status = 502;
        answer = "<html>bad gateway</html>";
        try {
            client.sendEvent(KEY, new EventMessage("custom", "t", "", "info"));
            fail("Should refuse");
        } catch (MinelogApiException refused) {
            assertEquals(502, refused.status);
            assertTrue(refused.getMessage().contains("502"));
        }
    }

    @Test
    public void authenticateSavesTheKeyAndForgetRemovesIt() throws IOException {
        File store = File.createTempFile("minelog-key", ".properties");
        store.deleteOnExit();
        answer = "{\"server\":{\"name\":\"Lobby\"},\"events\":[],\"webhooks\":[],\"limits\":{}}";
        MinelogConnection connection =
                new MinelogConnection(client, new TokenStore(store, "test"), new ServerInfo("Paper", "1.21.1", "1"));

        assertFalse(connection.hasKey());
        ConnectResult result = connection.authenticate(KEY);
        assertEquals("Lobby", result.serverName);
        assertTrue(connection.hasKey());
        assertTrue(connection.connected());
        assertEquals("Lobby", connection.serverName());

        MinelogConnection again =
                new MinelogConnection(client, new TokenStore(store, "test"), new ServerInfo("Paper", "1.21.1", "1"));
        assertTrue(again.hasKey());
        assertEquals("Lobby", again.reconnect().serverName);

        connection.forget();
        assertFalse(connection.hasKey());
        assertFalse(connection.connected());
    }

    @Test
    public void aWrongLookingKeyNeverLeavesTheServer() throws IOException {
        MinelogConnection connection = new MinelogConnection(
                client, new TokenStore(File.createTempFile("minelog-key", ".properties"), "test"),
                new ServerInfo(null, null, null));
        lastPath = null;
        try {
            connection.authenticate("not-a-key");
            fail("Should refuse");
        } catch (IOException expected) {
            assertTrue(expected.getMessage().contains("mlk_"));
        }
        assertEquals(null, lastPath);
        assertFalse(MinelogConnection.looksLikeKey(null));
        assertTrue(MinelogConnection.looksLikeKey(KEY));
    }

    @Test
    public void aRevokedKeyIsForgottenOnReconnect() throws IOException {
        File store = File.createTempFile("minelog-key", ".properties");
        store.deleteOnExit();
        TokenStore keys = new TokenStore(store, "test");
        keys.put(MinelogConnection.KEY_ID, KEY);
        MinelogConnection connection = new MinelogConnection(client, keys, new ServerInfo(null, null, null));
        status = 401;
        answer = "{\"error\":{\"code\":\"invalid_key\",\"message\":\"nope\"}}";
        try {
            connection.reconnect();
            fail("Should refuse");
        } catch (MinelogApiException refused) {
            assertTrue(refused.isInvalidKey());
        }
        assertFalse(connection.hasKey());
    }

    @Test
    public void alertsAreRateLimitedAndRepeatsAreSkipped() {
        MinelogConnection connection = new MinelogConnection(
                client, new TokenStore(new File("unused-key-store.properties"), "test"), new ServerInfo(null, null, null));
        long now = 1_000_000L;
        assertTrue(connection.allowAlert("same", now));
        assertFalse(connection.allowAlert("same", now + 5_000));
        assertTrue(connection.allowAlert("same", now + 21_000));
        for (int i = 0; i < 10; i++) {
            assertTrue("distinct " + i, connection.allowAlert("distinct " + i, now + 22_000));
        }
        assertFalse(connection.allowAlert("one too many", now + 23_000));
        assertTrue(connection.allowAlert("later", now + 90_000));
        List<String> none = connection.webhookHandles();
        assertNotNull(none);
        assertTrue(none.isEmpty());
    }
}
