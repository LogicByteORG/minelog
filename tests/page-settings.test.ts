import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_FEATURES,
  DEFAULT_THEME,
  PAGE_FEATURES,
  checkLogoUrl,
  checkRadius,
  checkSlug,
  logoSources,
  pageCss,
  THEME_PRESETS,
  isHexColor,
  readFeatures,
  readableOn,
  mixHex,
  readTheme,
  randomSlug,
  sniffLogo,
} from "../src/lib/page-settings";

test("slugs are lowercase, 3 to 32 characters and not reserved", () => {
  assert.deepEqual(checkSlug(" MyPack "), { ok: true, slug: "mypack" });
  assert.equal(checkSlug("ab").ok, false);
  assert.equal(checkSlug("-bad-").ok, false);
  assert.equal(checkSlug("has space").ok, false);
  assert.equal(checkSlug("a".repeat(33)).ok, false);
  assert.equal(checkSlug("logo").ok, false);
});

test("a new page gets a valid random address", () => {
  const slug = randomSlug();
  assert.equal(checkSlug(slug).ok, true);
  assert.notEqual(slug, randomSlug());
});

test("corner radius is a whole number from 0 to 24", () => {
  assert.equal(checkRadius("8"), 8);
  assert.equal(checkRadius(0), 0);
  assert.equal(checkRadius(25), null);
  assert.equal(checkRadius("1.5"), null);
  assert.equal(checkRadius("abc"), null);
});

test("the logo link must be a plain web address", () => {
  assert.deepEqual(checkLogoUrl(""), { ok: true, url: null });
  assert.equal(checkLogoUrl("https://example.com").ok, true);
  assert.equal(checkLogoUrl("javascript:alert(1)").ok, false);
  assert.equal(checkLogoUrl("https://user:pass@example.com").ok, false);
  assert.equal(checkLogoUrl("example.com").ok, false);
});

test("logo type comes from the file bytes", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0]);
  const webp = new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP"), 0]);
  const svg = new Uint8Array(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"));
  assert.equal(sniffLogo(png), "image/png");
  assert.equal(sniffLogo(jpeg), "image/jpeg");
  assert.equal(sniffLogo(webp), "image/webp");
  assert.equal(sniffLogo(svg), null);
});

test("features fall back to on and ignore junk", () => {
  assert.deepEqual(readFeatures(null), DEFAULT_FEATURES);
  assert.deepEqual(readFeatures({ share: false, nope: false, raw: "no" }), {
    ...DEFAULT_FEATURES,
    share: false,
  });
});

test("logos are served from the CDN path with one id per image", () => {
  const base = { userId: "u1", id: "p1" };
  assert.equal(logoSources({ ...base, logoLightId: null, logoDarkId: null }, "https://api.minelog.org"), null);
  assert.deepEqual(logoSources({ ...base, logoLightId: "aaa", logoDarkId: null }, "https://api.minelog.org"), {
    light: "https://api.minelog.org/cdn/u1/p1/aaa",
    dark: "https://api.minelog.org/cdn/u1/p1/aaa",
  });
  assert.deepEqual(logoSources({ ...base, logoLightId: null, logoDarkId: "bbb" }, "/svc"), {
    light: "/svc/cdn/u1/p1/bbb",
    dark: "/svc/cdn/u1/p1/bbb",
  });
  assert.deepEqual(logoSources({ ...base, logoLightId: "aaa", logoDarkId: "bbb" }, ""), {
    light: "/cdn/u1/p1/aaa",
    dark: "/cdn/u1/p1/bbb",
  });
});

test("the name toggle and logo height are read safely", () => {
  assert.equal(readTheme({}).showName, false);
  assert.equal(readTheme({ showName: true }).showName, true);
  assert.equal(readTheme({ showName: "yes" }).showName, false);
  assert.equal(readTheme({ logoHeight: 96 }).logoHeight, 96);
  assert.equal(readTheme({ logoHeight: 97 }).logoHeight, 32);
});

test("every preset is made of valid colors", () => {
  assert.ok(THEME_PRESETS.length >= 4);
  for (const preset of THEME_PRESETS) {
    for (const color of Object.values(preset.colors)) assert.ok(isHexColor(color), preset.id);
  }
});

test("theme keeps only checked hex colors and small numbers", () => {
  const theme = readTheme({
    background: "#112233",
    text: "red",
    accent: "#ABCDEF",
    buttonSize: "huge",
    buttonBorderWidth: 9,
    logoHeight: 40,
    buttonUppercase: true,
  });
  assert.equal(theme.background, "#112233");
  assert.equal(theme.text, undefined);
  assert.equal(theme.accent, "#abcdef");
  assert.equal(theme.buttonSize, "normal");
  assert.equal(theme.buttonBorderWidth, null);
  assert.equal(theme.logoHeight, 40);
  assert.equal(theme.buttonUppercase, true);
  assert.equal(readTheme(null).logoHeight, 32);
});

test("the page stylesheet only holds what the owner set", () => {
  const plain = pageCss(readTheme({}), 0);
  assert.ok(!plain.includes("--bg"));
  assert.ok(!plain.includes("background-color"));

  const css = pageCss(
    readTheme({ background: "#101010", accent: "#ffffff", buttonBg: "#ff0000", buttonHover: "#00ff00", buttonUppercase: true }),
    8,
  );
  assert.ok(css.includes("--bg:#101010"));
  assert.ok(css.includes("--accent-ink:#0e1013"));
  assert.ok(css.includes("background-color:#ff0000"));
  assert.ok(css.includes("border-radius:8px"));
  assert.ok(css.includes("text-transform:uppercase"));
  assert.ok(css.includes("body:has(.brand-page)"));
  assert.ok(!pageCss(readTheme({ background: "#101010" }), 0, false).includes("body:has"));
});

test("text picks black or white by what is readable", () => {
  assert.equal(readableOn("#ffffff"), "#0e1013");
  assert.equal(readableOn("#000000"), "#f8faf9");
});

test("the report line is not a switch and presets carry a radius and button look", () => {
  assert.ok(!PAGE_FEATURES.some((feature) => (feature.key as string) === "report"));
  assert.ok(!("report" in readFeatures({ report: false })));
  const violet = THEME_PRESETS.find((preset) => preset.id === "violet");
  assert.ok(violet && violet.radius > 0 && violet.buttons.buttonText === violet.colors.accent);
  // soft: the button background is a tint, not the accent itself
  assert.notEqual(violet.buttons.buttonBg, violet.colors.accent);
  assert.deepEqual(THEME_PRESETS[0].buttons, {});
});

test("the corner radius also rounds search, chips and badges", () => {
  const css = pageCss(DEFAULT_THEME, 10);
  assert.match(css, /\.search,\.chip-split,\.chip,\.segmented,\.source-badge[^{]*\{border-radius:10px\}/);
});

test("setting only the text color still gives a readable page", () => {
  const css = pageCss({ ...DEFAULT_THEME, text: "#f1e9ff" }, 0);
  assert.match(css, /--bg:#0e1013/);
  assert.match(css, /color-scheme:dark/);
  const light = pageCss({ ...DEFAULT_THEME, background: "#ffffff" }, 0);
  assert.match(light, /--ink:#0e1013/);
  assert.match(light, /brand-logo--light{display:block}/);
});

test("mixing colors blends toward the second color", () => {
  assert.equal(mixHex("#ffffff", "#000000", 0.5), "#808080");
  assert.equal(mixHex("#123456", "#abcdef", 1), "#123456");
});
