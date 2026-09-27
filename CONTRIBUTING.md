# Contributing to minelog

Thanks for wanting to help. minelog is a small project and every bug report, fix and
crash rule makes it better for people who are stuck on a broken game.

## A word on the license

minelog is source available under the [PolyForm Shield License 1.0.0](LICENSE). You can
read the code, run it, change it and send fixes back. What you cannot do is take it and
run a competing log sharing service with it. Contributing does not change any of that.

## Ways to help

- **Report a bug.** Open an issue with the log link (or a description if the log is
  private), what you expected and what happened.
- **Teach it a new crash.** The most useful contribution. See [Adding a crash rule](#adding-a-crash-rule).
- **Fix something.** Small, focused pull requests get reviewed fastest.
- **Improve the guides.** They live in `src/content/guides.ts` and `src/content/guides-errors.ts`.
  Write for someone who is frustrated and not technical.

If you plan something bigger than a bug fix, open an issue first so we can agree on the
direction before you spend a weekend on it.

## Setting up

You need Node.js 20 or newer and a Postgres database.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Before you open a pull request, make sure these pass:

```bash
npm run lint
npm test
npx tsc --noEmit
```

## Adding a crash rule

Rules live in `src/lib/diagnose/problems/rules`, one file per problem.

1. Find a real log that shows the problem. Remove names, addresses and tokens.
2. Save it in `tests/fixtures`, named `real-...` if it came from a player or `synthetic-...` if you
   wrote it by hand.
3. Write the rule and register it in `rules/index.ts`.
4. Add a test in `tests/diagnose/problems.test.ts` that checks the rule fires on the fixture,
   and one that checks it stays quiet on a log where it should not fire. False alarms
   are worse than a missed diagnosis.

## Code and text

- Match the style of the file you are editing. Read a few neighbours first.
- Comments are kept to a minimum. Explain why in the pull request instead.
- All text on the site is English and written for a worldwide audience. No slang, no
  jokes that need a specific country to land, no country specific examples.
- Keep the design as it is. Colors come from `src/styles/_tokens.scss`, icons come from
  Phosphor, corners are square.

## Pull requests

- One change per pull request.
- Say what changed and why, and how you checked it.
- Do not commit `.env` files, real logs with personal details, or generated folders.
- Keep the commit messages short and in the present tense: `fix: read Java 25 from crash reports`.

## What you agree to

By opening a pull request you confirm that you wrote your contribution, or that you have the
right to share it. You license it to LogicByte under the same terms as the rest of minelog
(PolyForm Shield 1.0.0), and you also grant LogicByte a perpetual, worldwide, royalty free
and irrevocable right to use, change, sublicense and relicense it, including under different
terms in the future. You keep the copyright to what you wrote. If that is not acceptable,
please do not send code, but bug reports and ideas are always welcome.

## Conduct

Be kind and assume good faith. See the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please do not report vulnerabilities in public issues. See [SECURITY.md](SECURITY.md).
