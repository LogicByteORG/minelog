import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard | minelog" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireSession();

  return (
    <div className="dash">
      <DashboardHeader />
      <main className="dash-wide dash__main">{children}</main>
      <DashboardFooter />
    </div>
  );
}
