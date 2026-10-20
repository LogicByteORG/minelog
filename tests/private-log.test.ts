import assert from "node:assert/strict";
import test from "node:test";
import { streamedText } from "../src/lib/service/respond";
import { UploadError, uploadLog } from "../src/lib/service/upload";

const request = new Request("http://localhost/api/log", { method: "POST" });

test("a private log cannot be saved without an account", async () => {
  await assert.rejects(
    uploadLog({ content: "hello", hidePrivate: true, source: "test", request, isPrivate: true }),
    (error: unknown) =>
      error instanceof UploadError && error.status === 401 && error.code === "login_required",
  );
});

test("the private flag has to be a real boolean", async () => {
  await assert.rejects(
    uploadLog({
      content: "hello",
      hidePrivate: true,
      source: "test",
      request,
      userId: "user",
      isPrivate: "yes",
    }),
    (error: unknown) => error instanceof UploadError && error.code === "invalid_option",
  );
});

test("an owner's private text is never cached or shared across sites", () => {
  const owner = streamedText("secret", { owner: true });
  assert.equal(owner.headers.get("cache-control"), "private, no-store");
  assert.equal(owner.headers.get("access-control-allow-origin"), null);

  const shared = streamedText("hello");
  assert.equal(shared.headers.get("cache-control"), "public, max-age=60");
  assert.equal(shared.headers.get("access-control-allow-origin"), "*");
});

test("an owner download keeps the attachment name", () => {
  const response = streamedText("secret", { owner: true, saveAs: "minelog-abc.txt" });
  assert.match(response.headers.get("content-disposition") ?? "", /minelog-abc\.txt/);
});
