"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  FileText,
  ShieldCheck,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import { createLog } from "@/lib/api";
import { saveDeleteToken } from "@/lib/delete-token";
import {
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  PREVIEW_LINE_LIMIT,
} from "@/lib/config";
import { retentionHours } from "@/lib/retention";
import { analyze, formatBytes, kindLabel, type Analysis } from "@/lib/log";
import { readInsights } from "@/lib/diagnose/insights";
import { moderationMessage } from "@/lib/moderation";
import { isPrivateFileName, privateFileMessage } from "@/lib/private-files";
import { SAMPLE_LOG } from "@/lib/samples";
import { LogView } from "./log-view";
import { ReadmeView } from "./readme-view";
import { Segmented } from "./workspace/segmented";

type ReadmeMode = "rendered" | "source";

const README_MODES: { value: ReadmeMode; label: string }[] = [
  { value: "rendered", label: "Rendered" },
  { value: "source", label: "Source" },
];

type View = "paste" | "preview";

type Phase =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "opening" }
  | { status: "error"; message: string };

const ARCHIVE_EXTENSIONS = [".gz", ".zip", ".jar", ".7z", ".rar"];

const MEDIA_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".ico",
  ".avif",
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".mp3",
  ".wav",
  ".ogg",
  ".oga",
  ".flac",
  ".m4a",
  ".aac",
];

function notPlainTextMessage(name: string): string {
  return `${name} isn't plain text. minelog only takes text logs and config files.`;
}

const SOURCE_EXTENSIONS = [".ts", ".mts", ".cts"];

function isMediaFile(name: string, type: string): boolean {
  if (SOURCE_EXTENSIONS.some((ext) => name.endsWith(ext))) return false;
  if (
    type.startsWith("image/") ||
    type.startsWith("video/") ||
    type.startsWith("audio/")
  ) {
    return true;
  }
  return MEDIA_EXTENSIONS.some((ext) => name.endsWith(ext));
}

const number = (value: number) => value.toLocaleString("en");

function tooLongMessage(lines: number): string {
  return `This log has ${number(lines)} lines and the limit is ${number(MAX_LOG_LINES)}. Paste the newest part instead.`;
}

function looksBinary(text: string): boolean {
  if (text.includes("\u0000")) return true;
  const sample = text.slice(0, 2000);
  let bad = 0;
  for (const char of sample) {
    if (char === "�") bad += 1;
  }
  return sample.length > 0 && bad > 40;
}

