"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowsInLineHorizontal,
  ArrowsOutLineHorizontal,
} from "@phosphor-icons/react";
import { ReadmeView } from "./readme-view";
import { SearchBox } from "./workspace/search-box";
import { compileQuery } from "@/lib/view";
import { useViewSettings } from "@/lib/use-view-settings";

export function ReadmeMiniView({ content }: { content: string }) {
  const [search, setSearch] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [readmeCount, setReadmeCount] = useState(0);
  const [readmeIndex, setReadmeIndex] = useState<number | null>(null);
  const [showTop, setShowTop] = useState(false);
  const { settings, update } = useViewSettings();

  const deferredSearch = useDeferredValue(search);
  const query = useMemo(
    () => compileQuery(deferredSearch, useRegex, matchCase),
    [deferredSearch, useRegex, matchCase],
  );

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

  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function enableLayoutMotion() {
    document.documentElement.classList.add("layout-motion");
  }

  return (
    <div className="readme-view" data-wide={settings.fullWidth}>
      <div className="readme-view__find">
        <SearchBox
          label="Find in README"
          find={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              setReadmeIndex(null);
            },
            useRegex,
            onRegex: (value) => {
              setUseRegex(value);
              setReadmeIndex(null);
            },
            matchCase,
            onMatchCase: (value) => {
              setMatchCase(value);
              setReadmeIndex(null);
            },
            invalid: query.invalid,
            total: readmeCount,
            position: readmeIndex,
            onStep: (direction) => {
              if (readmeCount === 0) return;
              const from = readmeIndex ?? (direction === 1 ? -1 : 0);
              setReadmeIndex((from + direction + readmeCount) % readmeCount);
            },
          }}
        />
        <button
          type="button"
          className="action action--wide-toggle"
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
      {query.invalid && (
        <p className="readme-view__error" role="alert">
          That pattern is not valid. Check the brackets and slashes.
        </p>
      )}
      <ReadmeView
        text={content}
        label="Rendered README"
        find={{
          pattern: query.highlight,
          index: readmeIndex,
          onCount: setReadmeCount,
        }}
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
