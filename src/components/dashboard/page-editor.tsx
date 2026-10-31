"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowSquareOut,
  Check,
  Key,
  Trash,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import {
  generatePageKey,
  removePage,
  savePage,
} from "@/app/dash/pages/actions";
import {
  BORDER_WIDTH_MAX,
  COLOR_FIELDS,
  LOGO_HEIGHT,
  PAGE_FEATURES,
  PAGE_NAME_MAX,
  RADIUS_MAX,
  THEME_PRESETS,
  isHexColor,
  type ColorKey,
  type PageFeatures,
  type PageTheme,
  type ThemePreset,
} from "@/lib/page-settings";
import { PAGE_LOGO_MAX_BYTES } from "@/lib/config";
import { ConfirmDialog } from "../confirm-dialog";
import { DomainPanel, type DomainInfo } from "./domain-panel";
import { CopyLink } from "../copy-link";
import { Loader } from "../loader";
import { Modal } from "../modal";
import { SwitchRow } from "../switch-row";
import { Segmented } from "../workspace/segmented";
import { Notice, PageHeader } from "./panel";

export type EditablePage = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  buttonRadius: number;
  features: PageFeatures;
  theme: PageTheme;
  light: string | null;
  dark: string | null;
  keyPrefix: string | null;
  keyCreated: string | null;
  domain: DomainInfo;
  domainsEnabled: boolean;
};

type LogoSlot = {
  saved: string | null;
  file: File | null;
  preview: string | null;
  removed: boolean;
};

const emptySlot = (saved: string | null): LogoSlot => ({
  saved,
  file: null,
  preview: null,
  removed: false,
});

const shown = (slot: LogoSlot) =>
  slot.removed ? null : (slot.preview ?? slot.saved);

type Tab = "brand" | "colors" | "buttons" | "features" | "domains" | "api";

const TABS: { value: Tab; label: string }[] = [
  { value: "brand", label: "Brand" },
  { value: "colors", label: "Colors" },
  { value: "buttons", label: "Buttons" },
  { value: "features", label: "Features" },
  { value: "domains", label: "Custom Domains" },
  { value: "api", label: "API" },
];

const SIZES = [
  { value: "small", label: "Small" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
] as const;

const BORDER_OPTIONS = [
  { value: "auto", label: "Default" },
  ...Array.from({ length: BORDER_WIDTH_MAX + 1 }, (_, width) => ({
    value: String(width),
    label: `${width}px`,
  })),
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}) {
  const id = useId();
  // While typing, the box shows what was typed even if it is not a full color yet.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="page-color">
      <label htmlFor={id} className="page-color__label">
        {label}
      </label>
      <div className="page-color__row">
        <span
          className="page-color__swatch"
          data-unset={value === undefined}
          style={value ? { background: value } : undefined}
        >
          <input
            type="color"
            aria-label={`${label}, color picker`}
            value={value ?? "#808080"}
            onChange={(event) => onChange(event.target.value.toLowerCase())}
          />
        </span>
        <input
          id={id}
          className="dash-input page-color__hex"
          type="text"
          value={draft ?? value ?? ""}
          placeholder="Default"
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => {
            const next = event.target.value.trim().toLowerCase();
            setDraft(next);
            if (next === "") onChange(undefined);
            else if (isHexColor(next)) onChange(next);
          }}
          onBlur={() => setDraft(null)}
        />
        <button
          type="button"
          className="page-color__reset"
          aria-label={`Reset ${label}`}
          data-tip="Back to default"
          disabled={value === undefined}
          onClick={() => {
            setDraft(null);
            onChange(undefined);
          }}
        >
          <X size={14} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function LogoField({
  label,
  hint,
  tone,
  slot,
  onPick,
  onRemove,
}: {
  label: string;
  hint: string;
  tone: "light" | "dark";
  slot: LogoSlot;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const current = shown(slot);

  return (
    <div className="page-field">
      <span className="page-field__label">{label}</span>
      <div className="page-logo">
        <span className="page-logo__box" data-tone={tone}>
          {current ? (
            // The preview can be a blob: address, which next/image cannot optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="" className="page-logo__image" />
          ) : (
            <span className="page-logo__none">No logo</span>
          )}
        </span>
        <div className="page-logo__actions">
          <button
            type="button"
            className="button hollow button--sm"
            onClick={() => input.current?.click()}
          >
            <UploadSimple size={16} aria-hidden="true" />
            {current ? "Replace" : "Upload"}
          </button>
          {current && (
            <button
              type="button"
              className="button hollow button--sm"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="show-for-sr"
          tabIndex={-1}
          aria-label={`${label} file`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPick(file);
            event.target.value = "";
          }}
        />
      </div>
      <p className="page-field__hint">{hint}</p>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="page-section">
      <h2 className="page-section__title">{title}</h2>
      {description && <p className="page-section__lead">{description}</p>}
      <div className="page-section__body">{children}</div>
    </section>
  );
}

const CURL = (key: string) =>
  [
    "curl -X POST https://api.minelog.org/v2/logs \\",
    `  -H "Authorization: Bearer ${key}" \\`,
    '  -H "Content-Type: application/json" \\',
    `  -d '{"content": "your log text"}'`,
  ].join("\n");

const FETCH = (key: string) =>
  [
    'const response = await fetch("https://api.minelog.org/v2/logs", {',
    '  method: "POST",',
    "  headers: {",
    `    Authorization: "Bearer ${key}",`,
    '    "Content-Type": "application/json",',
    "  },",
    "  body: JSON.stringify({ content: logText }),",
    "});",
    "const { url } = await response.json(); // opens on your page",
  ].join("\n");

const RESET_BUTTONS = {
  buttonBg: undefined,
  buttonText: undefined,
  buttonHover: undefined,
  buttonBorder: undefined,
};

const DEVICES = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "phone", label: "Phone" },
] as const;

