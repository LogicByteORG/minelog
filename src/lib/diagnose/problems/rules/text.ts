export function baseName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export function limit(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function fileNames(list: string, max = 3): string[] {
  const names = list
    .split(/,\s*|\s+and\s+|[[\]]/)
    .map((part) => baseName(part.trim()))
    .filter((part) => part.length > 0);
  return [...new Set(names)].slice(0, max);
}

export function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
