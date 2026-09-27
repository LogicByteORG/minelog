import type { Metadata } from "next";
import { Inline } from "@/components/guide-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  DELETE_WINDOW_MINUTES,
  MAX_LOG_BYTES,
  MAX_LOG_LINES,
  REPORT_EMAIL,
  RETENTION_DAYS,
  UPLOADS_PER_MINUTE,
} from "@/lib/config";
import { openGraphFor } from "@/lib/seo";
import content from "@/content/terms.json";

function fill(text: string): string {
  return text
    .replaceAll("{days}", String(RETENTION_DAYS))
    .replaceAll("{uploads}", String(UPLOADS_PER_MINUTE))
    .replaceAll("{size}", `${MAX_LOG_BYTES / (1024 * 1024)} MB`)
    .replaceAll("{lines}", MAX_LOG_LINES.toLocaleString("en"))
    .replaceAll("{minutes}", String(DELETE_WINDOW_MINUTES))
    .replaceAll("{email}", REPORT_EMAIL);
}

const DESCRIPTION =
  "The rules for sharing logs on minelog: what you can upload, the limits, how long logs stay and how to report one.";

export const metadata: Metadata = {
  title: content.title,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: openGraphFor({ path: "/terms", title: content.title, description: DESCRIPTION }),
};

export default function TermsPage() {
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

