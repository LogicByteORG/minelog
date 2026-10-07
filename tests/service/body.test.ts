import assert from "node:assert/strict";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { BodyError, readBodyText } from "../../src/lib/service/body";

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request("http://localhost/x", { method: "POST", body, headers });

const fails = async (run: () => Promise<unknown>, problem: BodyError["problem"]) => {
  await assert.rejects(run, (error: unknown) => error instanceof BodyError && error.problem === problem);
};

test("a body inside the limit is read as text", async () => {
  assert.equal(await readBodyText(post("hello log"), 100), "hello log");
  assert.equal(await readBodyText(post(null), 100), "");
});

test("a body over the limit is refused without a declared length", async () => {
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(new Uint8Array(1024));
    },
  });
  const request = new Request("http://localhost/x", {
    method: "POST",
    body: stream,
    duplex: "half",
  } as RequestInit);
  await fails(() => readBodyText(request, 10 * 1024), "too_large");
});

test("a declared length over the limit is refused straight away", async () => {
  await fails(() => readBodyText(post("x", { "content-length": "999999" }), 100), "too_large");
});

test("gzip bodies are unpacked, and a gzip bomb is stopped at the limit", async () => {
  const packed = gzipSync("line one\nline two\n");
  assert.equal(
    await readBodyText(post(packed, { "content-encoding": "gzip" }), 1000),
    "line one\nline two\n",
  );
  const bomb = gzipSync(Buffer.alloc(1_000_000, 97));
  await fails(() => readBodyText(post(bomb, { "content-encoding": "gzip" }), 10_000), "too_large");
  await fails(() => readBodyText(post("not gzip at all", { "content-encoding": "gzip" }), 1000), "bad_gzip");
});
