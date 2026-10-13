import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const dir = path.join(process.cwd(), "public", "favicon.ico");

test("every favicon file exists and is not empty", () => {
  for (const file of [
    "favicon.svg",
    "favicon-96x96.png",
    "favicon.ico",
    "apple-touch-icon.png",
    "web-app-manifest-192x192.png",
    "web-app-manifest-512x512.png",
    "site.webmanifest",
  ]) {
    const full = path.join(dir, file);
    assert.ok(existsSync(full), `missing ${file}`);
    assert.ok(statSync(full).size > 0, `empty ${file}`);
  }
});
