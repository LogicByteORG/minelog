import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  RETENTION_DAYS,
  UNHIDDEN_RETENTION_HOURS,
  UPLOADS_PER_DAY,
  UPLOADS_PER_MINUTE,
} from "@/lib/config";
import content from "@/content/privacy.json";

function fill(text: string): string {
  return text
    .replaceAll("{days}", String(RETENTION_DAYS))
    .replaceAll("{hours}", String(UNHIDDEN_RETENTION_HOURS))
    .replaceAll("{uploads}", String(UPLOADS_PER_MINUTE))
    .replaceAll("{perDay}", String(UPLOADS_PER_DAY));
}

export const metadata: Metadata = {
  title: content.title,
  description: fill(content.lead),
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
                    <p key={paragraph.slice(0, 24)}>{fill(paragraph)}</p>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </main>

      <SiteFooter />
      <Analytics />
    </>
  );
}

