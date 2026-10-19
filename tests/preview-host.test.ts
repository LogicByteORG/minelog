import assert from "node:assert/strict";
import { test } from "node:test";
import { pageBase, siteUrl } from "../src/lib/site";
import { API_BASE, SITE_BASE } from "../src/lib/config";

const KEYS = ["SITE_URL", "VERCEL_ENV", "VERCEL_URL", "NODE_ENV"] as const;

function target(): Record<string, string | undefined> {
  return process.env as Record<string, string | undefined>;
}

function snapshot(): Record<string, string | undefined> {
  return Object.fromEntries(KEYS.map((key) => [key, target()[key]]));
}

function restore(saved: Record<string, string | undefined>) {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete target()[key];
    else target()[key] = saved[key];
  }
}

function setup(env: Record<string, string | undefined>) {
  for (const key of KEYS) delete target()[key];
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) target()[key] = value;
  }
}

test("an explicit site address always wins", () => {
  const saved = snapshot();
  try {
    setup({ SITE_URL: "https://preview.example/", VERCEL_ENV: "preview", VERCEL_URL: "other.vercel.app", NODE_ENV: "production" });
    assert.equal(pageBase(), "https://preview.example");
  } finally {
    restore(saved);
  }
});

test("preview builds use their own deployment address", () => {
  const saved = snapshot();
  try {
    setup({ VERCEL_ENV: "preview", VERCEL_URL: "minelog-git-branch.vercel.app", NODE_ENV: "production" });
    assert.equal(pageBase(), "https://minelog-git-branch.vercel.app");
  } finally {
    restore(saved);
  }
});

test("production without an address falls back to the live site", () => {
  const saved = snapshot();
  try {
    setup({ VERCEL_ENV: "production", VERCEL_URL: "minelog-git-branch.vercel.app", NODE_ENV: "production" });
    assert.equal(pageBase(), SITE_BASE);
  } finally {
    restore(saved);
  }
});

test("local development still points at localhost", () => {
  const saved = snapshot();
  try {
    setup({ NODE_ENV: "development" });
    assert.equal(pageBase(), "http://localhost:3000");
    assert.equal(siteUrl("http://localhost:3000"), "http://localhost:3000");
  } finally {
    restore(saved);
  }
});

test("documented fallbacks stay untouched", () => {
  assert.ok(SITE_BASE.startsWith("https://"));
  assert.ok(API_BASE.startsWith("https://"));
});
