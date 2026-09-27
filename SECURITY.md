# Security

minelog stores logs that people paste, so we take leaks and abuse seriously.

## Reporting a vulnerability

Please email **report@minelog.org** instead of opening a public issue. Include:

- what you found and where
- steps to reproduce it
- what an attacker could do with it

We aim to reply within a few days, and we will tell you when it is fixed. Please give us
a reasonable amount of time to fix the problem before you share it publicly.

## What counts

Things we especially want to hear about:

- a way to read, change or delete a log that is not yours
- private details that survive redaction (addresses, tokens, folder names, emails)
- ways to overload the service with small requests or crafted logs
- anything that exposes the database or the server's secrets

## What we ask of you

- Test only against your own logs and your own local copy of minelog.
- Do not read or keep other people's data.
- Do not run load tests against minelog.org.
