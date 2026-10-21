import type { Metadata } from "next";
import { Inline } from "@/components/guide-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  ALERTS_PER_ACCOUNT,
  ALERTS_PER_MINUTE,
  ALERT_RETENTION_DAYS,
  EVENTS_PER_MINUTE,
  REPORT_EMAIL,
  SERVERS_PER_ACCOUNT,
  WEBHOOKS_PER_ACCOUNT,
} from "@/lib/config";
import { openGraphFor } from "@/lib/seo";
import content from "@/content/rules.json";

function fill(text: string): string {
  return text
    .replaceAll("{servers}", String(SERVERS_PER_ACCOUNT))
    .replaceAll("{webhooks}", String(WEBHOOKS_PER_ACCOUNT))
    .replaceAll("{events}", String(EVENTS_PER_MINUTE))
    .replaceAll("{alerts}", String(ALERTS_PER_MINUTE))
    .replaceAll("{kept}", String(ALERTS_PER_ACCOUNT))
    .replaceAll("{alertDays}", String(ALERT_RETENTION_DAYS))
    .replaceAll("{email}", REPORT_EMAIL);
}

const DESCRIPTION =
  "The rules for sharing logs, connecting a server and sending alerts on minelog, including keeping player data and secrets out of webhooks.";

export const metadata: Metadata = {
  title: content.title,
  description: DESCRIPTION,
  alternates: { canonical: "/rules" },
  openGraph: openGraphFor({ path: "/rules", title: content.title, description: DESCRIPTION }),
};

export default function RulesPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero hero--center hero--doc grid-container">
          <div className="hero__head settle">
            <h1 className="hero__title">{content.title}</h1>
            <p className="hero__lead">{fill(content.lead)}</p>
            <p className="doc__updated">{content.updated}</p>
          </div>
        </section>

        <div className="grid-container reveal doc-wrap">
          <div className="doc">
            {content.sections.map((section) => (
              <div key={section.id}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>
                    <Inline text={fill(paragraph)} />
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
