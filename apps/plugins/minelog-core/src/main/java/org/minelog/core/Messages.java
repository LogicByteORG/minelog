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
        return "Use /minelog share [file], /minelog delete <id>, /minelog auth <key>, /minelog status, /minelog test, /minelog disconnect or /minelog reload.";
    }

    public static String authUsage() {
        return "Create a key in the Servers tab of your minelog dashboard, then run /minelog auth <key>.";
    }

    public static String keyLooksWrong() {
        return "That does not look like a minelog key. It starts with mlk_ and has 36 characters.";
    }

    public static String authConnecting() {
        return "Connecting to minelog. One moment.";
    }

    public static String authFailed(String reason) {
        String text = "Could not connect: " + reason;
        if (reason != null && reason.contains("SSL")) {
            text += ". That address does not use https. Check api-base in plugins/minelog/config.yml, "
                    + "a local site starts with http://.";
        }
        return text;
    }

    public static String connected(String serverName, int webhooks) {
        String hooks = webhooks == 0
                ? "No webhooks yet, add one in your dashboard."
                : webhooks == 1 ? "1 webhook is ready." : webhooks + " webhooks are ready.";
        return "Connected as " + serverName + ". " + hooks;
    }

    public static String errorWatchOn() {
        return "Errors in the server log will show up under Alerts in your dashboard.";
    }

    public static String notConnected() {
        return "This server is not connected to minelog yet. Run /minelog auth <key> first.";
    }

    public static String disconnected() {
        return "Disconnected. This server no longer sends anything to minelog.";
    }

    public static String statusConnected(String serverName, int webhooks, boolean watching) {
        return "Connected as " + serverName + ", " + webhooks + (webhooks == 1 ? " webhook" : " webhooks")
                + ", error alerts " + (watching ? "on" : "off") + ".";
    }

    public static String skriptMissing() {
        return "Skript is not installed on this server. Error alerts work without it, but the minelog lines for"
                + " Skript scripts stay off. Install Skript 2.9 or newer to send your own alerts from scripts.";
    }

    public static String skriptUnavailable() {
        return "Skript is installed, but minelog could not add its syntax to it. It needs Skript 2.9 or newer on"
                + " Java 17 or newer. The console says why.";
    }

    // Letters that cannot be read as hex, so the site never folds the code away when it groups errors.
    private static final String CODE_LETTERS = "ghjkmnpqrstvwxyz";

    public static String testCode(java.util.Random random) {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(CODE_LETTERS.charAt(random.nextInt(CODE_LETTERS.length())));
        }
        return code.toString();
    }

    public static String testErrorLine(String code) {
        return "Test error from minelog (run " + code + "). Nothing is wrong, you asked for it with /minelog test.";
    }

    public static String testWritten() {
        return "I wrote a test error to the server log. It should show up under Alerts in a few seconds.";
    }

    public static String testAlertsOff() {
        return "Error alerts are turned off. Set alerts: true in config.yml and run /minelog reload.";
    }

    public static String statusOffline() {
        return "A key is saved but minelog could not be reached. It will keep trying.";
    }

    public static String reloaded() {
        return "Settings reloaded.";
    }

    public static String reloadFailed() {
        return "Reload failed. Check config.yml for typos, details are in the console.";
    }
}
