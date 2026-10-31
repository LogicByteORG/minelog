export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30})[a-z0-9]$/;

export const PAGE_NAME_MAX = 40;

export const RADIUS_MAX = 24;

// The report line under every log is part of minelog's moderation. It is never a switch.

export const LOGO_URL_MAX = 200;

// Every switch the owner can flip. The label and hint are what the editor shows.
export const PAGE_FEATURES = [
  {
    key: "share",
    label: "Share link",
    hint: "The copy-link button and QR code at the top of a log.",
  },
  {
    key: "analysis",
    label: "Analysis",
    hint: "Game version, loader, Java and the problems minelog finds.",
  },
  {
    key: "askAi",
    label: "Ask AI",
    hint: "The menu that hands the log excerpt to an AI assistant.",
  },
  {
    key: "raw",
    label: "Raw text",
    hint: "The Raw button that opens the whole log as plain text.",
  },
  {
    key: "details",
    label: "Log details",
    hint: "The badges for hidden private details and where the log came from.",
  },
] as const;

export type PageFeature = (typeof PAGE_FEATURES)[number]["key"];

export type PageFeatures = Record<PageFeature, boolean>;

export const DEFAULT_FEATURES: PageFeatures = {
  share: true,
  analysis: true,
  askAi: true,
  raw: true,
  details: true,
};

export function readFeatures(value: unknown): PageFeatures {
  const stored = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const features = { ...DEFAULT_FEATURES };
  for (const { key } of PAGE_FEATURES) {
    if (typeof stored[key] === "boolean") features[key] = stored[key];
  }
  return features;
}

const RESERVED_SLUGS = new Set(["new", "logo", "api", "admin", "dash", "minelog", "www"]);

export type SlugCheck = { ok: true; slug: string } | { ok: false; error: string };

export function checkSlug(raw: unknown): SlugCheck {
  const slug = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      error: "Use 3 to 32 letters, numbers or hyphens, starting and ending with a letter or number.",
    };
  }
  if (RESERVED_SLUGS.has(slug)) return { ok: false, error: "That address is reserved. Pick another." };
  return { ok: true, slug };
}

