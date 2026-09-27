import bannedWords from "@/content/banned-words.json";

export type ModerationCategory = "sexual" | "hate" | "violence";

export type ModerationResult = {
  blocked: boolean;
  category?: ModerationCategory;
  message?: string;
};

const HATE = new Set([
  "beaner",
  "beaners",
  "coon",
  "coons",
  "darkie",
  "honkey",
  "jigaboo",
  "jiggaboo",
  "jiggerboo",
  "nigga",
  "nigger",
  "nig nog",
  "paki",
  "pikey",
  "raghead",
  "slanteye",
  "spic",
  "towelhead",
  "wetback",
  "white power",
  "swastika",
  "neonazi",
]);

const VIOLENCE = new Set<string>();

function normalize(value: string): string {
  return (
    value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\u200b-\u200d\ufeff]/g, "")
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseToSource(phrase: string): string {
  return phrase.split(/\s+/).map(escapeRegExp).join("\\s+");
}

let cachedExpression: RegExp | null = null;
let cachedCategoryOf: Map<string, ModerationCategory> | null = null;

function compiled(): { expression: RegExp; categoryOf: Map<string, ModerationCategory> } {
  if (cachedExpression && cachedCategoryOf) {
    return { expression: cachedExpression, categoryOf: cachedCategoryOf };
  }

  const categoryOf = new Map<string, ModerationCategory>();
  const sources: string[] = [];

  const words = [...new Set((bannedWords as string[]).map(normalize))].filter(
    (word) => word.length > 0,
  );
  words.sort((a, b) => b.length - a.length);

  for (const word of words) {
    categoryOf.set(
      word,
      HATE.has(word) ? "hate" : VIOLENCE.has(word) ? "violence" : "sexual",
    );
    sources.push(phraseToSource(word));
  }

  const expression = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${sources.join("|")})(?![\\p{L}\\p{N}_])`,
    "iu",
  );

  cachedExpression = expression;
  cachedCategoryOf = categoryOf;
  return { expression, categoryOf };
}

const EXCERPT_CONTEXT = 40;

function describeMatch(text: string, cleaned: string, at: number, length: number): string {
  const lineStart = cleaned.lastIndexOf("\n", at - 1) + 1;
  const line = cleaned.slice(0, at).split("\n").length;

  const original = text.split("\n")[line - 1]?.replace(/\r$/, "") ?? "";
  const from = Math.max(0, at - lineStart - EXCERPT_CONTEXT);
  const to = at - lineStart + length + EXCERPT_CONTEXT;
  const excerpt = `${from > 0 ? "…" : ""}${original.slice(from, to).trim()}${to < original.length ? "…" : ""}`;

  return `Line ${line} doesn't pass our content filter: "${excerpt}". Remove it and try again.`;
}

export function checkModeration(text: string): ModerationResult {
  if (!text) return { blocked: false };
  const { expression, categoryOf } = compiled();
  const cleaned = normalize(text);
  const match = expression.exec(cleaned);
  if (!match) return { blocked: false };
  const category = categoryOf.get(match[0].toLowerCase().replace(/\s+/g, " ").trim());
  return {
    blocked: true,
    category: category ?? "sexual",
    message: describeMatch(text, cleaned, match.index, match[0].length),
  };
}

const LEETSPEAK: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
  "!": "i",
};

const INSIDE_MIN_LENGTH = 6;

function unleet(value: string): string[] {
  const base = value.replace(/[013457@$!]/g, (char) => LEETSPEAK[char] ?? char);
  return value.includes("1")
    ? [base, value.replace(/1/g, "l").replace(/[03457@$!]/g, (char) => LEETSPEAK[char] ?? char)]
    : [base];
}

const INSIDE_SHORT = ["porn", "slut", "jizz", "bdsm"];

let cachedSquashed: { all: Set<string>; long: string[] } | null = null;

function squashedWords(): { all: Set<string>; long: string[] } {
  if (cachedSquashed) return cachedSquashed;
  const all = new Set<string>();
  for (const word of compiled().categoryOf.keys()) {
    const letters = word.replace(/[^\p{L}]/gu, "");
    if (letters.length >= 3) all.add(letters);
  }
  const long = [
    ...[...all].filter((word) => word.length >= INSIDE_MIN_LENGTH),
    ...INSIDE_SHORT,
  ];
  cachedSquashed = { all, long };
  return cachedSquashed;
}

export function checkNameModeration(name: string): boolean {
  if (!name) return false;
  if (checkModeration(name).blocked) return true;

  const spaced = name
    .normalize("NFKC")
    .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2");

  for (const token of spaced.split(/[^\p{L}\p{N}@$!]+/u)) {
    if (!token) continue;
    if (unleet(token.toLowerCase()).some((form) => checkModeration(form).blocked)) {
      return true;
    }
  }

  const { all, long } = squashedWords();
  return unleet(normalize(name)).some((form) => {
    const squashed = form.replace(/[^\p{L}]/gu, "");
    return all.has(squashed) || long.some((word) => squashed.includes(word));
  });
}

export function moderationMessage(message?: string): string {
  return (
    message ??
    "Part of this log doesn't pass our content filter. Remove it and try again."
  );
}

