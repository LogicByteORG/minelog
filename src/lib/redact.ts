export type RedactionFinding = {
  id: string;
  label: string;
  count: number;
};

type Rule = {
  id: string;
  singular: string;
  plural: string;
  pattern: RegExp;
  replace: (match: string, ...groups: string[]) => string;
};

const HIDDEN = "[redacted]";

const RULES: Rule[] = [
  {
    id: "launch-token",
    singular: "access token",
    plural: "access tokens",
    pattern: /(--accessToken\s+)(\S+)/gi,
    replace: (_m, flag) => `${flag}${HIDDEN}`,
  },
  {
    id: "jwt",
    singular: "access token",
    plural: "access tokens",
    pattern: /\beyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{4,}\b/g,
    replace: () => HIDDEN,
  },
  {
    id: "secret",
    singular: "secret value",
    plural: "secret values",
    pattern: /\b(token|password|passwd|secret|api[_-]?key)(\s*[=:]\s*)(\S+)/gi,
    replace: (_m, key, glue) => `${key}${glue}${HIDDEN}`,
  },
  {
    id: "email",
    singular: "email address",
    plural: "email addresses",
    pattern: /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,254}@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
    replace: () => HIDDEN,
  },
  {
    id: "mac",
    singular: "MAC address",
    plural: "MAC addresses",
    pattern: /(?<![\w:-])(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}(?![\w:-])/g,
    replace: () => HIDDEN,
  },
  {
    id: "windows-user",
    singular: "user folder name",
    plural: "user folder names",
    pattern: /([A-Za-z]:[\\/]Users[\\/])([^\\/\r\n:*?"<>|]+)/g,
    replace: (m, prefix, name) =>
      isSharedFolder(name) ? m : `${prefix}${HIDDEN}`,
  },
  {
    id: "unix-user",
    singular: "user folder name",
    plural: "user folder names",
    pattern: /(\/(?:Users|home)\/)([^/\s:]+)/g,
    replace: (m, prefix, name) =>
      isSharedFolder(name) ? m : `${prefix}${HIDDEN}`,
  },
  {
    id: "ipv4",
    singular: "IP address",
    plural: "IP addresses",
    pattern:
      /(?<![\w.])(?<!^[ \t]*(?:-|[|\\]--)[ \t]+\S+[ \t])(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?!\w)/gm,
    replace: (m) => (isLocalAddress(m) ? m : HIDDEN),
  },
];

const SHARED_FOLDERS = new Set(["public", "default", "shared", "container"]);

function isSharedFolder(name: string): boolean {
  return SHARED_FOLDERS.has(name.toLowerCase());
}

function isLocalAddress(ip: string): boolean {
  return ip.startsWith("127.") || ip === "0.0.0.0";
}

export function redact(text: string): { text: string; findings: RedactionFinding[] } {
  const counts = new Map<string, RedactionFinding>();
  let output = text;

  for (const rule of RULES) {
    output = output.replace(rule.pattern, (...args: unknown[]) => {
      const groups = args.slice(0, -2) as string[];
      const [match, ...rest] = groups;
      const replaced = rule.replace(match, ...rest);
      if (replaced !== match) tally(counts, rule);
      return replaced;
    });
  }

  return { text: output, findings: summarize(counts) };
}

function tally(counts: Map<string, RedactionFinding>, rule: Rule) {
  const key = rule.plural;
  const entry = counts.get(key) ?? { id: key, label: rule.singular, count: 0 };
  entry.count += 1;
  counts.set(key, entry);
}

function summarize(counts: Map<string, RedactionFinding>): RedactionFinding[] {
  return [...counts.entries()].map(([plural, entry]) => ({
    id: entry.id,
    label: entry.count === 1 ? entry.label : plural,
    count: entry.count,
  }));
}

