"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { currentTab, DASHBOARD_TABS } from "./nav-items";

export function DashboardTabs() {
  const active = currentTab(usePathname());
  const nav = useRef<HTMLElement>(null);

  // Mirrors the scroll position into data attributes so the CSS can fade only the
  // edges that actually have more tabs behind them.
  const sync = useCallback(() => {
    const element = nav.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    element.dataset.start = element.scrollLeft > 1 ? "more" : "end";
    element.dataset.end = element.scrollLeft < max - 1 ? "more" : "end";
  }, []);

  useEffect(() => {
    const element = nav.current;
    if (!element) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sync]);

  useEffect(() => {
    nav.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active?.href]);

  return (
    <nav aria-label="Dashboard" className="dash-tabs" ref={nav} onScroll={sync}>
      <ul className="dash-tabs__list">
        {DASHBOARD_TABS.filter((tab) => !tab.menu).map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              className="dash-tabs__link"
              aria-current={active?.href === tab.href ? "page" : undefined}
            >
              {tab.label}
              {tab.badge && <span className="dash-tabs__badge">{tab.badge}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
