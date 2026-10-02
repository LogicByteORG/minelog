import assert from "node:assert/strict";
import { test } from "node:test";
import * as docs from "../src/content/api-docs";
import { GENERIC_PROBLEM_IDS } from "../src/lib/diagnose/problems";
import { RULES } from "../src/lib/diagnose/problems/rules";

test("every problem the finder knows is documented, and nothing else is", () => {
  const known = [...RULES.map((rule) => rule.id), ...GENERIC_PROBLEM_IDS].sort();
  const documented = docs.PROBLEM_DOCS.map((row) => row.id).sort();
  assert.deepEqual(documented, known);
  assert.equal(new Set(known).size, known.length, "problem ids must be unique");
});

test("the compatibility table lists every mclo.gs endpoint and none is left out", () => {
  const wanted = [
    "POST /1/log",
    "GET /1/log/{id}",
    "DELETE /1/log/{id}",
    "POST /1/bulk/log/delete",
    "GET /1/raw/{id}",
    "GET /1/insights/{id}",
    "POST /1/analyse",
    "GET /1/limits",
    "GET /1/filters",
  ];
  const listed = docs.COMPAT.map((row) => `${row.method} ${row.path}`);
  assert.deepEqual([...listed].sort(), [...wanted].sort());
  for (const row of docs.COMPAT) {
    assert.ok(["Supported", "Different"].includes(row.support), `${row.path} is ${row.support}`);
  }
});

test("the example answers are real, valid JSON", () => {
  const insights = JSON.parse(docs.INSIGHTS_JSON);
  assert.equal(insights.title, "Paper 1.20.1 Server Log");
  assert.equal(insights.problems[0].id, "out-of-memory");

  const compat = JSON.parse(docs.COMPAT_INSIGHTS_JSON);
  assert.equal(compat.success, true);
  assert.equal(compat.id, "paper/server");
  assert.equal(compat.analysis.problems.length, 1);
  assert.equal(compat.analysis.information.length, 2);

  const limits = JSON.parse(docs.LIMITS_JSON);
  assert.ok(limits.maxAnalyseBytes > 0 && limits.analysesPerMinute > 0);
});

test("the docs copy has no em dashes or curly quotes", () => {
  const text = JSON.stringify(docs);
  assert.ok(!/[—–‘’“”]/.test(text));
});

