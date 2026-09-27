"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowUp,
  ArrowsInLineHorizontal,
  ArrowsOutLineHorizontal,
  Check,
  Copy,
  QrCode,
  WarningCircle,
} from "@phosphor-icons/react";
import { GOTO_LINE_EVENT } from "../line-link";
import { VIEW_CHUNK_LINES } from "@/lib/config";
import { detectLanguage } from "@/lib/highlight";
import type { LogKind } from "@/lib/log";
import { useViewSettings } from "@/lib/use-view-settings";
import { ReadmeView } from "../readme-view";
import { Segmented } from "./segmented";
import {
  ALL_LEVELS_ON,
  LEVEL_GROUPS,
  MARKS_EVENT,
  MARKS_PARAM,
  MAX_MARKS,
  buildRows,
  compileQuery,
  countGroups,
  filterLines,
  findMatches,
  formatMarks,
  levelTargets,
  locateLine,
  parseLines,
  parseMarks,
  type LevelGroup,
} from "@/lib/view";
import { FilterBar, type CopyState } from "./filter-bar";
import { SearchBox, type FindProps } from "./search-box";
import { LogRows } from "./log-rows";
import { QrDialog } from "./qr-dialog";
import { SettingsPanel } from "./settings-panel";

const TEXT_SIZE = { small: "12px", medium: "13px", large: "15px" } as const;
const ROW_HEIGHT = { compact: "1.25rem", comfortable: "1.6rem" } as const;

const LEVEL_KEYS = Object.keys(ALL_LEVELS_ON) as LevelGroup[];

const number = (value: number) => value.toLocaleString("en");

type Nav = { target: "find" | "goto" | LevelGroup; index: number };

const NO_MARKS: Set<number> = new Set();
const URL_WRITE_DELAY_MS = 300;
let marksMemory: Set<number> | null = null;
let marksPath: string | null = null;
let urlTimer: number | undefined;
const marksListeners = new Set<() => void>();

function readMarksFromUrl(): Set<number> {
  const raw = new URLSearchParams(window.location.search).get(MARKS_PARAM);
  return parseMarks(raw);
}

function getMarksSnapshot(): Set<number> {
  if (typeof window === "undefined") return NO_MARKS;
  if (marksMemory === null || marksPath !== window.location.pathname) {
    marksMemory = readMarksFromUrl();
    marksPath = window.location.pathname;
  }
  return marksMemory;
}

function getServerMarks(): Set<number> {
  return NO_MARKS;
}

function notifyMarks() {
  marksListeners.forEach((listener) => listener());
}

function flushMarksUrl() {
  window.clearTimeout(urlTimer);
  urlTimer = undefined;
  if (marksMemory === null || marksPath !== window.location.pathname) return;
  const url = new URL(window.location.href);
  const formatted = formatMarks(marksMemory);
  if (formatted === url.searchParams.get(MARKS_PARAM)) return;
  if (formatted === null) url.searchParams.delete(MARKS_PARAM);
  else url.searchParams.set(MARKS_PARAM, formatted);
  try {
    window.history.replaceState(null, "", url);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(MARKS_EVENT));
}

function subscribeMarks(notify: () => void) {
  const onPopState = () => {
    marksMemory = readMarksFromUrl();
    notify();
  };
  marksListeners.add(notify);
  window.addEventListener("popstate", onPopState);
  window.addEventListener("pagehide", flushMarksUrl);
  return () => {
    marksListeners.delete(notify);
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("pagehide", flushMarksUrl);
    flushMarksUrl();
  };
}

function commitMarks(next: Set<number>) {
  marksMemory = next;
  notifyMarks();
  window.clearTimeout(urlTimer);
  urlTimer = window.setTimeout(flushMarksUrl, URL_WRITE_DELAY_MS);
}

type WorkspaceProps = {
  content: string;
  kind: LogKind;
  logId: string;
  rawUrl: string;
};

