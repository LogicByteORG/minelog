import type { Insights } from "@/lib/diagnose/insights";
import { javaText, launcherText, loaderText } from "@/lib/diagnose/present";
import type { Fact } from "@/lib/diagnose/types";

function compatAnalysis(insights: Insights) {
  return {
    problems: insights.problems.map((problem) => ({
      message: problem.message,
      counter: problem.count,
      entry: insights.entryAt(problem.line),
      solutions: problem.solutions.map((message) => ({ message })),
    })),
    information: insights.information.map((info) => ({
      message: `${info.label}: ${info.value}`,
      counter: 1,
      label: info.label,
      value: info.value,
      entry: insights.entryAt(info.line),
    })),
  };
}

export function describeCompatInsights(insights: Insights) {
  return {
    success: true,
    id: `${insights.software.id}/${insights.type.id}`,
    name: insights.software.name,
    type: insights.type.name,
    version: insights.version,
    title: insights.title,
    analysis: compatAnalysis(insights),
  };
}

export function describeCompatContentInsights(insights: Insights) {
  return compatAnalysis(insights);
}

function fact(found: Fact | undefined, text: (found: Fact) => string) {
  if (!found) return null;
  return {
    value: found.value,
    text: text(found),
    detail: found.detail ?? null,
    confidence: found.confidence,
    lines: found.lines,
    others: found.others,
  };
}

export function describeV2Insights(insights: Insights) {
  const { environment } = insights;
  return {
    kind: insights.kind,
    title: insights.title,
    software: insights.software,
    minecraftVersion: environment.gameVersion?.value ?? null,
    environment: {
      gameVersion: fact(environment.gameVersion, (found) => found.value),
      loader: fact(environment.loader, loaderText),
      java: fact(environment.java, javaText),
      launcher: fact(environment.launcher, launcherText),
      conflicts: environment.conflicts,
    },
    mods: environment.mods.map((mod) => ({
      kind: mod.kind,
      name: mod.name,
      id: mod.id ?? null,
      version: mod.version ?? null,
      line: mod.line,
    })),
    bundledMods: environment.bundled,
    problems: insights.problems,
  };
}

