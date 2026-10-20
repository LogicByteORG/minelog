package org.minelog.core;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public final class MinelogConnection {
    public static final String KEY_ID = "key";

    private static final Pattern KEY_FORMAT = Pattern.compile("mlk_[A-Za-z0-9_-]{32}");
    private static final int ALERTS_PER_MINUTE = 12;
    private static final long SAME_ALERT_MILLIS = 20_000L;
    private static final long MINUTE_MILLIS = 60_000L;

    private final MinelogClient client;
    private final TokenStore keys;
    private final ServerInfo info;
    private final ArrayDeque<Long> recent = new ArrayDeque<Long>();
    private final Map<String, Long> lastSeen = new HashMap<String, Long>();
    private ConnectResult state;

    public MinelogConnection(MinelogClient client, TokenStore keys, ServerInfo info) {
        this.client = client;
        this.keys = keys;
        this.info = info;
    }

    public static boolean looksLikeKey(String value) {
        return value != null && KEY_FORMAT.matcher(value).matches();
    }

    public synchronized boolean hasKey() {
        String key = keys.get(KEY_ID);
        return key != null && !key.isEmpty();
    }

    public synchronized boolean connected() {
        return state != null;
    }

    public synchronized String serverName() {
        return state == null ? null : state.serverName;
    }

    public synchronized List<String> webhookHandles() {
        return state == null ? Collections.<String>emptyList() : state.handles();
    }

    public synchronized List<WebhookInfo> webhooks() {
        return state == null ? Collections.<WebhookInfo>emptyList() : state.webhooks;
    }

    public ConnectResult authenticate(String key) throws IOException {
        if (!looksLikeKey(key)) {
            throw new IOException(Messages.keyLooksWrong());
        }
        ConnectResult result = client.connect(key, info);
        synchronized (this) {
            keys.put(KEY_ID, key);
            state = result;
        }
        return result;
    }

    public ConnectResult reconnect() throws IOException {
        String key = currentKey();
        ConnectResult result;
        try {
            result = client.connect(key, info);
        } catch (MinelogApiException refused) {
            if (refused.isInvalidKey()) {
                forget();
            }
            throw refused;
        }
        synchronized (this) {
            state = result;
        }
        return result;
    }

    public synchronized void forget() {
        keys.remove(KEY_ID);
        state = null;
    }

    public AlertResult sendAlert(ErrorBlock block, List<String> webhooks) throws IOException {
        return client.sendAlert(currentKey(), block.text, block.summary, webhooks);
    }

    public int sendEvent(EventMessage message) throws IOException {
        return client.sendEvent(currentKey(), message);
    }

    public synchronized boolean allowAlert(String summary, long now) {
        while (!recent.isEmpty() && now - recent.peekFirst() > MINUTE_MILLIS) {
            recent.removeFirst();
        }
        Iterator<Map.Entry<String, Long>> old = lastSeen.entrySet().iterator();
        while (old.hasNext()) {
            if (now - old.next().getValue() > MINUTE_MILLIS) {
                old.remove();
            }
        }
        Long same = lastSeen.get(summary);
        if (same != null && now - same < SAME_ALERT_MILLIS) {
            return false;
        }
        if (recent.size() >= ALERTS_PER_MINUTE) {
            return false;
        }
        recent.addLast(now);
        lastSeen.put(summary, now);
        return true;
    }

    private synchronized String currentKey() throws IOException {
        String key = keys.get(KEY_ID);
        if (key == null || key.isEmpty()) {
            throw new IOException(Messages.notConnected());
        }
        return key;
    }
}
