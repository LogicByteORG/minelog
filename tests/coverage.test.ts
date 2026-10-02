import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/coverage/route";
import { coverageSnapshot, recordCoverage } from "../src/lib/diagnose/coverage";

test("coverage counts runs and hits by problem id", () => {
  const before = coverageSnapshot().runs;
  recordCoverage([
    { id: "cov-test-hit", message: "Something broke.", solutions: ["Try again."], count: 1, line: 1 },
  ]);
  recordCoverage([]);
  const after = coverageSnapshot();
  assert.equal(after.runs, before + 2);
  assert.ok((after.hits["cov-test-hit"] ?? 0) >= 1);
});

test("the coverage address looks like it does not exist without the secret", async () => {
  const call = (authorization?: string) =>
    GET(
      new Request(
        "http://localhost/api/coverage",
        authorization ? { headers: { authorization } } : undefined,
      ),
    );
  const before = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    assert.equal(call().status, 404);
    assert.equal(call("Bearer anything").status, 404);

    process.env.CRON_SECRET = "a-long-enough-secret";
    assert.equal(call().status, 404);
    assert.equal(call("Bearer not-the-secret").status, 404);

    const open = call("Bearer a-long-enough-secret");
    assert.equal(open.status, 200);
    const body = (await open.json()) as { runs: number; hits: Record<string, number> };
    assert.equal(typeof body.runs, "number");
    assert.equal(typeof body.hits, "object");
  } finally {
    if (before === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = before;
  }
});