export function PasteEditor() {
  const ids = useId();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const pasteBox = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState("");
  const [view, setView] = useState<View>("paste");
  const [hidePrivate, setHidePrivate] = useState(true);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [previewRun, setPreviewRun] = useState(0);
  const [readmeMode, setReadmeMode] = useState<ReadmeMode>("rendered");

  const deferredText = useDeferredValue(text);
  const analysis = useMemo(
    () => analyze(deferredText, hidePrivate, sourceName ?? undefined),
    [deferredText, hidePrivate, sourceName],
  );

  const isEmpty = text.length === 0;
  const tooBig = analysis.bytes > MAX_LOG_BYTES;
  const tooLong = analysis.lineCount > MAX_LOG_LINES;
  const opening = phase.status === "opening";
  const busy = phase.status === "saving" || opening;
  const canSave =
    !isEmpty && !tooBig && !tooLong && !busy && !analysis.blocked;

  function replaceText(next: string, nextView: View, name: string | null = null) {
    setText(next);
    setView(next ? nextView : "paste");
    setPhase({ status: "idle" });
    setNotice(null);
    setSourceName(name);
  }

  async function openFile(file: File) {
    if (isPrivateFileName(file.name)) {
      setNotice(privateFileMessage(file.name));
      return;
    }
    const name = file.name.toLowerCase();
    if (isMediaFile(name, file.type.toLowerCase())) {
      setNotice(notPlainTextMessage(file.name));
      return;
    }
    if (ARCHIVE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      setNotice(
        `${file.name} is an archive. Unzip it and open the .log or config file inside.`,
      );
      return;
    }
    if (file.size > MAX_LOG_BYTES) {
      setNotice(
        `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_LOG_BYTES)}. Try latest.log instead of an older file.`,
      );
      return;
    }
    try {
      const text = await file.text();
      if (text.trim().length === 0) {
        setNotice(`${file.name} is empty. Open a file with text inside.`);
        return;
      }
      if (looksBinary(text)) {
        setNotice(notPlainTextMessage(file.name));
        return;
      }
      replaceText(text, "preview", file.name);
      setPreviewRun((run) => run + 1);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : `Couldn't read ${file.name}. Open it in a text editor and paste the contents instead.`,
      );
    }
  }

  const openFileRef = useRef(openFile);
  useEffect(() => {
    openFileRef.current = openFile;
  });

  useEffect(() => {
    const hasFiles = (event: globalThis.DragEvent) =>
      event.dataTransfer?.types.includes("Files") ?? false;
    let depth = 0;

    const onEnter = (event: globalThis.DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const onOver = (event: globalThis.DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    const onLeave = (event: globalThis.DragEvent) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const onDropAnywhere = (event: globalThis.DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setDragging(false);
      const file = event.dataTransfer?.files[0];
      if (file) void openFileRef.current(file);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDropAnywhere);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDropAnywhere);
    };
  }, []);

  const save = useCallback(async () => {
    if (!canSave) return;
    setPhase({ status: "saving" });
    try {
      const fresh = analyze(text, hidePrivate, sourceName ?? undefined);
      if (fresh.blocked) throw new Error(moderationMessage(fresh.blockMessage));
      if (fresh.bytes > MAX_LOG_BYTES) throw new Error("This log is too large.");
      if (fresh.lineCount > MAX_LOG_LINES) throw new Error(tooLongMessage(fresh.lineCount));
      const log = await createLog(fresh.output, hidePrivate);
      if (log.deleteToken && log.deleteUntil) {
        saveDeleteToken(log.id, log.deleteToken, log.deleteUntil);
      }
      setPhase({ status: "opening" });
      router.push(`/${log.id}`);
    } catch (error) {
      setPhase({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Try again in a moment.",
      });
    }
  }, [canSave, text, hidePrivate, sourceName, router]);

  useEffect(() => {
    function focusEditor() {
      setView("paste");
      window.setTimeout(() => pasteBox.current?.focus({ preventScroll: true }), 0);
    }
    function fillSample() {
      replaceText(SAMPLE_LOG, "preview");
      setPreviewRun((run) => run + 1);
    }
    function onGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "enter") {
        event.preventDefault();
        if (document.activeElement === pasteBox.current) void save();
        else focusEditor();
        return;
      }
      if (key === "o") {
        event.preventDefault();
        fileInput.current?.click();
        return;
      }
      if (key === "u") {
        event.preventDefault();
        fillSample();
        return;
      }
      if (key === "e" && !isEmpty) {
        event.preventDefault();
        setView((current) => (current === "paste" ? "preview" : "paste"));
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [save, isEmpty]);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (isEmpty) return;
    event.preventDefault();
    setView((current) => (current === "paste" ? "preview" : "paste"));
  }

  return (
    <section aria-label="Share a log" className="grid-x grid-margin-x">
      <div className="cell small-12 large-8">
        <div className={`editor${dragging ? " is-dragging" : ""}`}>
          <div className="editor__bar">
            <div role="tablist" aria-label="Log view" className="editor__tabs">
              <TabButton
                id={`${ids}-tab-paste`}
                panelId={`${ids}-panel`}
                selected={view === "paste"}
                onClick={() => setView("paste")}
                onKeyDown={onTabKeyDown}
              >
                Paste
              </TabButton>
              <TabButton
                id={`${ids}-tab-preview`}
                panelId={`${ids}-panel`}
                selected={view === "preview"}
                disabled={isEmpty}
                onClick={() => setView("preview")}
                onKeyDown={onTabKeyDown}
              >
                Preview
              </TabButton>
            </div>
            <div className="editor__tools">
              <ToolButton
                label="Open file"
                tip="Open a log or config file (Ctrl+O)"
                icon={<UploadSimple aria-hidden="true" />}
                onClick={() => fileInput.current?.click()}
              />
              <ToolButton
                label="Use a sample"
                tip="Fill in an example log (Ctrl+U)"
                icon={<FileText aria-hidden="true" />}
                onClick={() => {
                  replaceText(SAMPLE_LOG, "preview");
                  setPreviewRun((run) => run + 1);
                }}
              />
              <input
                ref={fileInput}
                type="file"
                className="show-for-sr"
                tabIndex={-1}
                aria-label="Open a log or config file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void openFile(file);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${ids}-panel`}
            aria-labelledby={`${ids}-tab-${view}`}
            className="editor__body"
          >
            {view === "paste" ? (
              <textarea
                ref={pasteBox}
                value={text}
                onChange={(event) => replaceText(event.target.value, "paste")}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                wrap="off"
                aria-label="Log content"
                placeholder={
                  "Paste your latest.log or a crash report here.\nYou can also drop a file onto this box."
                }
                className="editor__textarea scroll-quiet"
              />
            ) : analysis.kind === "readme" ? (
              <div className="editor__readmepreview">
                <div className="editor__previewbar">
                  <Segmented
                    label="README preview"
                    options={README_MODES}
                    value={readmeMode}
                    onChange={setReadmeMode}
                  />
                </div>
                {readmeMode === "rendered" ? (
                  <div className="editor__readmewrap">
                    <ReadmeView
                      key={previewRun}
                      text={analysis.output}
                      label="Preview of the README that will be saved"
                    />
                  </div>
                ) : (
                  <div className="editor__readmewrap">
                    <LogView
                      key={previewRun}
                      text={analysis.output}
                      limit={PREVIEW_LINE_LIMIT}
                      label="Preview of the log that will be saved"
                      animate
                    />
                  </div>
                )}
              </div>
            ) : (
              <LogView
                key={previewRun}
                text={analysis.output}
                limit={PREVIEW_LINE_LIMIT}
                label="Preview of the log that will be saved"
                animate
              />
            )}
          </div>
        </div>

        <p className="editor__hint">
          {view === "preview" && !isEmpty
            ? "This is exactly what will be saved."
            : null}
        </p>
        {notice && <Message tone="error">{notice}</Message>}
      </div>

      <aside className="cell small-12 large-4 side">
        <Detected
          analysis={analysis}
          isEmpty={isEmpty}
          tooBig={tooBig}
          tooLong={tooLong}
        />

        <PrivacySwitch
          id={`${ids}-hide`}
          checked={hidePrivate}
          onChange={setHidePrivate}
          analysis={analysis}
          isEmpty={isEmpty}
        />

        <div className="side__save">
          <button
            type="button"
            className="button"
            onClick={() => void save()}
            disabled={!canSave}
            aria-busy={busy}
          >
            {busy && (
              <span className="loader" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
            )}
            {opening ? "Opening log" : busy ? "Saving" : "Get link"}
          </button>
          {phase.status === "error" ? (
            <Message tone="error">{phase.message}</Message>
          ) : (
            <p className="side__hint">
              <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Enter</kbd> saves, or jumps back here.{" "}
              <kbd>O</kbd> opens a file, <kbd>U</kbd> fills a sample, <kbd>E</kbd> flips the preview.
            </p>
          )}
        </div>
      </aside>
      {dragging &&
        createPortal(
          <div className="drop-overlay" role="status">
            <div className="drop-overlay__box">
              <UploadSimple aria-hidden="true" />
              <p className="drop-overlay__title">Drop the file to open it</p>
              <p className="drop-overlay__note">
                Text logs and config files, up to {formatBytes(MAX_LOG_BYTES)}.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

function Detected({
  analysis,
  isEmpty,
  tooBig,
  tooLong,
}: {
  analysis: Analysis;
  isEmpty: boolean;
  tooBig: boolean;
  tooLong: boolean;
}) {
  const label = useMemo(
    () => kindLabel(analysis.kind, analysis.output),
    [analysis.kind, analysis.output],
  );
  const previewProblems = useMemo(() => {
    if (isEmpty || tooBig || tooLong || analysis.blocked) return [];
    if (
      analysis.kind !== "server" &&
      analysis.kind !== "client" &&
      analysis.kind !== "crash" &&
      analysis.kind !== "jvm"
    ) {
      return [];
    }
    try {
      return readInsights(analysis.output, analysis.kind).problems.slice(0, 3);
    } catch {
      return [];
    }
  }, [analysis, isEmpty, tooBig, tooLong]);
  return (
    <div className="side__block" aria-live="polite">
      <h2 className="side__label">Detected</h2>
      {isEmpty ? (
        <p className="side__kind is-empty">Nothing pasted yet</p>
      ) : (
        <>
          <p key={label} className="side__kind">
            {label}
          </p>
          <p className="side__meta">
            {number(analysis.lineCount)} lines, {formatBytes(analysis.bytes)}
          </p>
          {(analysis.errorCount > 0 || analysis.warnCount > 0) && (
            <p className="side__counts">
              {analysis.errorCount > 0 && (
                <span className="is-error">
                  {number(analysis.errorCount)}{" "}
                  {analysis.errorCount === 1 ? "error" : "errors"}
                </span>
              )}
              {analysis.warnCount > 0 && (
                <span className="is-warn">
                  {number(analysis.warnCount)}{" "}
                  {analysis.warnCount === 1 ? "warning" : "warnings"}
                </span>
              )}
            </p>
          )}
          {previewProblems.length > 0 && (
            <div className="side__problems">
              <p className="side__problems-title">Looks like:</p>
              <ul>
                {previewProblems.map((problem) => (
                  <li key={`${problem.id}:${problem.line}`}>{problem.message}</li>
                ))}
              </ul>
              <p className="side__problems-note">Full list and fixes after saving.</p>
            </div>
          )}
          {tooBig && (
            <Message tone="error">
              This log is {formatBytes(analysis.bytes)}. The limit is{" "}
              {formatBytes(MAX_LOG_BYTES)}. Paste latest.log instead of an older
              file.
            </Message>
          )}
          {tooLong && (
            <Message tone="error">{tooLongMessage(analysis.lineCount)}</Message>
          )}
          {analysis.blocked && (
            <Message tone="error">
              {moderationMessage(analysis.blockMessage)}
            </Message>
          )}
        </>
      )}
    </div>
  );
}

function PrivacySwitch({
  id,
  checked,
  onChange,
  analysis,
  isEmpty,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  analysis: Analysis;
  isEmpty: boolean;
}) {
  return (
    <div className="privacy-toggle">
      <div className="privacy-toggle__row">
        <div className="privacy-toggle__text">
          <label htmlFor={id} className="privacy-toggle__title">
            <ShieldCheck aria-hidden="true" />
            Hide private details
          </label>
          <p id={`${id}-hint`} className="privacy-toggle__hint">
            IP addresses, MAC addresses, user folder names, tokens, passwords and email addresses.
          </p>
        </div>
        <div className="switch">
          <input
            id={id}
            className="switch-input"
            type="checkbox"
            role="switch"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-describedby={`${id}-hint`}
          />
          <label className="switch-paddle" htmlFor={id}>
            <span className="show-for-sr">Hide private details</span>
          </label>
        </div>
      </div>

      {checked && !isEmpty && (
        <p className="privacy-toggle__result" aria-live="polite">
          {analysis.findings.length === 0
            ? "No private details found."
            : analysis.findings
                .map((f) => `${number(f.count)} ${f.label}`)
                .join(", ") + " hidden."}
        </p>
      )}
      {!checked && (
        <Message tone="warn">
          Anyone with the link will see everything in this log. Because nothing
          is hidden, it&apos;s deleted after{" "}
          {retentionHours(false)}{" "}
          {retentionHours(false) === 1 ? "hour" : "hours"}.
        </Message>
      )}
    </div>
  );
}

function TabButton({
  id,
  panelId,
  selected,
  disabled,
  onClick,
  onKeyDown,
  children,
}: {
  id: string;
  panelId: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      className="editor__tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
}

function ToolButton({
  onClick,
  label,
  tip,
  icon,
}: {
  onClick: () => void;
  label: string;
  tip: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      className="tool-button"
      data-tip={tip}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
      <span className="show-for-medium">{label}</span>
    </button>
  );
}

function Message({
  tone,
  children,
}: {
  tone: "error" | "warn";
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`callout ${tone === "error" ? "alert" : "warning"}`}
    >
      <WarningCircle aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

