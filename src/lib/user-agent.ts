export type DeviceKind = "phone" | "tablet" | "desktop";

export type Device = { browser: string; os: string; kind: DeviceKind };

const BROWSERS: [pattern: RegExp, name: string][] = [
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [pattern: RegExp, name: string][] = [
  [/Windows/, "Windows"],
  [/Android/, "Android"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux|X11/, "Linux"],
];

function firstMatch(table: [RegExp, string][], agent: string): string | null {
  for (const [pattern, name] of table) {
    if (pattern.test(agent)) return name;
  }
  return null;
}

export function describeAgent(agent: string | null | undefined): Device {
  const text = agent ?? "";
  return {
    browser: firstMatch(BROWSERS, text) ?? "Unknown browser",
    os: firstMatch(SYSTEMS, text) ?? "Unknown system",
    kind: deviceKind(text),
  };
}

function deviceKind(agent: string): DeviceKind {
  if (/iPad|Tablet/.test(agent)) return "tablet";
  if (/iPhone|iPod/.test(agent)) return "phone";
  if (/Android/.test(agent)) return /Mobile/.test(agent) ? "phone" : "tablet";
  return "desktop";
}

export function deviceLabel(device: Device): string {
  return `${device.browser} on ${device.os}`;
}