export function PageEditor({ page }: { page: EditablePage }) {
  const ids = useId();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("brand");
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [logoUrl, setLogoUrl] = useState(page.logoUrl);
  const [radius, setRadius] = useState(page.buttonRadius);
  const [features, setFeatures] = useState(page.features);
  const [theme, setTheme] = useState(page.theme);
  const [light, setLight] = useState(emptySlot(page.light));
  const [dark, setDark] = useState(emptySlot(page.dark));

  const [device, setDevice] =
    useState<(typeof DEVICES)[number]["value"]>("desktop");
  const [frameKey, setFrameKey] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);

  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteProblem, setDeleteProblem] = useState<string | null>(null);

  const [keyBusy, setKeyBusy] = useState(false);
  const [keyProblem, setKeyProblem] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // Blob addresses are released when the picked image changes or the editor closes.
  useEffect(() => {
    const url = light.preview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [light.preview]);
  useEffect(() => {
    const url = dark.preview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [dark.preview]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setSavedAt(false);
  };

  function patchTheme(patch: Partial<PageTheme>) {
    touch();
    setTheme((current) => ({ ...current, ...patch }));
  }

  // A preset sets the colors, the corner radius and the button look in one go.
  function applyPreset(preset: ThemePreset) {
    patchTheme({ ...preset.colors, ...RESET_BUTTONS, ...preset.buttons });
    setRadius(preset.radius);
  }

  function setColor(key: ColorKey, value: string | undefined) {
    patchTheme({ [key]: value });
  }

  function pick(side: "light" | "dark", file: File) {
    if (file.size > PAGE_LOGO_MAX_BYTES) {
      setProblem(
        `That image is over ${PAGE_LOGO_MAX_BYTES / 1024} KB. Use a smaller one.`,
      );
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setProblem("Logos must be a PNG, JPEG or WebP image.");
      return;
    }
    touch();
    setProblem(null);
    const next = (slot: LogoSlot): LogoSlot => ({
      ...slot,
      file,
      preview: URL.createObjectURL(file),
      removed: false,
    });
    (side === "light" ? setLight : setDark)(next);
  }

  function drop(side: "light" | "dark") {
    touch();
    const next = (slot: LogoSlot): LogoSlot => ({
      ...slot,
      file: null,
      preview: null,
      removed: slot.saved !== null,
    });
    (side === "light" ? setLight : setDark)(next);
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setProblem(null);

    const data = new FormData();
    data.set("name", name);
    data.set("slug", slug);
    data.set("logoUrl", logoUrl);
    data.set("buttonRadius", String(radius));
    data.set("theme", JSON.stringify(theme));
    for (const { key } of PAGE_FEATURES)
      data.set(`feature-${key}`, features[key] ? "1" : "0");
    if (light.file) data.set("logoLight", light.file);
    if (dark.file) data.set("logoDark", dark.file);
    if (light.removed) data.set("removeLight", "1");
    if (dark.removed) data.set("removeDark", "1");

    const outcome = await savePage(page.id, data);
    setBusy(false);
    if (!outcome.ok) {
      setProblem(outcome.error);
      return;
    }
    setDirty(false);
    setSavedAt(true);
    // The address may have changed, so the frame loads the saved page again.
    setFrameKey((key) => key + 1);
    router.refresh();
  }

  async function confirmDelete() {
    if (deleteBusy) return;
    setDeleteBusy(true);
    setDeleteProblem(null);
    const outcome = await removePage(page.id);
    if (!outcome.ok) {
      setDeleteBusy(false);
      setDeleteProblem(outcome.error);
      return;
    }
    setDirty(false);
    router.push("/dash/pages");
  }

  async function makeKey() {
    if (keyBusy) return;
    setKeyBusy(true);
    setKeyProblem(null);
    const outcome = await generatePageKey(page.id);
    setKeyBusy(false);
    if (!outcome.ok) {
      setKeyProblem(outcome.error);
      return;
    }
    setReplacing(false);
    setNewKey(outcome.key);
    router.refresh();
  }

  const lightSrc = shown(light);
  const darkSrc = shown(dark);
  const first = lightSrc ?? darkSrc;
  const previewLogo = first
    ? { light: lightSrc ?? first, dark: darkSrc ?? first }
    : null;
  const hasKey = page.keyPrefix !== null;
  const colorsSet = COLOR_FIELDS.some(
    (field) => theme[field.key] !== undefined,
  );
  // The preview is the real page in a frame. It gets the unsaved draft by message, and asks for it
  // when it has loaded.
  const draft = {
    type: "brand-draft",
    theme,
    radius,
    name: name.trim(),
    logo: previewLogo,
    off: PAGE_FEATURES.filter(({ key }) => !features[key]).map(
      ({ key }) => key,
    ),
  };
  const latest = useRef(draft);
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      latest.current,
      window.location.origin,
    );

  // Runs after every render, so the frame always has the newest draft.
  useEffect(() => {
    latest.current = draft;
    send();
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data?.type === "brand-ready"
      ) {
        frame.current?.contentWindow?.postMessage(
          latest.current,
          window.location.origin,
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const colorGroup = (group: "page" | "header" | "button") => (
    <div className="page-colors">
      {COLOR_FIELDS.filter((field) => field.group === group).map((field) => (
        <ColorField
          key={field.key}
          label={field.label}
          value={theme[field.key]}
          onChange={(next) => setColor(field.key, next)}
        />
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Edit log page"
        description="Make it look like your product. The preview follows every change."
        actions={
          <div className="dash-page__counter">
            <Link href="/dash/pages" className="button hollow">
              <ArrowLeft size={16} aria-hidden="true" />
              All pages
            </Link>
            <a
              href={`/c/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button hollow"
            >
              <ArrowSquareOut size={16} aria-hidden="true" />
              Open demo
            </a>
          </div>
        }
      />

      <form
        className="page-editor"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="page-editor__main">
          <div className="page-tabs" role="tablist" aria-label="Page settings">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                id={`${ids}-tab-${item.value}`}
                aria-selected={tab === item.value}
                aria-controls={`${ids}-panel`}
                className="page-tabs__tab"
                onClick={() => setTab(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            className="page-editor__panel"
            role="tabpanel"
            id={`${ids}-panel`}
            aria-labelledby={`${ids}-tab-${tab}`}
          >
            {tab === "brand" && (
              <>
                <Section title="Identity">
                  <div className="page-field">
                    <label
                      htmlFor={`${ids}-name`}
                      className="page-field__label"
                    >
                      Name (optional)
                    </label>
                    <input
                      id={`${ids}-name`}
                      className="dash-input"
                      type="text"
                      value={name}
                      maxLength={PAGE_NAME_MAX}
                      autoComplete="off"
                      placeholder="Your product"
                      onChange={(event) => {
                        touch();
                        setName(event.target.value);
                      }}
                    />
                    <p className="page-field__hint">
                      Your brand in the browser tab: &ldquo;Server log &middot;{" "}
                      {name.trim() || "Your product"}
                      &rdquo;.
                    </p>
                  </div>
                  <SwitchRow
                    id={`${ids}-show-name`}
                    icon={null}
                    title="Show the name next to the logo"
                    hint="Turn it on when your logo is only an icon. Without a logo, minelog's own logo shows."
                    checked={theme.showName}
                    onChange={(next) => patchTheme({ showName: next })}
                  />
                  <div className="page-field">
                    <label
                      htmlFor={`${ids}-slug`}
                      className="page-field__label"
                    >
                      Address
                    </label>
                    <div className="page-slug">
                      <span className="page-slug__prefix">minelog.org/c/</span>
                      <input
                        id={`${ids}-slug`}
                        className="dash-input page-slug__input"
                        type="text"
                        value={slug}
                        maxLength={32}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(event) => {
                          touch();
                          setSlug(event.target.value.toLowerCase());
                        }}
                      />
                    </div>
                    <p className="page-field__hint">
                      Logs your app saves open at this address. Changing it
                      breaks links you already shared.
                    </p>
                  </div>
                </Section>

                <Section
                  title="Logo"
                  description="Wide logos work best, with or without text. PNG, JPEG or WebP, up to 256 KB."
                >
                  <LogoField
                    label="Light theme logo"
                    tone="light"
                    hint="Shown on light backgrounds. With only one logo, both themes use it."
                    slot={light}
                    onPick={(file) => pick("light", file)}
                    onRemove={() => drop("light")}
                  />
                  <LogoField
                    label="Dark theme logo"
                    tone="dark"
                    hint="Shown on dark backgrounds. Optional."
                    slot={dark}
                    onPick={(file) => pick("dark", file)}
                    onRemove={() => drop("dark")}
                  />
                  <div className="page-field">
                    <label
                      htmlFor={`${ids}-logo-size`}
                      className="page-field__label"
                    >
                      Logo height{" "}
                      <span className="page-field__value">
                        {theme.logoHeight}px
                      </span>
                    </label>
                    <input
                      id={`${ids}-logo-size`}
                      className="page-range"
                      type="range"
                      min={LOGO_HEIGHT.min}
                      max={LOGO_HEIGHT.max}
                      step={1}
                      value={theme.logoHeight}
                      onChange={(event) =>
                        patchTheme({ logoHeight: Number(event.target.value) })
                      }
                    />
                    <p className="page-field__hint">
                      Raise it when your logo has text, so the letters stay
                      readable.
                    </p>
                  </div>
                  <div className="page-field">
                    <label
                      htmlFor={`${ids}-link`}
                      className="page-field__label"
                    >
                      Logo link
                    </label>
                    <input
                      id={`${ids}-link`}
                      className="dash-input"
                      type="url"
                      value={logoUrl}
                      maxLength={200}
                      autoComplete="off"
                      placeholder="https://your-product.com"
                      onChange={(event) => {
                        touch();
                        setLogoUrl(event.target.value);
                      }}
                    />
                    <p className="page-field__hint">
                      Where the logo sends people. Leave it empty for no link.
                    </p>
                  </div>
                </Section>
              </>
            )}

            {tab === "colors" && (
              <>
                <Section
                  title="Presets"
                  description="Sets the colors, corner radius and buttons together. Adjust anything after."
                >
                  <div className="page-presets">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className="page-preset"
                        onClick={() => applyPreset(preset)}
                      >
                        <span
                          className="page-preset__swatch"
                          style={{ background: preset.colors.background }}
                        >
                          <span style={{ background: preset.colors.surface }} />
                          <span style={{ background: preset.colors.accent }} />
                          <span style={{ background: preset.colors.text }} />
                        </span>
                        <span className="page-preset__label">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>
                <Section
                  title="Page"
                  description="Set background, text and lines together so they stay readable."
                >
                  {colorGroup("page")}
                </Section>
                <Section
                  title="Header"
                  description="Leave it on Default to follow the page background."
                >
                  {colorGroup("header")}
                </Section>
                <div>
                  <button
                    type="button"
                    className="button hollow button--sm"
                    disabled={!colorsSet}
                    onClick={() =>
                      patchTheme(
                        Object.fromEntries(
                          COLOR_FIELDS.map((field) => [field.key, undefined]),
                        ),
                      )
                    }
                  >
                    Reset all colors
                  </button>
                </div>
              </>
            )}

            {tab === "buttons" && (
              <>
                <Section
                  title="Shape"
                  description="The corner radius also rounds the search box, filters and badges."
                >
                  <div className="page-field">
                    <label
                      htmlFor={`${ids}-radius`}
                      className="page-field__label"
                    >
                      Corner radius{" "}
                      <span className="page-field__value">{radius}px</span>
                    </label>
                    <input
                      id={`${ids}-radius`}
                      className="page-range"
                      type="range"
                      min={0}
                      max={RADIUS_MAX}
                      step={1}
                      value={radius}
                      onChange={(event) => {
                        touch();
                        setRadius(Number(event.target.value));
                      }}
                    />
                  </div>
                  <div className="page-field">
                    <span className="page-field__label">Size</span>
                    <Segmented
                      label="Button size"
                      options={[...SIZES]}
                      value={theme.buttonSize}
                      onChange={(value) => patchTheme({ buttonSize: value })}
                    />
                  </div>
                  <div className="page-field">
                    <span className="page-field__label">Border width</span>
                    <Segmented
                      label="Button border width"
                      options={BORDER_OPTIONS}
                      value={
                        theme.buttonBorderWidth === null
                          ? "auto"
                          : String(theme.buttonBorderWidth)
                      }
                      onChange={(value) =>
                        patchTheme({
                          buttonBorderWidth:
                            value === "auto" ? null : Number(value),
                        })
                      }
                    />
                  </div>
                  <SwitchRow
                    id={`${ids}-upper`}
                    icon={null}
                    title="Uppercase labels"
                    hint="Set button text in capital letters."
                    checked={theme.buttonUppercase}
                    onChange={(next) => patchTheme({ buttonUppercase: next })}
                  />
                </Section>
                <Section
                  title="Colors"
                  description="Default keeps the buttons transparent with a thin line."
                >
                  {colorGroup("button")}
                </Section>
              </>
            )}

            {tab === "features" && (
              <Section
                title="Features"
                description="Turn off anything your readers don't need."
              >
                <div className="page-features">
                  {PAGE_FEATURES.map(({ key, label, hint }) => (
                    <SwitchRow
                      key={key}
                      id={`${ids}-${key}`}
                      icon={null}
                      title={label}
                      hint={hint}
                      checked={features[key]}
                      onChange={(next) => {
                        touch();
                        setFeatures((current) => ({ ...current, [key]: next }));
                      }}
                    />
                  ))}
                </div>
              </Section>
            )}

            {tab === "domains" && (
              <Section
                title="Custom domain"
                description="Show your logs on your own address, like logs.yoursite.com, with a secure certificate included."
              >
                <DomainPanel
                  pageId={page.id}
                  initial={page.domain}
                  enabled={page.domainsEnabled}
                />
              </Section>
            )}

            {tab === "api" && (
              <>
                <Section
                  title="API key"
                  description="Your app sends logs with this key, and every log saved with it opens on this page. The key belongs to this page only."
                >
                  <p className="page-key">
                    <Key size={18} aria-hidden="true" />
                    {hasKey ? (
                      <span>
                        <code>{page.keyPrefix}…</code> created {page.keyCreated}
                      </span>
                    ) : (
                      <span>
                        No key yet. Generate one to start saving logs from your
                        app.
                      </span>
                    )}
                  </p>
                  <div>
                    <button
                      type="button"
                      className="button hollow"
                      disabled={keyBusy}
                      aria-busy={keyBusy}
                      onClick={() =>
                        hasKey ? setReplacing(true) : void makeKey()
                      }
                    >
                      {keyBusy && <Loader />}
                      {hasKey ? "Generate a new key" : "Generate key"}
                    </button>
                  </div>
                  {keyProblem && <Notice>{keyProblem}</Notice>}
                  <p className="page-field__hint">
                    The full key is shown once, right after you generate it. We
                    only keep a fingerprint, so a lost key can&apos;t be looked
                    up. Generate a new one instead.
                  </p>
                </Section>
                <Section
                  title="Save a log"
                  description="Send the log text with your key. The answer has the log's url, which opens on your page."
                >
                  <span className="page-field__label">curl</span>
                  <pre className="dash-form__code">{CURL("YOUR_PAGE_KEY")}</pre>
                  <span className="page-field__label">JavaScript</span>
                  <pre className="dash-form__code">
                    {FETCH("YOUR_PAGE_KEY")}
                  </pre>
                  <p className="page-field__hint">
                    Keep the key on your server, never in browser code.
                  </p>
                </Section>
                <Section title="Delete this page">
                  <p className="page-field__hint">
                    The page, its logo and its key are removed. Logs saved on it
                    stay online at their normal minelog links.
                  </p>
                  <div>
                    <button
                      type="button"
                      className="button hollow"
                      onClick={() => setDeleting(true)}
                    >
                      <Trash size={16} aria-hidden="true" />
                      Delete page
                    </button>
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>

        {tab !== "api" && tab !== "domains" && (
          <section className="page-editor__preview" aria-label="Preview">
            <div className="page-editor__preview-head">
              <p className="page-editor__preview-title">Live preview</p>
              <Segmented
                label="Preview width"
                options={[...DEVICES]}
                value={device}
                onChange={setDevice}
              />
            </div>
            <div className="page-frame" data-device={device}>
              <iframe
                key={frameKey}
                ref={frame}
                className="page-frame__view"
                src={`/c/${page.slug}`}
                title="Your log page, as visitors see it"
              />
            </div>
          </section>
        )}

        <div className="page-bar" data-dirty={dirty}>
          <p className="page-bar__status" role="status">
            {problem ? (
              <span className="page-bar__problem">{problem}</span>
            ) : busy ? (
              "Saving…"
            ) : dirty ? (
              "You have unsaved changes"
            ) : savedAt ? (
              <>
                <Check size={16} weight="bold" aria-hidden="true" /> All changes
                saved
              </>
            ) : (
              "Everything is saved"
            )}
          </p>
          <button
            type="submit"
            className="button"
            disabled={busy || !dirty}
            aria-busy={busy}
          >
            {busy && <Loader />}
            Save changes
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={deleting}
        busy={deleteBusy}
        problem={deleteProblem}
        title="Delete this page?"
        confirmLabel="Delete page"
        busyLabel="Deleting"
        icon={<Trash aria-hidden="true" />}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (deleteBusy) return;
          setDeleting(false);
          setDeleteProblem(null);
        }}
      >
        The page and its logo are removed, and its address and key stop working.
        Logs already saved on it stay online at their normal minelog links.
      </ConfirmDialog>

      <ConfirmDialog
        open={replacing}
        busy={keyBusy}
        problem={keyProblem}
        title="Generate a new key?"
        confirmLabel="Generate key"
        busyLabel="Generating"
        icon={<Key aria-hidden="true" />}
        onConfirm={() => void makeKey()}
        onClose={() => {
          if (keyBusy) return;
          setReplacing(false);
          setKeyProblem(null);
        }}
      >
        The current key stops working right away. Update your app with the new
        one.
      </ConfirmDialog>

      {newKey && (
        <Modal open title="Your page key" wide onClose={() => setNewKey(null)}>
          <div className="dash-form">
            <p className="dash-form__text">
              Copy it now and keep it on your server. It&apos;s shown only once.
            </p>
            <CopyLink url={newKey} block />
          </div>
          <div className="dialog__actions">
            <button
              type="button"
              className="button button--sm"
              onClick={() => setNewKey(null)}
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
