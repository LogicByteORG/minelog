"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentTab, DASHBOARD_TABS } from "./nav-items";

export function DashboardTabs() {
  const active = currentTab(usePathname());

  return (
    <nav aria-label="Dashboard" className="dash-tabs">
      <ul className="dash-tabs__list">
        {DASHBOARD_TABS.map((tab) => (
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
