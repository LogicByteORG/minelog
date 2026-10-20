import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeTabs } from "@/components/api/code-tabs";
import { JsonLd } from "@/components/json-ld";
import { PasteEditor } from "@/components/paste-editor";
import { RedactionDemo } from "@/components/redaction-demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GUIDES } from "@/content/guides";
import { FAQ_GROUPS, HOME_FAQ } from "@/content/home-faq";
import { ERROR_SAMPLE, TPS_SAMPLE } from "@/content/plugin-docs";
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

const DESCRIPTION = `Got a Minecraft log that needs a second pair of eyes? Paste your server log, client log or crash report. minelog scrubs the private stuff and flags what actually broke. Then it hands you a link you can share anywhere. Free, no account needed.`;

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
    note: "Your IP, tokens, passwords, emails and those long user folder paths get swapped out in your browser before anything leaves it. We run a second check on our side too.",
    example: "203.0.113.42 becomes [redacted]",
  },
  {
    name: "Problems explained",
    note: "If we have seen that error before, we tell you what it usually means and what to try first. Your game version, loader, Java build and mod list get pulled out too, so you skip the hunt.",
    example: "OutOfMemoryError: raise -Xmx",
  },
  {
    name: "Easy to read",
    note: "Errors get their own color. So do warnings. Giant stack traces fold away until you need them. Got a 50k line file? Search or filter down to the one line you care about.",
    example: "Errors only, one click",
  },
  {
    name: "Gone when it should be",
    note: `Links live for ${RETENTION_DAYS} days, then they are gone for good. Turn hiding off and they only last ${UNHIDDEN_RETENTION_HOURS} hours. No account, ever.`,
    example: "Delete it in the first hour",
  },
];

const SERVER_ALERTS = [
  {
    name: "Errors in your dashboard",
    note: "Connect a server with a key and the errors in its log show up under Alerts. The same error counts up instead of piling up, so a noisy plugin does not bury the rest.",
    example: "ERROR in latest.log, then Alerts",
  },
  {
    name: "Where you already are",
    note: "Discord, Slack, Microsoft Teams, Google Chat, Telegram, Guilded and Mattermost all work. So does any address that takes JSON, like Zapier, n8n or your own server.",
    example: "Paste the URL, we pick the format",
  },
  {
    name: "Start and stop notices",
    note: "Hear when a server comes up or goes down. Each server connects with its own key, and you choose which webhooks listen to which server.",
    example: "Paper 1.21.8 started",
  },
  {
    name: "Yours alone",
    note: "Alerts are stored encrypted and only you can read them. Each one is deleted after 14 days. The key stays in your server's plugin folder, and you can revoke it any time.",
    example: "14 days, then gone",
  },
];

const JOIN_SHORT = `on join:
    send minelog alert "%player% joined" with message "Players online: %number of all players%" as info`;

const WHERE_TO_LOOK = [
  {
    name: "Client log",
    path: ".minecraft/logs/latest.log",
    note: "Open your launcher, find the button that opens your game folder. logs is in there. On Windows you can also hit Win + R, type %appdata% and open .minecraft by hand.",
  },
  {
    name: "Server log",
    path: "logs/latest.log",
    note: "Look next to your server jar, that is where it lives. On a hosting panel check under Files. Or just watch it scroll past in Console.",
  },
  {
    name: "Crash report",
    path: "crash-reports/",
    note: "Take the newest file in there. Ends in -client or -server? That tells you which side went down.",
  },
  {
    name: "Java crash report",
    path: "hs_err_pid12345.log",
    note: "Java drops one of these when it dies hard. No goodbye, just this file. Look in the game or server folder.",
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
              Drop in a server log, client log or crash report. We strip out
              the private bits and point to the error that actually matters.
              Then you get one link to pass around.
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
                  You paste, you get a link. That link scrubs the sensitive
                  bits too. Explains the errors we know. And it stays readable
                  even when the file is massive.
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
                  Your IP. Your MAC address. Those long user folder paths,
                  tokens, passwords, emails. None of that leaves your machine
                  as is. We swap it out in your browser first, then check
                  again once the file lands with us. Player names stay put.
                  You usually need them to figure out what happened.
                </p>
                <p className="section__text">
                  The preview is honest, what you see there is what gets
                  saved. One heads up though. A secret only you would
                  recognize can slip past the filters. Say a private address
                  tucked inside a chat message. Give it a quick read before
                  you press Get link.
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
                  Many launchers let you copy the log straight out. Most
                  panels too. No button? Grab the file by hand, it lives in
                  one of these places.
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
                  Just paste. We work out what kind of file it is on our own.
                  Logs get one view, crash reports another, configs their
                  own. No need to tell us what you pasted.
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
                    Something else in plain text? If we know the language it
                    still gets colors:
                  </p>
                  <ul className="filetypes-also__list">
                    {HIGHLIGHTED_LANGUAGES.map((language) => (
                      <li key={language} className="lang-tag">
                        {language}
                      </li>
                    ))}
                  </ul>
                  <p className="filetypes-excluded">
                    Archives such as .zip, .jar, .gz, .7z and .rar will not
                    open here. Unzip first, then paste what is inside. Images,
                    audio and video are out too.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="server" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-4 section__intro">
                <h2 className="section__title">
                  Know when your server has a problem
                </h2>
                <p className="section__text">
                  Sharing a log is half of it. Connect a server to your
                  account and the plugin keeps an eye on its log for you. When
                  something breaks, you hear about it where you already hang
                  out. This part is in beta.
                </p>
                <Link href="/plugin" className="faq-guides__all">
                  See how it works
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              <div className="cell small-12 large-8">
                <ul className="filetype-grid filetype-grid--pairs">
                  {SERVER_ALERTS.map((item) => (
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

        <section id="skript" className="section">
          <div className="grid-container reveal">
            <div className="grid-x grid-margin-x">
              <div className="cell small-12 large-5 section__intro">
                <h2 className="section__title">
                  Your own alerts, in a few lines of Skript
                </h2>
                <p className="section__text">
                  Already run Skript? The plugin gives your scripts a few new
                  lines. Someone joins, the TPS drops, a player gets kicked, a
                  command runs. You write the trigger and minelog does the
                  sending.
                </p>
                <p className="section__text">
                  Nothing extra to install. If Skript is there, the syntax
                  switches on by itself.
                </p>
                <Link href="/plugin#recipes" className="faq-guides__all">
                  More recipes
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              <div className="cell small-12 large-7">
                <CodeTabs
                  label="Skript examples"
                  samples={[
                    { id: "join", label: "Join", code: JOIN_SHORT },
                    { id: "lag", label: "Lag", code: TPS_SAMPLE },
                    { id: "error", label: "Error", code: ERROR_SAMPLE },
                  ]}
                />
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
                  Short answers live below. And if your game or server is
                  misbehaving right now, the guides take the usual suspects
                  one by one.
                </p>
                <h3 className="faq__label faq__label--guides">Popular guides</h3>
                <ul className="faq-guides">
                  {GUIDES.slice(0, 4).map((guide) => (
                    <li key={guide.slug}>
                      <Link href={guide.path}>{guide.title}</Link>
                    </li>
                  ))}
                </ul>
                <Link href="/guides" className="faq-guides__all">
                  See all {GUIDES.length} guides
                  <span aria-hidden="true">&rarr;</span>
                </Link>
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
