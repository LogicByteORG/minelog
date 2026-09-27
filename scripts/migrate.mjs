import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "db", "migrations");
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

try {
  await sql`
    create table if not exists public.schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;
  await sql`alter table public.schema_migrations enable row level security`;
  await sql`revoke all on public.schema_migrations from anon, authenticated`;

  const done = new Set((await sql`select name from public.schema_migrations`).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  let applied = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    const text = await readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(text);
      await tx`insert into public.schema_migrations (name) values (${file})`;
    });
    console.log("applied", file);
    applied += 1;
  }
  console.log(applied === 0 ? "Database is up to date." : `Done, ${applied} migration(s) applied.`);
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}

