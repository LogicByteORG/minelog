import type { Confidence, Fact, LineNo } from "./types";

export type Evidence = {
  key: string;
  label?: string;
  detail?: string;
  source: string;
  weight: number;
  line: LineNo;
};

const SHOWN = 3;
const MARGIN = 3;

type Scored = {
  key: string;
  score: number;
  sources: number;
  label: string;
  detail?: string;
  lines: LineNo[];
};

function score(evidence: Evidence[]): Scored[] {
  const byKey = new Map<string, Evidence[]>();
  for (const item of evidence) {
    const list = byKey.get(item.key);
    if (list) list.push(item);
    else byKey.set(item.key, [item]);
  }

  const scored: Scored[] = [];
  for (const [key, list] of byKey) {
    const best = new Map<string, Evidence>();
    for (const item of list) {
      const seen = best.get(item.source);
      if (!seen || item.weight > seen.weight) best.set(item.source, item);
    }
    const picked = [...best.values()].sort((a, b) => b.weight - a.weight);
    const labelled = picked.find((e) => e.label) ?? picked[0];
    scored.push({
      key,
      score: picked.reduce((sum, e) => sum + e.weight, 0),
      sources: picked.length,
      label: labelled.label ?? key,
      detail: picked.find((e) => e.detail)?.detail,
      lines: [...new Set(list.map((e) => e.line))].sort((a, b) => a - b).slice(0, 5),
    });
  }
  return scored.sort((a, b) => b.score - a.score);
}

export type Resolution =
  | { kind: "none" }
  | { kind: "conflict" }
  | { kind: "fact"; fact: Fact };

export function resolve(evidence: Evidence[]): Resolution {
  const [top, second, ...rest] = score(evidence);
  if (!top || top.score < SHOWN) return { kind: "none" };
  if (
    second &&
    second.score >= SHOWN &&
    top.score - second.score < MARGIN &&
    top.sources <= second.sources
  ) {
    return { kind: "conflict" };
  }

  const confidence: Confidence =
    top.sources >= 2 && top.score >= 4 ? "high" : "medium";

  const others = [second, ...rest]
    .filter((s): s is Scored => !!s && s.score >= SHOWN)
    .map((s) => ({ value: s.label, lines: s.lines }));

  return {
    kind: "fact",
    fact: {
      value: top.label,
      detail: top.detail,
      confidence,
      lines: top.lines,
      others,
    },
  };
}

