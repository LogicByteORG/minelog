import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PasteEditor } from "@/components/paste-editor";
import { RedactionDemo } from "@/components/redaction-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GUIDES } from "@/content/guides";
import { HOME_FAQ } from "@/content/home-faq";
import {
  HIGHLIGHTED_LANGUAGES,
  SUPPORTED_FILE_TYPES,
} from "@/content/supported-files";
import { RETENTION_DAYS } from "@/lib/config";
import {
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  faqLd,
  openGraphFor,
} from "@/lib/seo";

const DESCRIPTION = `Paste a Minecraft server log, client log or crash report and get a link to share. IP addresses and tokens are hidden. Logs delete after ${RETENTION_DAYS} days.`;

export const metadata: Metadata = {
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: openGraphFor({
    path: "/",
    title: "Share Minecraft logs and crash reports",
    description: DESCRIPTION,
  }),
};

const APP_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_TAGLINE,
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
];

const WHERE_TO_LOOK = [
  {
    name: "Client log",
    path: ".minecraft/logs/latest.log",
    note: "Open the game folder from your launcher. The logs folder is inside.",
  },
  {
    name: "Server log",
    path: "logs/latest.log",
    note: "In the folder your server runs from. Hosting panels usually list it under Files or Console.",
  },
  {
    name: "Crash report",
    path: "crash-reports/",
    note: "Take the newest file. The name ends in -client or -server, which tells you where it crashed.",
  },
  {
    name: "Java crash report",
    path: "hs_err_pid12345.log",
    note: "Java writes this when it crashes outright. Look in the game or server folder.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero grid-container">
          <div className="hero__head settle">
            <h1 className="hero__title">
              Share a <span className="mc-word">Minecraft</span> log in one
              link.
            </h1>
            <p className="hero__lead">
              Paste a server log, client log or crash report.
            </p>
          </div>
          <div className="settle settle--late">
            <PasteEditor />
          </div>
        </section>

        <section id="privacy" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-5 section__intro">
                <h2 className="section__title">
                  We hide private details before upload
                </h2>
                <p className="section__text">
                  IP addresses, MAC addresses, user folder names, tokens and
                  email addresses get replaced in your browser before anything is sent.
                  Player names stay, because you usually need them to debug.
                </p>
              </div>
              <div className="cell small-12 large-7">
                <RedactionDemo />
              </div>
            </div>
          </div>
        </section>

        <section id="find" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-4 section__intro">
                <h2 className="section__title">Where to find your log</h2>
                <p className="section__text">
                  Most launchers and hosts have a button for this. If yours
                  doesn&apos;t, look here.
                </p>
              </div>
              <div className="cell small-12 large-8">
                <dl className="finds">
                  {WHERE_TO_LOOK.map((item) => (
                    <div key={item.name} className="finds__item">
                      <dt className="finds__name">{item.name}</dt>
                      <dd className="finds__detail">
                        <code className="finds__path">{item.path}</code>
                        <span className="finds__note">{item.note}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section id="filetypes" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-4 section__intro">
                <h2 className="section__title">Supported file types</h2>
                <p className="section__text">
                  minelog reads plain text. Logs, crash reports and config
                  files get spotted on their own, and shown the way
                  they&apos;re meant to look — no need to tell us what
                  you&apos;re pasting.
                </p>
              </div>
              <div className="cell small-12 large-8">
                <ul className="filetype-grid">
                  {SUPPORTED_FILE_TYPES.map((item) => (
                    <li key={item.kind} className="filetype-card">
                      <h3 className="filetype-card__name">{item.kind}</h3>
                      <p className="filetype-card__note">{item.note}</p>
                      <code className="filetype-card__example">
                        {item.example}
                      </code>
                    </li>
                  ))}
                </ul>
                <div className="filetypes-also">
                  <p className="filetypes-also__title">
                    Anything else that&apos;s plain text still gets colored
                    if we recognize the language:
                  </p>
                  <ul className="filetypes-also__list">
                    {HIGHLIGHTED_LANGUAGES.map((language) => (
                      <li key={language} className="lang-tag">
                        {language}
                      </li>
                    ))}
                  </ul>
                  <p className="filetypes-excluded">
                    Not supported: archives like .zip, .jar, .gz, .7z and
                    .rar (unzip them and paste the file inside), plus
                    images, audio and video.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="questions" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-4 section__intro">
                <h2 className="section__title">Questions people ask</h2>
                <p className="section__text">
                  Quick answers. If something is broken, the guides go into
                  more detail.
                </p>
              </div>
              <div className="cell small-12 large-8">
                <div className="home-faq">
                  {HOME_FAQ.map((item) => (
                    <div key={item.question} className="home-faq__item">
                      <h3>{item.question}</h3>
                      <p>{item.answer}</p>
                    </div>
                  ))}
                  <p className="home-faq__more">
                    More in the guides:{" "}
                    {GUIDES.map((guide, index) => (
                      <span key={guide.slug}>
                        {index > 0 && ", "}
                        <Link href={guide.path}>{guide.title}</Link>
                      </span>
                    ))}
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <Analytics />

      <JsonLd data={[...APP_LD, faqLd(HOME_FAQ)]} />
    </>
  );
}
