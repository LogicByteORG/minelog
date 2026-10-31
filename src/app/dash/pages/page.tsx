import type { Metadata } from "next";
import { PagesManager } from "@/components/dashboard/pages-manager";
import { PAGES_PER_ACCOUNT } from "@/lib/config";
import { listPageCards } from "@/lib/log-pages";
import { logoSources } from "@/lib/page-settings";
import { requireSession } from "@/lib/session";
import { cdnBase } from "@/lib/site";
import { timeAgo } from "@/lib/time";

export const metadata: Metadata = { title: "Custom log pages" };

export default async function PagesPage() {
  const { user } = await requireSession();
  const pages = await listPageCards(user.id);

  return (
    <PagesManager
      pages={pages.map((page) => ({
        id: page.id,
        name: page.name,
        slug: page.slug,
        logo: logoSources(page, cdnBase()),
        background: page.theme.background ?? null,
        logCount: page.logCount,
        lastLog: page.lastLogAt ? timeAgo(page.lastLogAt) : null,
        keyPrefix: page.keyPrefix,
        domain: page.domainVerifiedAt ? page.domain : null,
      }))}
      limit={PAGES_PER_ACCOUNT}
    />
  );
}
