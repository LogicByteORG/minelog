import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import Link from "next/link";
import { ApiToc } from "@/components/api/api-toc";
import { CodeTabs } from "@/components/api/code-tabs";
import { BetaTag } from "@/components/beta-tag";
import { WebhookIcon } from "@/components/dashboard/webhook-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  COMMANDS,
  EFFECTS,
  ERROR_SAMPLE,
  EVENTS,
  EXPRESSIONS,
  JOIN_SAMPLE,
  KICK_SAMPLE,
  LIMITS,
  OUTLINE,
  SHARE_SAMPLE,
  TPS_SAMPLE,
  TROUBLE,
  type Row,
} from "@/content/plugin-docs";
import { CURSEFORGE_URL, GITHUB_URL, HANGAR_URL } from "@/lib/config";
import { openGraphFor } from "@/lib/seo";
import { PLATFORMS } from "@/lib/webhook-platforms";

const TITLE = "Minecraft server alerts and Skript syntax";

const DESCRIPTION =
  "Connect a Minecraft server to minelog, get its errors in Discord, Slack, Teams and more, and send your own alerts from Skript.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/plugin" },
  openGraph: openGraphFor({ path: "/plugin", title: TITLE, description: DESCRIPTION }),
};

function DocTable({ head, rows, code = [0] }: { head: string[]; rows: Row[]; code?: number[] }) {
  return (
    <div className="api-table-wrap scroll-quiet">
      <table className="api-table api-table--wrap">
        <thead>
          <tr>
            {head.map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index}>{code.includes(index) ? <code>{cell}</code> : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PluginPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero hero--doc grid-container">
          <div className="hero__head settle">
            <h1 className="hero__title hero__title--tagged">
              Plugin
              <BetaTag />
            </h1>
            <p className="hero__lead">
              Connect a server to your minelog account. Its errors land in your dashboard and in the chat apps
              you already use, and Skript can send alerts of your own.
            </p>
          </div>
        </section>

        <div className="grid-container api-layout doc-wrap">
          <ApiToc items={OUTLINE} />

          <div className="api-main">
            <section id="overview" className="api-section">
              <h2>What it does</h2>
              <p>
                The minelog plugin watches your server&apos;s log. When an error shows up, it saves it under Alerts
                in your dashboard and tells the webhooks you picked. You can also tell it to message you when the
                server starts or stops. If you use Skript, it adds a few lines of syntax so your own scripts can
                send alerts and react to the same events.
              </p>
              <p>
                You need an account for this part, since the alerts belong to you. Sharing a log still works without
                one.
              </p>
              <p>
                The server connection is in beta. It works, but details can still change. If something breaks, tell us
                on <a href={`${GITHUB_URL}/issues`}>GitHub</a>.
              </p>
            </section>

            <section id="install" className="api-section">
              <h2>Install</h2>
              <ol>
                <li>
                  Download the jar from the site you like best: <a href={HANGAR_URL}>Paper Hangar</a> or{" "}
                  <a href={CURSEFORGE_URL}>CurseForge</a>. Modrinth is coming soon. Put the jar in your{" "}
                  <code>plugins</code> folder.
                </li>
                <li>Restart the server. Spigot, Paper, Purpur and Folia all run the same jar.</li>
                <li>
                  Using Skript? There is nothing more to install. If Skript 2.9 or newer is there, on Java 17 or
                  newer, the syntax below switches on by itself. You will see{" "}
                  <code>Skript found. The minelog syntax is ready.</code> in the console.
                </li>
              </ol>
            </section>

            <section id="connect" className="api-section">
              <h2>Connect your server</h2>
              <ol>
                <li>
                  Sign in and open <Link href="/dash/servers">Servers</Link> in your dashboard. Choose Add
                  server.
                </li>
                <li>Copy the key it shows you. It starts with <code>mlk_</code> and is shown only once.</li>
                <li>
                  Run <code>/minelog auth mlk_your_key</code> in the server console.
                </li>
              </ol>
              <p>
                Use the console, not the in-game chat. Commands typed in chat are written to the server log, and the
                key would be in it.
              </p>
              <p>
                The server is named after its software and version, for example <code>Paper 1.21.8</code>. You can
                rename it in the dashboard. Run <code>/minelog status</code> any time to check the connection.
              </p>
              <p>
                Right after you connect, the plugin tells you if Skript is missing. Error alerts work without it, but
                the Skript lines below stay off until you install Skript.
              </p>
            </section>

            <section id="webhooks" className="api-section">
              <h2>Pick where alerts go</h2>
              <p>
                Webhooks live under <Link href="/dash/webhooks">Webhooks</Link> in the dashboard. Paste the URL
                and minelog works out which service it belongs to. Every webhook also gets a short handle, like{" "}
                <code>ops-discord</code>, that Skript uses to pick it. A webhook can listen to all your servers or only
                some.
              </p>
              <ul className="plugin-platforms">
                {PLATFORMS.map((platform) => (
                  <li key={platform.kind} className="plugin-platforms__item">
                    <WebhookIcon kind={platform.kind} size={18} />
                    <span>
                      <strong>{platform.name}.</strong> {platform.note}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                The dashboard has a longer list with where to find each URL. Open Add webhook and choose See
                supported platforms.
              </p>
            </section>

            <section id="errors" className="api-section">
              <h2>Error alerts</h2>
              <p>
                The plugin reads <code>logs/latest.log</code> and picks out lines at ERROR or FATAL level, together
                with the stack trace under them. Each one is saved under{" "}
                <Link href="/dash/alerts">Alerts</Link>.
              </p>
              <ul>
                <li>The same error counts up instead of piling up. Your webhooks hear about it the first time.</li>
                <li>Alerts are stored encrypted and only you can read them. Each one is deleted after 14 days.</li>
                <li>
                  The plugin starts reading from the end of the log when it connects, so old errors are not sent.
                </li>
                <li>
                  Start and stop notices go to your webhooks too. Turn them off with <code>notify-start</code> and{" "}
                  <code>notify-stop</code> in <code>config.yml</code>, or all error alerts with{" "}
                  <code>alerts: false</code>.
                </li>
              </ul>
              <p>
                Want to see it work? Run <code>/minelog test</code>. It writes a harmless error to the log and you
                should see it under Alerts a few seconds later.
              </p>
            </section>

            <section id="commands" className="api-section">
              <h2>Commands</h2>
              <p>
                <code>/mlog</code> does the same as <code>/minelog</code>, and so does <code>/log</code> unless you turn
                it off with <code>log-command: false</code>. Every permission is given to operators by default, and{" "}
                <code>minelog.admin</code> holds all of them.
              </p>
              <DocTable head={["Command", "What it does", "Permission"]} rows={COMMANDS} code={[0, 2]} />
            </section>

            <section id="skript" className="api-section">
              <h2>Use it from Skript</h2>
              <p>
                You write the scripts, minelog sends the message. Anything Skript can notice, from a player joining to
                a command running to a number crossing a line, can become an alert. Put a script in{" "}
                <code>plugins/Skript/scripts</code> and run <code>/sk reload your-script</code>.
              </p>
              <p>
                Without a webhook named, an alert goes to every webhook listening to the server. Name one with{" "}
                <code>to webhook &quot;handle&quot;</code> to send only there.
              </p>
            </section>

            <section id="effects" className="api-section">
              <h2>Effects</h2>
              <DocTable head={["Syntax", "What it does"]} rows={EFFECTS} />
            </section>

            <section id="events" className="api-section">
              <h2>Events</h2>
              <DocTable head={["Syntax", "When it runs"]} rows={EVENTS} />
            </section>

            <section id="expressions" className="api-section">
              <h2>Expressions</h2>
              <DocTable head={["Syntax", "What it gives you"]} rows={EXPRESSIONS} />
            </section>

            <section id="recipes" className="api-section">
              <h2>Recipes</h2>
              <p>
                These are starting points. Change the text, the level and the handle to fit your server. Skript
                prints its own error in the console when it cannot read a line, so a typo is easy to find.
              </p>

              <h3>Someone joins</h3>
              <p>
                Waiting two seconds gives the server time to measure the ping. A ping read at the very moment of
                joining is usually 0.
              </p>
              <CodeTabs
                label="Join alert"
                samples={[{ id: "join", label: "Skript", code: JOIN_SAMPLE }]}
              />

              <h3>Someone is kicked</h3>
              <p>
                A kicked player also triggers the quit event, so the script remembers the kick and skips the second
                message. Minecraft hands over its default kick text as a translation key, which the script turns into
                plain words.
              </p>
              <CodeTabs
                label="Kick alert"
                samples={[{ id: "kick", label: "Skript", code: KICK_SAMPLE }]}
              />

              <h3>The server slows down</h3>
              <CodeTabs
                label="TPS alert"
                samples={[{ id: "tps", label: "Skript", code: TPS_SAMPLE }]}
              />

              <h3>An error shows up</h3>
              <p>
                New errors already reach your webhooks without a script. Use this when you want one of them sent to a
                different webhook, or with your own words around it.
              </p>
              <CodeTabs
                label="Error to a webhook"
                samples={[{ id: "error", label: "Skript", code: ERROR_SAMPLE }]}
              />

              <h3>Share a log from a command</h3>
              <CodeTabs
                label="Share a log"
                samples={[{ id: "share", label: "Skript", code: SHARE_SAMPLE }]}
              />
            </section>

            <section id="limits" className="api-section">
              <h2>Limits</h2>
              <DocTable head={["What", "Limit"]} rows={LIMITS} code={[]} />
            </section>

            <section id="troubleshooting" className="api-section">
              <h2>Troubleshooting</h2>
              <dl className="plugin-trouble">
                {TROUBLE.map((item) => (
                  <div key={item.problem} className="plugin-trouble__item">
                    <dt>{item.problem}</dt>
                    <dd>{item.fix}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
      <Analytics />
    </>
  );
}
