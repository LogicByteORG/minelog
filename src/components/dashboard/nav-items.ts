import { ACCOUNT_PATH, DASHBOARD_PATH } from "@/lib/auth-providers";

export type DashboardTab = {
  href: string;
  label: string;
  badge?: string;
};

export const DASHBOARD_TABS: DashboardTab[] = [
  { href: DASHBOARD_PATH, label: "Overview" },
  { href: `${DASHBOARD_PATH}/logs`, label: "Logs" },
  { href: `${DASHBOARD_PATH}/alerts`, label: "Alerts" },
  { href: `${DASHBOARD_PATH}/servers`, label: "Servers" },
  { href: `${DASHBOARD_PATH}/webhooks`, label: "Webhooks" },
  { href: ACCOUNT_PATH, label: "Account" },
];

export const DASHBOARD_RESOURCES = [
  { href: "/guides", label: "Guides" },
  { href: "/plugin", label: "Plugin" },
  { href: "/api", label: "API" },
] as const;

export function currentTab(pathname: string): DashboardTab | null {
  const matches = DASHBOARD_TABS.filter(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  ).sort((a, b) => b.href.length - a.href.length);
  return matches[0] ?? null;
}
