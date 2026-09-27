import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/guide-view";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GUIDES } from "@/content/guides";
import { absoluteUrl, breadcrumbLd, openGraphFor } from "@/lib/seo";

const TITLE = "Minecraft log guides";
const DESCRIPTION =
  "Where to find Minecraft logs and crash reports, how to read them, how to fix common errors like OutOfMemoryError, and how to share a log safely.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: openGraphFor({ path: "/guides", title: TITLE, description: DESCRIPTION }),
};

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export default function GuidesPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero hero--doc grid-container">
          <div className="hero__head settle">
            <Breadcrumbs crumbs={CRUMBS} />
            <h1 className="hero__title">{TITLE}</h1>
            <p className="hero__lead">
              Short guides for the moment something breaks and someone asks for
              your log.
            </p>
          </div>
        </section>

        <div className="grid-container doc-wrap">
          <ul className="guide-cards">
            {GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link href={guide.path} className="guide-cards__link">
                  <span className="guide-cards__title">{guide.title}</span>
                  <span className="guide-cards__text">{guide.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter />
      <Analytics />

      <JsonLd
        data={[
          breadcrumbLd(CRUMBS),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl("/guides"),
          },
        ]}
      />
    </>
  );
}
