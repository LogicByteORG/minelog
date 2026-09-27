import { Analytics } from "./analytics";
import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GUIDES, type Block, type Guide } from "@/content/guides";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbLd,
  faqLd,
  type Crumb,
} from "@/lib/seo";

const INLINE = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function Inline({ text }: { text: string }): ReactNode {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") ? (
        <Link key={index} href={href}>
          {label}
        </Link>
      ) : (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return part;
  });
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <figure className="guide-code">
          <pre className="scroll-quiet" tabIndex={0}>
            <code>{block.text}</code>
          </pre>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "table":
      return (
        <div className="guide-table-wrap scroll-quiet">
          <table className="guide-table">
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th key={index} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={index}>
                        <Inline text={cell} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={crumb.path}>
            {index === crumbs.length - 1 ? (
              <span aria-current="page">{crumb.name}</span>
            ) : (
              <Link href={crumb.path}>{crumb.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function GuideView({ guide, crumbs }: { guide: Guide; crumbs: Crumb[] }) {
  const related = guide.related
    .map((slug) => GUIDES.find((item) => item.slug === slug))
    .filter((item): item is Guide => item !== undefined);

  const publisher = {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    inLanguage: "en",
    mainEntityOfPage: absoluteUrl(guide.path),
    author: publisher,
    publisher,
  };

  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero hero--doc grid-container">
          <div className="hero__head settle">
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="hero__title">{guide.title}</h1>
            <p className="hero__lead">{guide.lead}</p>
            <p className="doc__updated">Updated {guide.updated}</p>
          </div>
        </section>

        <div className="grid-container doc-wrap">
          <article className="doc doc--guide">
            {guide.sections.map((section) => (
              <section key={section.id} id={section.id} className="doc__section">
                <h2>{section.heading}</h2>
                {section.blocks.map((block, index) => (
                  <BlockView key={index} block={block} />
                ))}
              </section>
            ))}

            {guide.faq.length > 0 && (
              <section id="questions" className="doc__section">
                <h2>Questions</h2>
                {guide.faq.map((item) => (
                  <div key={item.question} className="faq__item">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </section>
            )}

            {related.length > 0 && (
              <section className="doc__section">
                <h2>Keep reading</h2>
                <ul className="guide-links">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link href={item.path}>{item.title}</Link>
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="doc__cta">
              <Link href="/" className="button">
                Share a log
              </Link>
            </p>
          </article>
        </div>
      </main>

      <SiteFooter />
      <Analytics />

      <JsonLd
        data={[
          article,
          breadcrumbLd(crumbs),
          ...(guide.faq.length > 0 ? [faqLd(guide.faq)] : []),
        ]}
      />
    </>
  );
}

