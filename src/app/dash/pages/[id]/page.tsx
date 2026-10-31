import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/dashboard/page-editor";
import { stateOf } from "@/lib/custom-domains";
import { ID_PATTERN } from "@/lib/label";
import { domainsConfigured } from "@/lib/vercel-domains";
import { findOwnedPage } from "@/lib/log-pages";
import { logoSources } from "@/lib/page-settings";
import { requireSession } from "@/lib/session";
import { cdnBase } from "@/lib/site";
import { formatDate } from "@/lib/time";

export const metadata: Metadata = { title: "Edit log page" };

export default async function EditPagePage({ params }: PageProps<"/dash/pages/[id]">) {
  const { user } = await requireSession();
  const { id } = await params;
  if (!ID_PATTERN.test(id)) notFound();

  const page = await findOwnedPage(id, user.id);
  if (!page) notFound();

  const logos = logoSources(page, cdnBase());
  return (
    <PageEditor
      page={{
        id: page.id,
        name: page.name ?? "",
        slug: page.slug,
        logoUrl: page.logoUrl ?? "",
        buttonRadius: page.buttonRadius,
        features: page.features,
        theme: page.theme,
        keyPrefix: page.keyPrefix,
        keyCreated: page.keyCreatedAt ? formatDate(page.keyCreatedAt) : null,
        domain: page.domain ? { host: page.domain, state: stateOf(page) ?? "pending" } : null,
        domainsEnabled: domainsConfigured(),
        light: page.logoLightId && logos ? logos.light : null,
        dark: page.logoDarkId && logos ? logos.dark : null,
      }}
    />
  );
}
