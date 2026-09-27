export function requiredJava(version: string): number | null {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?$/.exec(version);
  if (!match) return null;

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3] ?? 0);

  if (major >= 26) return 25;
  if (major !== 1) return null;

  if (minor <= 16) return 8;
  if (minor === 17) return 16;
  if (minor < 20 || (minor === 20 && patch <= 4)) return 17;
  return 21;
}

