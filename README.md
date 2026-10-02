<p align="center">
  <a href="https://minelog.org">
    <img src="public/icon-white.svg" alt="minelog" width="96">
  </a>
</p>

<h1 align="center">minelog</h1>

Share Minecraft logs with a link. Paste a server log, client log or crash report, get a
short address back, and send it to whoever is helping you.

[![License: PolyForm Shield 1.0.0](https://img.shields.io/badge/license-PolyForm%20Shield%201.0.0-blue)](LICENSE)

## What it does

- Detects server logs, client logs, crash reports and Java crash reports as you paste.
- Hides IP addresses, user folder names, tokens and emails in the browser, and again on
  the server before anything is stored.
- Reads the log for you: Minecraft and Java versions, the mod list, and the usual causes
  of a crash, each with the lines that back it up.
- Highlights errors and warnings, lets you link to single lines, search and filter.
- Deletes every log automatically after 120 days.
- Has a small public API for uploading and reading logs. The docs are at `/api`.

## Source available

The code is public so you can read it, check what happens to your logs, and help improve
it. minelog is released under the [PolyForm Shield License 1.0.0](LICENSE), the same
license Sodium uses. In short:

- You can read, run and change the code, and send fixes back.
- You can use it for your own projects, as long as they do not compete with minelog.
- You cannot take it and launch a competing log sharing service with it.

This is a source available license, not an OSI approved open source one. The
[license text](LICENSE) is the only thing that counts, this summary is not legal advice.

## Stack

Next.js (App Router), React, TypeScript, Sass on top of Zurb Foundation, Postgres.

## Running it locally

You need Node.js 20 or newer and a Postgres database (a free Supabase project works).

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL and IP_HASH_SECRET
npm run db:migrate
npm run dev
```

The site is on <http://localhost:3000>. The API runs as the same app in another mode:

```bash
npm run dev:api              # http://localhost:4000
```

Every setting is explained in [`.env.example`](.env.example).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site with hot reload |
| `npm run dev:api` | Start the API service |
| `npm run build` | Production build of the site |
| `npm run build:api` | Production build of the API service |
| `npm run db:migrate` | Apply the SQL files in `db/migrations` |
| `npm run lint` | Lint the code |
| `npm test` | Run the test suite |

## Project layout

```
src/app          pages and API routes
src/components   React components
src/content      guides, FAQ, API docs and legal text
src/lib          redaction, log parsing, diagnosis, storage, rate limiting
src/styles       Sass partials, colors live in _tokens.scss
db/migrations    plain SQL, applied in name order
tests            unit tests and real log fixtures
```

## Contributing

Bug reports, crash rules and pull requests are welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md). Please read the [Code of Conduct](CODE_OF_CONDUCT.md)
too, and report security problems as described in [SECURITY.md](SECURITY.md).

## License

Copyright 2026 LogicByte. Released under the [PolyForm Shield License 1.0.0](LICENSE).

The Minecraft name and logo belong to Mojang AB. minelog is not affiliated with Mojang
or Microsoft.
