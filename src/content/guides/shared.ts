import { MAX_LOG_BYTES, MAX_LOG_LINES } from "@/lib/config";

// Shared, derived numbers a few guides quote (size and line limits). Kept in
// one place so they can't drift out of sync with each other, while the
// guides that use them still live in their own files.
export const MAX_LOG_MB = MAX_LOG_BYTES / (1024 * 1024);
export const MAX_LOG_LINES_LABEL = MAX_LOG_LINES.toLocaleString("en");
