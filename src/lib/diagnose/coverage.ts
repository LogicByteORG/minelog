import type { Problem } from "./problems";

let runs = 0;
const hits = new Map<string, number>();

export function recordCoverage(problems: Problem[]): void {
  runs += 1;
  for (const problem of problems) {
    hits.set(problem.id, (hits.get(problem.id) ?? 0) + 1);
  }
}

export function coverageSnapshot(): { runs: number; hits: Record<string, number> } {
  return { runs, hits: Object.fromEntries(hits) };
}
