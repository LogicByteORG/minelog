import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PasteEditor } from "@/components/paste-editor";
import { RedactionDemo } from "@/components/redaction-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GUIDES } from "@/content/guides";
import { FAQ_GROUPS, HOME_FAQ } from "@/content/home-faq";
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
    note: "When we recognize an error, we say what it means and what to try first. The log page also shows your game version, loader, Java and mods.",
    example: "OutOfMemoryError: raise -Xmx",
  },
  {
    name: "Easy to read",
    note: "Errors and warnings get their own colors and long stack traces fold shut. Search or filter when the file is huge and you just want one line.",
    example: "Errors only, one click",
  },
  {
    name: "Gone when it should be",
    note: `A link works for ${RETENTION_DAYS} days. Turn off hiding and it's ${UNHIDDEN_RETENTION_HOURS} hours. You never make an account.`,
    example: "Delete it in the first hour",
  },
];

const WHERE_TO_LOOK = [
  {
    name: "Client log",
    path: ".minecraft/logs/latest.log",
    note: "Your launcher can open the game folder for you, and logs is inside it. On Windows you can also hit Win + R, type %appdata% and open .minecraft.",
  },
  {
    name: "Server log",
    path: "logs/latest.log",
    note: "Next to the server jar. On a hosting panel it's usually under Files, or you can watch it in Console.",
  },
  {
    name: "Crash report",
    path: "crash-reports/",
    note: "Grab the newest file. A name ending in -client or -server tells you which side crashed.",
  },
  {
    name: "Java crash report",
    path: "hs_err_pid12345.log",
    note: "Java drops this file when it dies outright. It sits in the game or server folder.",
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
                  Short answers. If your game or server is misbehaving, these
                  guides walk through the common errors step by step.
                </p>
                <h3 className="faq__label faq__label--guides">Guides</h3>
                <ul className="faq-guides">
                  {GUIDES.map((guide) => (
                    <li key={guide.slug}>
                      <Link href={guide.path}>{guide.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cell small-12 large-8">
                <div className="faq">
                  {FAQ_GROUPS.map((group, groupIndex) => (
                    <section key={group} className="faq__group" aria-label={group}>
                      <h3 className="faq__label">{group}</h3>
                      {HOME_FAQ.filter((item) => item.group === group).map(
                        (item, index) => (
                          <details
                            key={item.question}
                            className="faq__item"
                            open={groupIndex === 0 && index === 0}
                          >
                            <summary className="faq__question">
                              <span>{item.question}</span>
                              <span className="faq__icon" aria-hidden="true" />
                            </summary>
                            <div className="faq__answer">
                              <p>{item.answer}</p>
                            </div>
                          </details>
                        ),
                      )}
                    </section>
                  ))}
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
