package org.minelog.core;

import java.io.IOException;

public final class MinelogApiException extends IOException {
    private static final long serialVersionUID = 1L;

    public final int status;
    public final String code;

    public MinelogApiException(int status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public boolean isInvalidKey() {
        return status == 401 || "invalid_key".equals(code);
    }
}