// A page starts with a random address. Nobody has to think of a name first.
export function randomSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `page-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function checkRadius(raw: unknown): number | null {
  const value = typeof raw === "string" ? Number(raw) : raw;
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  return value >= 0 && value <= RADIUS_MAX ? value : null;
}

export type LinkCheck = { ok: true; url: string | null } | { ok: false; error: string };

// Where the logo sends people. An empty value means the logo links nowhere.
export function checkLogoUrl(raw: unknown): LinkCheck {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (text === "") return { ok: true, url: null };
  if (text.length > LOGO_URL_MAX) {
    return { ok: false, error: `Use ${LOGO_URL_MAX} characters or fewer for the link.` };
  }
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    return { ok: false, error: "That link isn't a full web address. Start it with https://." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Links must start with https:// or http://." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "Remove the username and password from the link." };
  }
  return { ok: true, url: parsed.toString() };
}

export type LogoSources = { light: string; dark: string } | null;

export const cdnPath = (userId: string, pageId: string, imageId: string) =>
  `/cdn/${userId}/${pageId}/${imageId}`;

// One uploaded logo serves both themes, two give each theme its own.
export function logoSources(
  page: { userId: string; id: string; logoLightId: string | null; logoDarkId: string | null },
  base: string,
): LogoSources {
  const at = (image: string | null) => (image ? `${base}${cdnPath(page.userId, page.id, image)}` : null);
  const light = at(page.logoLightId);
  const dark = at(page.logoDarkId);
  const first = light ?? dark;
  if (!first) return null;
  return { light: light ?? first, dark: dark ?? first };
}

export type LogoType ="image/png" | "image/jpeg" | "image/webp";

// The browser's file type can be faked, so the first bytes decide.
export function sniffLogo(bytes: Uint8Array): LogoType | null {
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length > 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export const COLOR_FIELDS = [
  { key: "background", label: "Page background", group: "page" },
  { key: "surface", label: "Panels and code", group: "page" },
  { key: "text", label: "Text", group: "page" },
  { key: "muted", label: "Quiet text", group: "page" },
  { key: "border", label: "Lines and borders", group: "page" },
  { key: "accent", label: "Accent", group: "page" },
  { key: "headerBackground", label: "Header background", group: "header" },
  { key: "buttonBg", label: "Button background", group: "button" },
  { key: "buttonText", label: "Button text", group: "button" },
  { key: "buttonHover", label: "Button hover", group: "button" },
  { key: "buttonBorder", label: "Button border", group: "button" },
] as const;

export type ColorKey = (typeof COLOR_FIELDS)[number]["key"];

export const BUTTON_SIZES = ["small", "normal", "large"] as const;

export type ButtonSize = (typeof BUTTON_SIZES)[number];

export const LOGO_HEIGHT = { min: 20, max: 96, fallback: 32 } as const;

export const BORDER_WIDTH_MAX = 4;

export type PageTheme = Partial<Record<ColorKey, string>> & {
  buttonSize: ButtonSize;
  buttonBorderWidth: number | null;
  buttonUppercase: boolean;
  logoHeight: number;
  showName: boolean;
};

export const DEFAULT_THEME: PageTheme = {
  buttonSize: "normal",
  buttonBorderWidth: null,
  buttonUppercase: false,
  logoHeight: LOGO_HEIGHT.fallback,
  showName: false,
};

const HEX = /^#[0-9a-f]{6}$/;

export const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && HEX.test(value);

function intIn(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

// Only values that pass are kept, so what reaches the stylesheet is always a hex color or a small number.
export function readTheme(value: unknown): PageTheme {
  const stored = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const theme: PageTheme = { ...DEFAULT_THEME };
  for (const { key } of COLOR_FIELDS) {
    const color = typeof stored[key] === "string" ? stored[key].toLowerCase() : null;
    if (isHexColor(color)) theme[key] = color;
  }
  const size = stored.buttonSize;
  if (BUTTON_SIZES.includes(size as ButtonSize)) theme.buttonSize = size as ButtonSize;
  theme.buttonBorderWidth = intIn(stored.buttonBorderWidth, 0, BORDER_WIDTH_MAX);
  theme.buttonUppercase = stored.buttonUppercase === true;
  theme.showName = stored.showName === true;
  theme.logoHeight = intIn(stored.logoHeight, LOGO_HEIGHT.min, LOGO_HEIGHT.max) ?? LOGO_HEIGHT.fallback;
  return theme;
}

// Black or white, whichever reads better on the given color.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function readableOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#0e1013" : "#f8faf9";
}

// The first color laid over the second at the given strength, as a hex color.
export function mixHex(from: string, to: string, amount: number): string {
  const part = (at: number) =>
    Math.round(
      parseInt(from.slice(at, at + 2), 16) * amount + parseInt(to.slice(at, at + 2), 16) * (1 - amount),
    );
  return "#" + [1, 3, 5].map((at) => part(at).toString(16).padStart(2, "0")).join("");
}

const LIGHT_STATUS = {
  "lv-warn": "#8a5a00",
  "lv-error": "#b42323",
  "tok-keyword": "#7a3fb0",
  "tok-string": "#1a7f37",
  "tok-number": "#0b6b8f",
  "tok-type": "#9a5a0a",
  "tok-func": "#1f5fbf",
  "callout-tip": "#1a7f37",
  "callout-info": "#0969da",
};
const DARK_STATUS = {
  "lv-warn": "#e0a64b",
  "lv-error": "#ee6b6b",
  "tok-keyword": "#c39bf0",
  "tok-string": "#7fd08f",
  "tok-number": "#6cc4e8",
  "tok-type": "#e6b86a",
  "tok-func": "#7db4ff",
  "callout-tip": "#4ac26b",
  "callout-info": "#6cb6ff",
};

const SIZE_RULES: Record<ButtonSize, string> = {
  small: "min-height:2rem;padding:0 .75rem;font-size:.8125rem",
  normal: "",
  large: "min-height:3rem;padding:0 1.5rem;font-size:1.0625rem",
};

// The stylesheet for one page. Nothing set means the minelog look. Once the background or the
// text color is set, the rest of the palette (lines, muted text, hover, syntax and status colors)
// follows from them, so a page can never end up with white text on a white background.
export function pageCss(theme: PageTheme, radius: number, withBody = true): string {
  const vars: string[] = [];
  const rules: string[] = [];
  const set = (name: string, value: string | undefined) => {
    if (value) vars.push("--" + name + ":" + value);
  };

  const bg = theme.background ?? (theme.text ? readableOn(theme.text) : undefined);
  const ink = theme.text ?? (theme.background ? readableOn(theme.background) : undefined);
  const dark = bg ? luminance(bg) <= 0.4 : null;

  if (bg && ink) {
    const surface = theme.surface ?? mixHex(ink, bg, 0.05);
    set("bg", bg);
    set("ink", ink);
    set("surface", surface);
    set("surface-2", mixHex(ink, surface, 0.08));
    set("line", theme.border ?? mixHex(ink, bg, 0.16));
    set("muted", theme.muted ?? mixHex(ink, bg, 0.62));
    set("hover-bg", mixHex(ink, bg, 0.08));
    set("press-bg", mixHex(ink, bg, 0.15));
    for (const [name, value] of Object.entries(dark ? DARK_STATUS : LIGHT_STATUS)) set(name, value);
    vars.push("color-scheme:" + (dark ? "dark" : "light"));
  } else {
    set("surface", theme.surface);
    set("muted", theme.muted);
    set("line", theme.border);
  }

  const accent = theme.accent ?? ink;
  if (accent) {
    set("accent", accent);
    set("accent-ink", readableOn(accent));
    set("accent-hover", mixHex(accent, readableOn(accent), 0.85));
    set("accent-active", mixHex(accent, readableOn(accent), 0.7));
  }
  // Menus open outside the page, so on a real page the palette also sits on the body.
  const scope = withBody ? ".brand-page,body:has(.brand-page)" : ".brand-page";
  rules.push(scope + "{" + vars.join(";") + "}");
  if (bg && withBody) rules.push("body:has(.brand-page){background:" + bg + "}");
  if (theme.headerBackground) rules.push(".brand-page .brand-head{background:" + theme.headerBackground + "}");
  if (dark !== null) {
    // The logo follows the page's own light or dark, not the visitor's system setting.
    const [shown, hidden] = dark ? ["dark", "light"] : ["light", "dark"];
    rules.push(
      ".brand-page .logo__mark--" + shown + "{opacity:1}",
      ".brand-page .logo__mark--" + hidden + "{opacity:0}",
      ".brand-page .brand-logo.brand-logo--" + shown + "{display:block}",
      ".brand-page .brand-logo.brand-logo--" + hidden + "{display:none}",
    );
  }

  rules.push(".brand-page .brand-logo{height:" + theme.logoHeight + "px}");
  rules.push(".brand-page .brand-head__bar{height:max(3.75rem," + (theme.logoHeight + 24) + "px)}");

  const button: string[] = [];
  if (theme.buttonBg) button.push("background-color:" + theme.buttonBg);
  if (theme.buttonText) button.push("color:" + theme.buttonText);
  if (theme.buttonBorder) button.push("border-color:" + theme.buttonBorder);
  if (theme.buttonBorderWidth !== null) {
    button.push("border-style:solid;border-width:" + theme.buttonBorderWidth + "px");
  }
  if (theme.buttonUppercase) button.push("text-transform:uppercase;letter-spacing:.04em");
  if (SIZE_RULES[theme.buttonSize]) button.push(SIZE_RULES[theme.buttonSize]);
  button.push("border-radius:" + radius + "px");
  rules.push(".brand-page .button.button{" + button.join(";") + "}");
  if (theme.buttonHover) {
    rules.push(".brand-page .button.button:hover{background-color:" + theme.buttonHover + "}");
  }
  // The same corner radius rounds the rest of the controls, so a page reads as one design.
  rules.push(
    ".brand-page :is(button,input:not([type=checkbox],[type=radio],[type=range]),select,textarea,.action,.search__toggle,.search__tool,.search__input,.share-link,.workspace__viewer,.settings,.setting__select,.to-top,.ask-ai__menu,.search,.chip-split,.chip,.segmented,.source-badge,.callout){border-radius:" +
      radius +
      "px}",
    ".brand-page :is(.share-link,.workspace__viewer,.chip-split,.segmented){overflow:clip}",
    ".brand-page :is(.chip-split,.segmented) :is(button,.chip,.chip-split__nav,.chip-split__step){border-radius:0}",
  );
  // Menus, panels and tooltips open outside the page, so they are matched from the body.
  if (withBody) {
    rules.push(
      "body:has(.brand-page) :is(.analyze__panel,.problems__panel,.ask-ai__menu,.tooltip,.dialog){border-radius:" +
        radius +
        "px}",
      "body:has(.brand-page) .ask-ai__menu{overflow:clip}",
    );
  }
  return rules.join("\n");
}

type PresetColors = Pick<PageTheme, "background" | "surface" | "text" | "muted" | "border" | "accent">;

// The look a preset sets: page colors, corner radius and the button colors. Buttons left out go
// back to the minelog default, so picking a preset never leaves old button colors behind.
export type ThemePreset = {
  id: string;
  label: string;
  radius: number;
  colors: PresetColors;
  buttons: Pick<PageTheme, "buttonBg" | "buttonText" | "buttonHover" | "buttonBorder">;
};

// Soft buttons: a quiet tint of the accent, the accent as text, a faint line.
const soft = (accent: string, bg: string): ThemePreset["buttons"] => ({
  buttonBg: mixHex(accent, bg, 0.14),
  buttonText: accent,
  buttonHover: mixHex(accent, bg, 0.24),
  buttonBorder: mixHex(accent, bg, 0.32),
});

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    label: "Midnight",
    radius: 0,
    colors: { background: "#0e1013", surface: "#161a1f", text: "#eef0f2", muted: "#98a2ad", border: "#262c33", accent: "#eef0f2" },
    buttons: {},
  },
  {
    id: "paper",
    label: "Paper",
    radius: 2,
    colors: { background: "#ffffff", surface: "#f4f5f6", text: "#14181c", muted: "#5b6672", border: "#e1e4e8", accent: "#14181c" },
    buttons: {},
  },
  {
    id: "ocean",
    label: "Ocean",
    radius: 6,
    colors: { background: "#08141f", surface: "#0f2233", text: "#e6f1fb", muted: "#8fb0cc", border: "#1d3a54", accent: "#3aa0ff" },
    buttons: soft("#3aa0ff", "#08141f"),
  },
  {
    id: "forest",
    label: "Forest",
    radius: 4,
    colors: { background: "#0d1a14", surface: "#14291f", text: "#e8f5ee", muted: "#8fb9a2", border: "#1f3d2f", accent: "#3ddc84" },
    buttons: soft("#3ddc84", "#0d1a14"),
  },
  {
    id: "violet",
    label: "Violet",
    radius: 12,
    colors: { background: "#130d24", surface: "#1c1334", text: "#f1e9ff", muted: "#b3a0dd", border: "#2f2250", accent: "#a770ff" },
    buttons: soft("#a770ff", "#130d24"),
  },
  {
    id: "sunset",
    label: "Sunset",
    radius: 8,
    colors: { background: "#1c0f0f", surface: "#2a1717", text: "#fff0e8", muted: "#d3a999", border: "#432424", accent: "#ff7a45" },
    buttons: soft("#ff7a45", "#1c0f0f"),
  },
];
