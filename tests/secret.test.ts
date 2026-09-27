import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../src/app/api/revalidate/route";
import { bearerMatches } from "../src/lib/secret";

const withAuth = (value?: string) =>
  new Request("http://localhost/x", value ? { headers: { authorization: value } } : undefined);

test("a bearer secret only matches exactly", () => {
  assert.equal(bearerMatches(withAuth("Bearer s3cret"), "s3cret"), true);
  assert.equal(bearerMatches(withAuth("Bearer s3cre"), "s3cret"), false);
  assert.equal(bearerMatches(withAuth("Bearer s3cret2"), "s3cret"), false);
  assert.equal(bearerMatches(withAuth("s3cret"), "s3cret"), false);
  assert.equal(bearerMatches(withAuth(), "s3cret"), false);
});

test("no secret configured means nothing matches", () => {
  assert.equal(bearerMatches(withAuth("Bearer "), ""), false);
  assert.equal(bearerMatches(withAuth("Bearer undefined"), undefined), false);
});

test("the revalidate address hides itself and checks what it is given", async () => {
  const before = process.env.REVALIDATE_SECRET;
  const post = (body: unknown, auth?: string) =>
    POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        headers: auth ? { authorization: auth, "content-type": "application/json" } : undefined,
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  try {
    delete process.env.REVALIDATE_SECRET;
    assert.equal((await post({ ids: [] }, "Bearer anything")).status, 404);

    process.env.REVALIDATE_SECRET = "long-enough-secret";
    assert.equal((await post({ ids: [] })).status, 404);
    assert.equal((await post({ ids: [] }, "Bearer wrong")).status, 404);

    const auth = "Bearer long-enough-secret";
    assert.equal((await post("not json", auth)).status, 400);
    assert.equal((await post({ ids: "abcd2345" }, auth)).status, 400);
    assert.equal((await post({ ids: ["short"] }, auth)).status, 400);
    assert.equal((await post({ ids: Array(257).fill("abcd2345") }, auth)).status, 400);
  } finally {
    if (before === undefined) delete process.env.REVALIDATE_SECRET;
    else process.env.REVALIDATE_SECRET = before;
  }
});