export function LogWorkspace({ content, kind, logId, rawUrl }: WorkspaceProps) {
  const panelId = useId();
  const viewer = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);
  const { settings, update, reset } = useViewSettings();

  const [search, setSearch] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [onlyMatches, setOnlyMatches] = useState(false);
  const [levels, setLevels] = useState(ALL_LEVELS_ON);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const marked = useSyncExternalStore(subscribeMarks, getMarksSnapshot, getServerMarks);
  const [chunks, setChunks] = useState(1);
  const [nav, setNav] = useState<Nav | null>(null);
  const [gotoRequest, setGotoRequest] = useState<{ n: number; id: number } | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [qrOpen, setQrOpen] = useState(false);
  const [readmeMode, setReadmeMode] = useState<"rendered" | "source">("rendered");
  const [readmeCount, setReadmeCount] = useState(0);
  const [readmeIndex, setReadmeIndex] = useState<number | null>(null);
  const [showTop, setShowTop] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const lineCountRef = useRef(0);
  const [stuck, setStuck] = useState(false);

  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(
    () => () => document.documentElement.classList.remove("layout-motion"),
    [],
  );

  const topBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const place = () => {
      setShowTop(window.scrollY > 600);
      const button = topBtn.current;
      if (!button) return;
      const footer = document.querySelector(".site-footer");
      if (!footer) {
        button.style.bottom = "";
        return;
      }
      const overlap = Math.max(
        0,
        window.innerHeight - footer.getBoundingClientRect().top,
      );
      button.style.bottom = overlap > 0 ? `${overlap + 20}px` : "";
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, []);

  useEffect(() => {
    const stuckRef = { current: false };
    let raf = 0;
    const check = () => {
      raf = 0;
      const bar =
        workspaceRef.current?.querySelector<HTMLElement>(".toolbar");
      if (!bar) return;
      const next = bar.getBoundingClientRect().top <= 1;
      if (stuckRef.current !== next) {
        stuckRef.current = next;
        document.documentElement.classList.add("layout-motion");
        setStuck(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  const language = useMemo(
    () => (kind === "unknown" ? detectLanguage(content) : null),
    [content, kind],
  );
  const lines = useMemo(
    () => parseLines(content, kind, language),
    [content, kind, language],
  );
  useEffect(() => {
    lineCountRef.current = lines.length;
  }, [lines]);
  const counts = useMemo(() => countGroups(lines), [lines]);

  const deferredSearch = useDeferredValue(search);
  const query = useMemo(
    () => compileQuery(deferredSearch, useRegex, matchCase),
    [deferredSearch, useRegex, matchCase],
  );
  const visible = useMemo(
    () => filterLines(lines, { levels, onlyMatches }, query),
    [lines, levels, onlyMatches, query],
  );
  const rows = useMemo(
    () => buildRows(visible, settings.foldStacks),
    [visible, settings.foldStacks],
  );

  const findStops = useMemo(() => findMatches(visible, query), [visible, query]);
  const levelStops = useMemo(
    () =>
      Object.fromEntries(
        LEVEL_GROUPS.map((group) => [group, levelTargets(visible, group)]),
      ) as Record<LevelGroup, number[]>,
    [visible],
  );

  const stopsFor = (target: Nav["target"]): number[] =>
    target === "find"
      ? findStops
      : target === "goto"
        ? gotoRequest
          ? [gotoRequest.n]
          : []
        : levelStops[target];
  const currentN = nav ? stopsFor(nav.target)[nav.index] : undefined;

  const levelsChanged = LEVEL_KEYS.some((group) => !levels[group]);
  const filtering = levelsChanged || (onlyMatches && search !== "");
  const canReset =
    search !== "" || levelsChanged || useRegex || matchCase || onlyMatches;

  const shownRows = rows.slice(0, chunks * VIEW_CHUNK_LINES);
  const remaining = rows.length - shownRows.length;

  function withReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setChunks(1);
      setNav(null);
      setReadmeIndex(null);
    };
  }

  function toggleLevel(group: LevelGroup) {
    setLevels((current) => ({ ...current, [group]: !current[group] }));
    setChunks(1);
    setNav(null);
  }

  function resetFilters() {
    setSearch("");
    setUseRegex(false);
    setMatchCase(false);
    setOnlyMatches(false);
    setLevels(ALL_LEVELS_ON);
    setChunks(1);
    setNav(null);
  }

  function toggleFold(key: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const markSession = useRef<{
    anchor: number;
    end: number;
    endF: number;
    base: Set<number>;
    mode: "add" | "remove";
    moved: boolean;
    rowH: number;
  } | null>(null);
  const justDragged = useRef(false);

  const PICK_EDGE_PX = 96;
  const pointerY = useRef<number | null>(null);
  const autoRaf = useRef(0);
  const zoneStart = useRef<number | null>(null);
  const zoneDir = useRef<0 | 1 | -1>(0);
  const lastFrame = useRef<number | null>(null);
  const autoFrameRef = useRef<((now: number) => void) | null>(null);

  function stopAutoScroll() {
    if (autoRaf.current) cancelAnimationFrame(autoRaf.current);
    autoRaf.current = 0;
    zoneStart.current = null;
    zoneDir.current = 0;
    lastFrame.current = null;
  }

  const applySessionEnd = useCallback((n: number, keepFloat = false) => {
    const session = markSession.current;
    if (!session) return;
    const clamped = Math.max(1, Math.min(lineCountRef.current, Math.round(n)));
    if (clamped === session.end) {
      if (!keepFloat) session.endF = clamped;
      return;
    }
    session.end = clamped;
    if (!keepFloat) session.endF = clamped;
    if (clamped !== session.anchor) session.moved = true;
    const low = Math.min(session.anchor, clamped);
    const high = Math.max(session.anchor, clamped);
    if (high - low >= MAX_MARKS) return;
    const next = new Set(session.base);
    for (let i = low; i <= high; i += 1) {
      if (session.mode === "add") next.add(i);
      else next.delete(i);
    }
    if (next.size > MAX_MARKS) return;
    commitMarks(next);
  }, []);

  function autoScrollFrame(now: number) {
    const session = markSession.current;
    if (!session) {
      autoRaf.current = 0;
      return;
    }
    autoRaf.current = requestAnimationFrame((t) => autoFrameRef.current?.(t));
    const y = pointerY.current;
    if (y === null) {
      lastFrame.current = now;
      return;
    }
    const vh = window.innerHeight;
    let dir: 0 | 1 | -1 = 0;
    let depth = 0;
    if (y < PICK_EDGE_PX) {
      dir = -1;
      depth = (PICK_EDGE_PX - y) / PICK_EDGE_PX;
    } else if (y > vh - PICK_EDGE_PX) {
      dir = 1;
      depth = (y - (vh - PICK_EDGE_PX)) / PICK_EDGE_PX;
    }
    if (dir === 0) {
      zoneStart.current = null;
      zoneDir.current = 0;
      lastFrame.current = now;
      return;
    }
    depth = Math.min(1, Math.max(0, depth));
    if (zoneStart.current === null || zoneDir.current !== dir) {
      zoneStart.current = now;
      zoneDir.current = dir;
    }
    const held = (now - (zoneStart.current ?? now)) / 1000;
    const dt = Math.min(64, now - (lastFrame.current ?? now)) / 16.7;
    lastFrame.current = now;
    const speed = (3 + depth * 13 + Math.min(held * 6, 18)) * dt;
    window.scrollBy(0, dir * speed);
    session.endF = Math.max(
      1,
      Math.min(lineCountRef.current, session.endF + (dir * speed) / Math.max(1, session.rowH)),
    );
    applySessionEnd(Math.round(session.endF), true);
  }

  useEffect(() => {
    autoFrameRef.current = autoScrollFrame;
  });

  useEffect(() => {
    function endSession() {
      const session = markSession.current;
      markSession.current = null;
      pointerY.current = null;
      stopAutoScroll();
      if (session?.moved) justDragged.current = true;
      if (session) flushMarksUrl();
    }
    function onMove(event: PointerEvent) {
      if (!markSession.current || event.pointerType !== "mouse") return;
      pointerY.current = event.clientY;
      if (!(event.buttons & 1)) endSession();
    }
    window.addEventListener("pointerup", endSession);
    window.addEventListener("pointercancel", endSession);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("blur", endSession);
    return () => {
      window.removeEventListener("pointerup", endSession);
      window.removeEventListener("pointercancel", endSession);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", endSession);
      stopAutoScroll();
    };
  }, []);

  const beginMarkSession = useCallback(
    (n: number, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault();
      justDragged.current = false;
      pointerY.current = event.clientY;
      const base = new Set(getMarksSnapshot());
      const row = event.currentTarget.closest("[data-line]");
      const rowH = row?.getBoundingClientRect().height ?? 24;
      markSession.current = {
        anchor: n,
        end: n,
        endF: n,
        base,
        mode: base.has(n) ? "remove" : "add",
      moved: false,
      rowH,
    };
    if (!autoRaf.current) {
      autoRaf.current = requestAnimationFrame((t) => autoFrameRef.current?.(t));
    }
  },
  [],
);

  const extendMarkSession = useCallback(
    (n: number, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!markSession.current || event.pointerType !== "mouse" || !(event.buttons & 1)) {
        markSession.current = null;
        return;
      }
      applySessionEnd(n);
    },
    [applySessionEnd],
  );

  const toggleMark = useCallback((n: number) => {
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    markSession.current = null;
    const next = new Set(getMarksSnapshot());
    if (next.has(n)) next.delete(n);
    else next.add(n);
    commitMarks(next);
  }, []);

  function reveal(n: number) {
    const spot = locateLine(rows, n);
    if (!spot) return;
    const { foldKey } = spot;
    if (foldKey !== null) setExpanded((current) => new Set(current).add(foldKey));
    setChunks((current) =>
      Math.max(current, Math.floor(spot.index / VIEW_CHUNK_LINES) + 1),
    );
  }

  function step(target: Nav["target"], direction: 1 | -1) {
    const stops = stopsFor(target);
    if (stops.length === 0) return;
    const from = nav?.target === target ? nav.index : direction === 1 ? -1 : 0;
    const index = (from + direction + stops.length) % stops.length;
    setNav({ target, index });
    reveal(stops[index]);
  }

  useEffect(() => {
    if (currentN === undefined) return;
    const row = viewer.current?.querySelector<HTMLElement>(
      `[data-line="${currentN}"]`,
    );
    if (!row) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const far =
      Math.abs(row.getBoundingClientRect().top - window.innerHeight / 2) >
      window.innerHeight * 3;
    row.scrollIntoView({
      block: "center",
      behavior: reduce || far ? "auto" : "smooth",
    });
  }, [nav, currentN]);

  useEffect(() => {
    let counter = 0;
    function onGoto(event: Event) {
      const n = (event as CustomEvent<number>).detail;
      if (!Number.isInteger(n) || n < 1 || n > lines.length) return;
      counter += 1;
      setSearch("");
      setUseRegex(false);
      setMatchCase(false);
      setOnlyMatches(false);
      setLevels(ALL_LEVELS_ON);
      const spot = locateLine(buildRows(lines, settings.foldStacks), n);
      if (!spot) return;
      const { foldKey } = spot;
      if (foldKey !== null) setExpanded((current) => new Set(current).add(foldKey));
      setChunks(Math.floor(spot.index / VIEW_CHUNK_LINES) + 1);
      setGotoRequest({ n, id: counter });
      setNav({ target: "goto", index: 0 });
    }
    window.addEventListener(GOTO_LINE_EVENT, onGoto);
    return () => window.removeEventListener(GOTO_LINE_EVENT, onGoto);
  }, [lines, settings.foldStacks]);

  async function copy() {
    setCopyState((await writeToClipboard(content)) ? "done" : "failed");
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyState("idle"), 2200);
  }

  function enableLayoutMotion() {
    document.documentElement.classList.add("layout-motion");
  }

  const summary = filtering
    ? `Showing ${number(visible.length)} of ${number(lines.length)} lines`
    : `${number(lines.length)} lines`;

  const viewStyle = {
    "--log-size": TEXT_SIZE[settings.textSize],
    "--log-lh": ROW_HEIGHT[settings.spacing],
  } as CSSProperties;

  if (kind === "readme") {
    const rendered = readmeMode === "rendered";
    const readmeFind: FindProps = {
      value: search,
      onChange: withReset(setSearch),
      useRegex,
      onRegex: withReset(setUseRegex),
      matchCase,
      onMatchCase: withReset(setMatchCase),
      ...(rendered
        ? {}
        : { onlyMatches, onOnlyMatches: withReset(setOnlyMatches) }),
      invalid: query.invalid,
      total: rendered ? readmeCount : findStops.length,
      position: rendered
        ? readmeIndex
        : nav?.target === "find" && currentN !== undefined
          ? nav.index
          : null,
      onStep: (direction) => {
        if (!rendered) return step("find", direction);
        if (readmeCount === 0) return;
        const from = readmeIndex ?? (direction === 1 ? -1 : 0);
        setReadmeIndex((from + direction + readmeCount) % readmeCount);
      },
    };

    return (
      <div
        className="workspace"
        data-wide={settings.fullWidth}
        data-stuck={stuck}
        ref={workspaceRef}
      >
        <div className="toolbar readme-toolbar">
          <div className="toolbar__row">
            <Segmented
              label="README view"
              options={[
                { value: "rendered", label: "Rendered" },
                { value: "source", label: "Source" },
              ]}
              value={readmeMode}
              onChange={(mode) => {
                setReadmeMode(mode);
                setReadmeIndex(null);
                setNav(null);
              }}
            />
            <SearchBox find={readmeFind} label="Find in README" />
            <div className="toolbar__actions">
              <button
                type="button"
                className="action action--copy"
                data-tip="Copy the whole file"
                onClick={() => void copy()}
                data-state={copyState}
              >
                {copyState === "done" ? (
                  <Check aria-hidden="true" />
                ) : copyState === "failed" ? (
                  <WarningCircle aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {copyState === "done"
                  ? "Copied"
                  : copyState === "failed"
                    ? "Copy failed"
                    : "Copy"}
              </button>
              <button
                type="button"
                className="action"
                data-tip="Show a QR code for this page"
                onClick={() => setQrOpen(true)}
              >
                <QrCode aria-hidden="true" />
                QR code
              </button>
              <button
                type="button"
                className="action"
                aria-pressed={settings.fullWidth}
                data-tip={settings.fullWidth ? "Back to the normal width" : "Stretch to the whole window"}
                onClick={() => {
                  enableLayoutMotion();
                  update({ fullWidth: !settings.fullWidth });
                }}
              >
                {settings.fullWidth ? (
                  <ArrowsInLineHorizontal aria-hidden="true" />
                ) : (
                  <ArrowsOutLineHorizontal aria-hidden="true" />
                )}
                Full width
              </button>
            </div>
          </div>
          {query.invalid && (
            <p id="line-filter-error" className="toolbar__error" role="alert">
              That pattern isn&apos;t valid. Check the brackets and slashes.
            </p>
          )}
        </div>

        <div className="workspace__body workspace__body--single">
          <div className="workspace__viewer">
            {readmeMode === "rendered" ? (
              <ReadmeView
                text={content}
                label="Rendered README"
                find={{
                  pattern: query.highlight,
                  index: readmeIndex,
                  onCount: setReadmeCount,
                }}
              />
            ) : (
              <div
                ref={viewer}
                role="region"
                aria-label="README source lines"
                tabIndex={0}
                className="log scroll-quiet"
                data-wrap={settings.wrap}
                data-numbers={settings.lineNumbers}
                data-color={settings.colorLevels}
                style={viewStyle}
              >
                <LogRows
                  rows={shownRows}
                  highlight={query.highlight}
                  timestamps={settings.timestamps}
                  expanded={expanded}
                  onToggleFold={toggleFold}
                  marked={marked}
                  onToggleMark={toggleMark}
                  onMarkPointerDown={beginMarkSession}
                  onMarkPointerEnter={extendMarkSession}
                  intro={intro}
                  currentN={currentN}
                />
                {remaining > 0 && (
                  <div className="log__more log__more--action">
                    <button
                      type="button"
                      className="button hollow button--sm"
                      onClick={() => setChunks((current) => current + 1)}
                    >
                      Show {number(Math.min(remaining, VIEW_CHUNK_LINES))} more
                    </button>
                    <span>{number(remaining)} left</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <QrDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          logId={logId}
          rawUrl={rawUrl}
        />

        <button
          type="button"
          ref={topBtn}
          className="to-top"
          data-visible={showTop}
          aria-label="Back to top"
          data-tip="Back to top"
          tabIndex={showTop ? 0 : -1}
          onClick={scrollToTop}
        >
          <ArrowUp aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="workspace"
      data-wide={settings.fullWidth}
      data-stuck={stuck}
      ref={workspaceRef}
    >
      <FilterBar
        find={{
          value: search,
          onChange: withReset(setSearch),
          useRegex,
          onRegex: withReset(setUseRegex),
          matchCase,
          onMatchCase: withReset(setMatchCase),
          onlyMatches,
          onOnlyMatches: withReset(setOnlyMatches),
          invalid: query.invalid,
          total: findStops.length,
          position:
            nav?.target === "find" && currentN !== undefined ? nav.index : null,
          onStep: (direction) => step("find", direction),
        }}
        levels={{
          on: levels,
          counts,
          stops: Object.fromEntries(
            LEVEL_GROUPS.map((group) => [group, levelStops[group].length]),
          ) as Record<LevelGroup, number>,
          position:
            nav && nav.target !== "find" && nav.target !== "goto" && currentN !== undefined
              ? { group: nav.target, index: nav.index }
              : null,
          onToggle: toggleLevel,
          onStep: step,
        }}
        summary={summary}
        canReset={canReset}
        onReset={resetFilters}
        actions={{
          copyState,
          onCopy: () => void copy(),
          onQr: () => setQrOpen(true),
          fullWidth: settings.fullWidth,
          onToggleFullWidth: () => {
            enableLayoutMotion();
            update({ fullWidth: !settings.fullWidth });
          },
          panelOpen: settings.panelOpen,
          panelId,
          onTogglePanel: () => {
            enableLayoutMotion();
            update({ panelOpen: !settings.panelOpen });
          },
        }}
      />

      <div
        className={`workspace__body${settings.panelOpen ? "" : " is-panel-closed"}`}
      >
        <div className="workspace__viewer">
          <div
            ref={viewer}
            role="region"
            aria-label="Log lines"
            tabIndex={0}
            className="log scroll-quiet"
            data-wrap={settings.wrap}
            data-numbers={settings.lineNumbers}
            data-color={settings.colorLevels}
            style={viewStyle}
          >
            {rows.length === 0 ? (
              <div className="workspace__empty">
                <p>No lines match these filters.</p>
                {canReset && (
                  <button
                    type="button"
                    className="button hollow button--sm"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <LogRows
                  rows={shownRows}
                  highlight={query.highlight}
                  timestamps={settings.timestamps}
                  expanded={expanded}
                  onToggleFold={toggleFold}
                  marked={marked}
                  onToggleMark={toggleMark}
                  onMarkPointerDown={beginMarkSession}
                  onMarkPointerEnter={extendMarkSession}
                  intro={intro}
                  currentN={currentN}
                />
                {remaining > 0 && (
                  <div className="log__more log__more--action">
                    <button
                      type="button"
                      className="button hollow button--sm"
                      onClick={() => setChunks((current) => current + 1)}
                    >
                      Show {number(Math.min(remaining, VIEW_CHUNK_LINES))} more
                    </button>
                    <span>{number(remaining)} left</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="workspace__side" inert={!settings.panelOpen}>
          <div className="workspace__side-inner">
            <SettingsPanel
              id={panelId}
              settings={settings}
              onChange={update}
              onReset={reset}
            />
          </div>
        </div>
      </div>

      <QrDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          logId={logId}
          rawUrl={rawUrl}
        />

      <button
        type="button"
        ref={topBtn}
        className="to-top"
        data-visible={showTop}
        aria-label="Back to top"
        data-tip="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={scrollToTop}
      >
        <ArrowUp aria-hidden="true" />
      </button>
    </div>
  );
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    field.remove();
    return copied;
  }
}

