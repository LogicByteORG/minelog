import { NAME_PATTERN } from "./name-pattern";

export const MIN_NAME_LENGTH = 2;

export const MAX_NAME_LENGTH = 32;

export const NAME_FILTER_MESSAGE = "That name doesn't pass our content filter. Pick another one.";

export function normalizeName(raw: string): string {
  return raw.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function nameShapeProblem(name: string): string | null {
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return `Use ${MIN_NAME_LENGTH} to ${MAX_NAME_LENGTH} characters.`;
  }
  if (!NAME_PATTERN.test(name)) {
    return "Use letters, numbers, spaces and . _ + - only.";
  }
  return null;
}
