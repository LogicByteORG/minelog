import assert from "node:assert/strict";
import test from "node:test";
import { choosePrimary } from "../src/lib/primary-provider";

const github = { providerId: "github", createdAt: new Date("2026-01-01T00:00:00Z") };
const discord = { providerId: "discord", createdAt: new Date("2026-03-01T00:00:00Z") };

test("the account you signed in with first is primary until you choose another", () => {
  assert.equal(choosePrimary(null, [discord, github]), "github");
  assert.equal(choosePrimary(null, [discord]), "discord");
});

test("a chosen primary wins while it is still connected", () => {
  assert.equal(choosePrimary("discord", [github, discord]), "discord");
});

test("a primary that was disconnected falls back to the oldest one left", () => {
  assert.equal(choosePrimary("discord", [github]), "github");
});

test("nothing connected or an unknown provider gives no primary", () => {
  assert.equal(choosePrimary(null, []), null);
  assert.equal(choosePrimary("gitlab", [{ providerId: "gitlab", createdAt: new Date() }]), null);
});
