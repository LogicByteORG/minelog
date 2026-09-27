"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type Item = { id: string; label: string };

const GLIDE_MS = 900;

export function ApiToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const gliding = useRef(false);
  const glideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        if (gliding.current) return;
        const first = items.find(({ id }) => visible.has(id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      window.clearTimeout(glideTimer.current);
    };
  }, [items]);

  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gliding.current = true;
    window.clearTimeout(glideTimer.current);
    glideTimer.current = window.setTimeout(
      () => {
        gliding.current = false;
      },
      reduce ? 0 : GLIDE_MS,
    );
    setActive(id);
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav className="api-toc" aria-label="On this page">
      <p className="api-toc__title">On this page</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === active ? "location" : undefined}
              onClick={(event) => go(event, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

