import type { LogKind } from "../../log";
import type { Span } from "../entries";
import { clipLine } from "../parse";
import type { Environment } from "../types";
import { RULES } from "./rules";
import type { Problem, Rule } from "./types";

export type { Problem, Rule } from "./types";

export const MAX_PROBLEMS = 50;

type Input = {
  lines: string[];
  spans: Span[];
  environment: Environment;
  kind: LogKind;
};

export function findProblems({ lines, spans, environment, kind }: Input, rules: Rule[] = RULES): Problem[] {
  const found = new Map<string, { problem: Problem; minCount: number }>();

  for (const span of spans) {
    if (span.chat) continue;
    const head = clipLine(lines[span.from - 1]);

    for (let number = span.from; number <= span.to; number += 1) {
      const line = clipLine(lines[number - 1]);
      for (const rule of rules) {
        const finding = rule.read(line, { head, environment, kind });
        if (!finding) continue;

        const key = `${rule.id}:${finding.key}`;
        const known = found.get(key);
        if (known) {
          known.problem.count += 1;
        } else {
          found.set(key, {
            minCount: rule.minCount ?? 1,
            problem: {
              id: rule.id,
              message: finding.message,
              solutions: finding.solutions,
              count: 1,
              line: number,
            },
          });
        }
      }
    }
  }

  return [...found.values()]
    .filter(({ problem, minCount }) => problem.count >= minCount)
    .map(({ problem }) => problem)
    .sort((a, b) => a.line - b.line)
    .slice(0, MAX_PROBLEMS);
}

