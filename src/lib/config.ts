export const RETENTION_DAYS = 120;

export const UNHIDDEN_RETENTION_HOURS = 48;

export const IS_PREVIEW = process.env.NEXT_PUBLIC_IS_PREVIEW === "1";

export const PREVIEW_RETENTION_HOURS = 1;

export const MAX_LOG_BYTES = 15 * 1024 * 1024;

export const MAX_LOG_LINES = 30_000;

export const MAX_ANALYSE_BYTES = 5 * 1024 * 1024;

export const ANALYSES_PER_MINUTE = 30;

export const INSIGHT_READS_PER_MINUTE = 60;

export const DELETES_PER_MINUTE = 60;

export const BULK_DELETES_PER_MINUTE = 10;

export const BULK_DELETE_LIMIT = 256;

export const PREVIEW_LINE_LIMIT = 2000;

export const UPLOADS_PER_MINUTE = 70;

export const UPLOADS_PER_DAY = 300;

export const DELETE_WINDOW_MINUTES = 60;

export const LOG_CACHE_SECONDS = 600;

export const WEBHOOKS_PER_ACCOUNT = 25;

export const WEBHOOK_MAX_FAILURES = 10;

export const SERVERS_PER_ACCOUNT = 10;

export const EVENTS_PER_MINUTE = 60;

export const WEBHOOK_TESTS_PER_MINUTE = 10;

export const EXPORTS_PER_MINUTE = 3;

export const REVERIFY_MINUTES = 10;

export const ALERTS_PER_ACCOUNT = 100;

export const ALERT_RETENTION_DAYS = 14;

export const ALERT_CONTENT_MAX = 65_536;

export const ALERTS_PER_MINUTE = 30;

export const VIEW_CHUNK_LINES = 2000;

export const INLINE_LOG_CHARS = 256 * 1024;

export const API_BASE = "https://api.minelog.org";

export const SITE_BASE = "https://minelog.org";

export const REPORT_EMAIL = "report@minelog.org";

export const SITE_SOURCE_NAME = "minelog.org";

export const GA_MEASUREMENT_ID = "G-W37H1VPCS1";

export const MODRINTH_URL = "https://modrinth.com/project/minelog";

export const CURSEFORGE_URL = "https://curseforge.minelog.org";

export const HANGAR_URL = "https://hangar.minelog.org";

export const BUYMEACOFFEE_URL = "https://buymeacoffee.com/pozii";

export const LOGICBYTE_URL = "https://logicbyte.org";

export const STATUS_URL = "https://status.logicbyte.org";

export const GITHUB_URL = "https://github.com/LogicByteORG/minelog";

export const ACTION_URL = "https://github.com/LogicByteORG/minelog-action";

