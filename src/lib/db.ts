import postgres from "postgres";

declare global {
  var __minelogSql: ReturnType<typeof createClient> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    transform: postgres.camel,
  });
}

export function db() {
  return (globalThis.__minelogSql ??= createClient());
}

