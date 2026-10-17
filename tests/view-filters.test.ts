import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterLines,
  isChatLine,
  isEmptyLine,
  splitLinks,
  type ViewLine,
} from "../src/lib/view";
import { ALL_LEVELS_ON, type Query } from "../src/lib/view";

const NO_QUERY: Query = { test: null, highlight: null, invalid: false };

function line(n: number, text: string): ViewLine {
  return { n, text, level: "info", group: "info", start: true };
}

test("player chat lines are detected", () => {
  const chat = [
    "[12:00:01] [Server thread/INFO]: <Steve> hello everyone",
    "[12:00:01] [Server thread/INFO]: [Not Secure] <Alex> hi",
    "[12:00:01] [Server thread/INFO]: [Server] welcome",
    "[12:00:01] [Async Chat Thread #0/INFO]: <Steve> async hi",
    "[12:00:01 INFO]: <Steve> bukkit style",
    "[12:00:01 INFO]: Steve issued server command: /home",
  ];
  for (const text of chat) assert.equal(isChatLine(text), true, text);
});

test("system lines are not chat", () => {
  const plain = [
    "[12:00:01] [Server thread/INFO]: Steve joined the game",
    "[12:00:01] [Server thread/INFO]: Steve left the game",
    "[12:00:01] [Server thread/ERROR]: Something broke",
    "    at com.example.Main.run(Main.java:10)",
    "",
    "[12:00:01] [Server thread/INFO]: Starting minecraft server",
  ];
  for (const text of plain) assert.equal(isChatLine(text), false, text);
});

test("empty lines are detected", () => {
  assert.equal(isEmptyLine(""), true);
  assert.equal(isEmptyLine("   "), true);
  assert.equal(isEmptyLine("[12:00:01] [Server thread/INFO]: hi"), false);
});

test("hideChat and hideEmpty filter lines", () => {
  const lines = [
    line(1, "[12:00:01] [Server thread/INFO]: <Steve> hi"),
    line(2, ""),
    line(3, "[12:00:01] [Server thread/INFO]: done"),
  ];
  assert.deepEqual(
    filterLines(lines, { levels: ALL_LEVELS_ON, onlyMatches: false }, NO_QUERY).map((l) => l.n),
    [1, 2, 3],
  );
  assert.deepEqual(
    filterLines(lines, { levels: ALL_LEVELS_ON, onlyMatches: false, hideChat: true }, NO_QUERY).map((l) => l.n),
    [2, 3],
  );
  assert.deepEqual(
    filterLines(lines, { levels: ALL_LEVELS_ON, onlyMatches: false, hideEmpty: true }, NO_QUERY).map((l) => l.n),
    [1, 3],
  );
});

test("markedOnly keeps marked lines", () => {
  const lines = [line(1, "a"), line(2, "b"), line(3, "c")];
  const out = filterLines(
    lines,
    { levels: ALL_LEVELS_ON, onlyMatches: false, markedOnly: true, marks: new Set([2]) },
    NO_QUERY,
  );
  assert.deepEqual(out.map((l) => l.n), [2]);
  const none = filterLines(
    lines,
    { levels: ALL_LEVELS_ON, onlyMatches: false, markedOnly: true, marks: new Set() },
    NO_QUERY,
  );
  assert.deepEqual(none, []);
});

test("web addresses split into links", () => {
  const parts = splitLinks("see https://minelog.org/guide for help");
  assert.deepEqual(parts, [
    { text: "see ", url: null },
    { text: "https://minelog.org/guide", url: "https://minelog.org/guide" },
    { text: " for help", url: null },
  ]);
});

test("trailing punctuation stays outside the link", () => {
  const parts = splitLinks("open https://minelog.org/guide, then read.");
  assert.equal(parts[1].url, "https://minelog.org/guide");
  assert.equal(parts[2].text, ", then read.");
});

test("www addresses gain https", () => {
  const parts = splitLinks("open www.example.com/a");
  assert.equal(parts[1].url, "https://www.example.com/a");
  assert.equal(parts[1].text, "www.example.com/a");
});

test("a redacted address never becomes a link", () => {
  const text = "get it at http://[redacted]/launcher.exe now";
  assert.deepEqual(splitLinks(text), [{ text, url: null }]);
});

test("plain text and unsafe schemes stay unlinked", () => {
  assert.deepEqual(splitLinks("just words"), [{ text: "just words", url: null }]);
  assert.deepEqual(splitLinks("write to ops@example.com"), [
    { text: "write to ops@example.com", url: null },
  ]);
  assert.deepEqual(splitLinks("run javascript:alert(1)"), [
    { text: "run javascript:alert(1)", url: null },
  ]);
});
