import { MAX_LOG_BYTES, MAX_LOG_LINES } from "@/lib/config";

export const MAX_LOG_MB = MAX_LOG_BYTES / (1024 * 1024);
export const MAX_LOG_LINES_LABEL = MAX_LOG_LINES.toLocaleString("en");
