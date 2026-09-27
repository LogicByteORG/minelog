import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/heartbeat/route";

const call = (authorization?: string) =>
  GET(new Request("http://localhost/api/heartbeat", authorization ? { headers: { authorization } } : undefined));

test("the heartbeat address looks like it does not exist without the secret", async () => {
  const before = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    assert.equal((await call()).status, 404);
    assert.equal((await call("Bearer anything")).status, 404);

    process.env.CRON_SECRET = "a-long-enough-secret";
    assert.equal((await call()).status, 404);
    assert.equal((await call("Bearer not-the-secret")).status, 404);
    assert.equal((await call("a-long-enough-secret")).status, 404);
  } finally {
    if (before === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = before;
  }
});
