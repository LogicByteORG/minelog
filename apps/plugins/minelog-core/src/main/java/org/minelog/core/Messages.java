package org.minelog.core;

public final class Messages {
    private Messages() {
    }

    public static String uploading(String fileName) {
        return "Uploading " + fileName + ". One moment.";
    }

    public static String ready(String url) {
        return "Your log is ready: " + url;
    }

    public static String rawLine(String raw) {
        return "Raw version: " + raw;
    }

    public static String problems(int count, String url) {
        if (count <= 0) {
            return "No known issues found. Details: " + url;
        }
        if (count == 1) {
            return "Found 1 issue. Details: " + url;
        }
        return "Found " + count + " issues. Details: " + url;
    }

    public static String deleteHint(String id) {
        return "Need to remove it? Run /minelog delete " + id;
    }

    public static String deleted(String id) {
        return "Deleted " + id + ". It is gone for everyone now.";
    }

    public static String needFileName() {
        return "Tell me which file to delete: /minelog delete <id>";
    }

    public static String noPermission() {
        return "You do not have permission for that.";
    }

    public static String fileNotFound(String name) {
        return "I could not find " + name + " in logs.";
    }

    public static String refused(String reason) {
        return "I cannot upload that file. " + reason;
    }

    public static String tooLarge() {
        return "That log is over the 15 MB limit. Open the latest lines and share a smaller part.";
    }

    public static String tooManyLines() {
        return "That log has more than 30,000 lines. Share the latest part instead.";
    }

    public static String uploadFailed() {
        return "Upload failed. Check the connection and try again in a moment.";
    }

    public static String deleteFailed() {
        return "Delete failed. The link may be expired or the token may not match.";
    }

    public static String usage() {
        return "Use /minelog share [file], or /minelog delete <id>.";
    }
}
