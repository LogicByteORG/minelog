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
import { RETENTION_DAYS, UNHIDDEN_RETENTION_HOURS } from "@/lib/config";
import {
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  faqLd,
  openGraphFor,
} from "@/lib/seo";

const DESCRIPTION = `Paste a Minecraft server log, client log or crash report. minelog hides private details, points out known problems and gives you a link to share. Free, no account.`;

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

const FEATURES = [
  {
    name: "Private by default",
    note: "IP addresses, tokens, passwords, email addresses and user folder names are replaced before anything is saved.",
    example: "203.0.113.42 becomes [redacted]",
  },
  {
    name: "Problems explained",
    note: "Known errors are listed in plain words, each with something to try first. It also reads your game version, loader, Java and mods.",
    example: "OutOfMemoryError: raise -Xmx",
  },
  {
    name: "Easy to read",
    note: "Errors and warnings are colored, long stack traces fold away, and you can search or filter to reach the right line fast.",
    example: "Errors only, one click",
  },
  {
    name: "Gone when it should be",
    note: `Links stop working after ${RETENTION_DAYS} days, or ${UNHIDDEN_RETENTION_HOURS} hours if you keep private details. No account needed.`,
    example: "Delete it in the first hour",
  },
];

const WHERE_TO_LOOK = [
  {
    name: "Client log",
    path: ".minecraft/logs/latest.log",
    note: "Open the game folder from your launcher and look for logs. On Windows, press Win + R, type %appdata% and open .minecraft.",
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
              Paste a server log, client log or crash report. We hide your
              private details, point out what went wrong and give you a link
              to share.
            </p>
          </div>
          <div className="settle settle--late">
            <PasteEditor />
          </div>
        </section>

        <section id="features" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-4 section__intro">
                <h2 className="section__title">What you get with every link</h2>
                <p className="section__text">
                  Saving a log does more than store it. Here is what the link
                  gives you and the people you send it to.
                </p>
              </div>
              <div className="cell small-12 large-8">
                <ul className="filetype-grid filetype-grid--pairs">
                  {FEATURES.map((item) => (
                    <li key={item.name} className="filetype-card">
                      <h3 className="filetype-card__name">{item.name}</h3>
                      <p className="filetype-card__note">{item.note}</p>
                      <code className="filetype-card__example">
                        {item.example}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
                  IP addresses, MAC addresses, user folder names, tokens,
                  passwords and email addresses are replaced in your browser
                  before anything is sent, and checked again on our server.
                  Player names stay, because you usually need them to debug.
                </p>
                <p className="section__text">
                  The preview shows exactly what will be saved. A secret that
                  only you would recognize can&apos;t be spotted for you, so
                  give it a quick read.
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
                  Most launchers and hosting panels have a share or copy
                  button. If yours doesn&apos;t, the file is in one of these
                  places.
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
                  minelog reads plain text and works out what it is on its own.
                  Logs, crash reports and config files each get a view that
                  suits them, so you never have to say what you&apos;re
                  pasting.
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
                  Short answers. If your game or server is misbehaving, the
                  guides walk through the common errors step by step.
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
