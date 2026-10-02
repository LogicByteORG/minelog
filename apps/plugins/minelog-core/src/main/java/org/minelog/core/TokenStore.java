package org.minelog.core;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public final class TokenStore {
    private final File file;
    private final Properties saved = new Properties();

    public TokenStore(File file) {
        this.file = file;
        load();
    }

    public synchronized void put(String id, String token) {
        if (id == null || token == null || token.isEmpty()) {
            return;
        }
        saved.setProperty(id, token);
        store();
    }

    public synchronized String get(String id) {
        return saved.getProperty(id);
    }

    public synchronized void remove(String id) {
        saved.remove(id);
        store();
    }

    private void load() {
        if (!file.isFile()) {
            return;
        }
        FileInputStream in = null;
        try {
            in = new FileInputStream(file);
            saved.load(in);
        } catch (IOException ignored) {
            saved.clear();
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException ignored) {
                    // Keep the in-memory map as is.
                }
            }
        }
    }

    private void store() {
        try {
            File parent = file.getParentFile();
            if (parent != null) {
                parent.mkdirs();
            }
            FileOutputStream out = new FileOutputStream(file);
            try {
                saved.store(out, "minelog delete tokens");
            } finally {
                out.close();
            }
        } catch (IOException ignored) {
            // Tokens stay in memory for this session.
        }
    }
}
