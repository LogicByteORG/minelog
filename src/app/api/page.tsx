import { Analytics } from "@/components/analytics";
import type { Metadata } from "next";
import { ApiToc } from "@/components/api/api-toc";
import { CodeTabs } from "@/components/api/code-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  ANALYSE_PARAMS,
  ANALYSE_SAMPLES,
  COMPAT,
  COMPAT_ERROR_JSON,
  COMPAT_INSIGHTS_JSON,
  COMPAT_JSON,
  COMPAT_LIMITS_JSON,
  CREATED_JSON,
  DELETED_JSON,
  DELETE_SAMPLES,
  CREATE_PARAMS,
  ERRORS,
  ERROR_JSON,
  FACT_FIELDS,
  INSIGHTS_JSON,
  INSIGHTS_SAMPLES,
  INSIGHT_FIELDS,
  LIMITS,
  LIMITS_JSON,
  LOG_FIELDS,
  NOT_FOUND_JSON,
  OUTLINE,
  PROBLEM_DOCS,
  PROBLEM_FIELDS,
  SWITCH_SAMPLES,
  UPLOAD_SAMPLES,
  type Param,
} from "@/content/api-docs";
import {
  ANALYSES_PER_MINUTE,
  API_BASE,
  DELETE_WINDOW_MINUTES,
  RETENTION_DAYS,
  SITE_BASE,
  UPLOADS_PER_DAY,
  UPLOADS_PER_MINUTE,
} from "@/lib/config";
import { openGraphFor } from "@/lib/seo";
import { MAX_SOURCE_LENGTH } from "@/lib/source";

export const metadata: Metadata = {
  title: "Minecraft log API, mclo.gs compatible",
  description:
    "Save Minecraft logs from a launcher, mod or server panel with one request. Also works with tools written for the mclo.gs API.",
  alternates: { canonical: "/api" },
  openGraph: openGraphFor({
    path: "/api",
    title: "Minecraft log API, mclo.gs compatible",
    description:
      "Save Minecraft logs from a launcher, mod or server panel with one request.",
  }),
};

function ParamTable({ rows, showNeed = true }: { rows: Param[]; showNeed?: boolean }) {
  return (
    <div className="api-table-wrap scroll-quiet">
      <table className="api-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            {showNeed && <th scope="col">Needed</th>}
            <th scope="col">What it does</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              {showNeed && <td>{row.need}</td>}
              <td>
                {row.text}
                {row.where && (
                  <span className="api-table__where"> Goes in: {row.where}.</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Route({
  method,
  path,
}: {
  method: "GET" | "POST" | "DELETE";
  path: string;
}) {
  return (
    <p className="api-route">
      <span className="api-route__method">{method}</span>
      <code className="api-route__path">{path}</code>
    </p>
  );
}

export default function ApiPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero hero--doc grid-container">
          <div className="hero__head settle">
            <h1 className="hero__title">API</h1>
            <p className="hero__lead">
              Save a log from a launcher, mod or server panel with one request.
              You get a link back.
            </p>
          </div>
        </section>

        <div className="grid-container api-layout doc-wrap">
          <ApiToc items={OUTLINE} />

          <div className="api-main">
            <section id="quick-start" className="api-section">
              <h2>Quick start</h2>
              <p>
                Send the log text to <code>{API_BASE}</code> and you get a link
                back. Sending it as plain text means there&apos;s nothing to
                escape, which suits shell scripts and Java mods.
              </p>
              <CodeTabs label="Upload a log" samples={UPLOAD_SAMPLES} />
              <p>
                A successful upload returns <code>201</code> and the details of
                the saved log:
              </p>
              <CodeTabs
                label="Upload response"
                caption="201 Created"
                samples={[{ id: "created", label: "201 Created", code: CREATED_JSON }]}
              />
              <p>
                Open <code>url</code> to see the log. That&apos;s the link you
                give to a player or paste into a support thread.
              </p>
            </section>

            <section id="basics" className="api-section">
              <h2>Basics</h2>
              <p>
                Everything is on <code>{API_BASE}</code>, separate from the
                website, so a launcher only needs one short host. Logs are still
                read on <code>{SITE_BASE}</code>, and every <code>url</code> in a
                response points there.
              </p>
              <p>
                There are two protocols on the same host. <code>/v2</code> is
                ours, and it&apos;s the one to use for new work.{" "}
                <code>/1</code> copies the mclo.gs API, so tools written for it
                work once you change the host. Both use the same storage: a log
                saved through one opens through the other.
              </p>
              <ul>
                <li>
                  Requests and responses are UTF-8. <code>/v2</code> dates are
                  ISO 8601 in UTC.
                </li>
                <li>
                  You can gzip large uploads with{" "}
                  <code>Content-Encoding: gzip</code>. The size limits apply to
                  the unpacked text.
                </li>
                <li>
                  Every endpoint allows cross-origin requests, so a web page can
                  upload straight from the browser.
                </li>
                <li>
                  There are no accounts and no API keys. Limits are per
                  connection.
                </li>
              </ul>
            </section>

            <section id="limits" className="api-section">
              <h2>Limits</h2>
              <p>
                These are the same limits the website uses, so anything that
                uploads there uploads here.
              </p>
              <dl className="api-limits">
                {LIMITS.map((item) => (
                  <div key={item.label} className="api-limits__row">
                    <dt>{item.label}</dt>
                    <dd>
                      <strong>{item.value}</strong>
                      <span>{item.text}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p>
                Instead of hard coding these numbers, read them from{" "}
                <a href="#get-limits">
                  <code>/v2/limits</code>
                </a>
                .
              </p>
            </section>

            <section id="sources" className="api-section">
              <h2>Identify your app</h2>
              <p>
                Send your app&apos;s name as <code>source</code> with each
                upload. The log page shows it as a small badge, so a player who
                opens a link from your app can see it came from there. Any name
                works, there is nothing to sign up for and no list to be on.
                Every name is shown exactly as you send it, and none is treated
                differently from another.
              </p>
              <ul>
                <li>Up to {MAX_SOURCE_LENGTH} characters.</li>
                <li>
                  Letters and digits from any language, with spaces or{" "}
                  <code>. _ + -</code> between words. Something like{" "}
                  <code>MyLauncher</code> or <code>My Launcher 2.1</code>.
                </li>
                <li>
                  A name that doesn&apos;t fit is ignored, and the log is saved
                  without a badge. It is never an error.
                </li>
              </ul>
              <p>
                You can also send it in an <code>X-Minelog-Client</code> header,
                which helps when you can&apos;t change the body.
              </p>
              <p>
                The source isn&apos;t verified. Anyone can send any name, so
                treat the badge as a hint about where a link came from, not a
                guarantee.
              </p>
            </section>

            <section id="privacy" className="api-section">
              <h2>Private details</h2>
              <p>
                By default, minelog hides IP addresses, user folder names,
                tokens and email addresses before saving. Player names stay,
                because you need them for debugging. The server does this on its
                own copy, so a client that skips it still can&apos;t store
                private details.
              </p>
              <p>
                To turn it off, send <code>hidePrivate: false</code>. The log is
                then saved as sent, <code>privacyApplied</code> is{" "}
                <code>false</code> in the response, and the log page shows a
                warning to everyone who opens it. Leave it on unless you have a
                reason not to.
              </p>
            </section>

            <section id="create" className="api-section">
              <h2>Save a log</h2>
              <Route method="POST" path="/v2/logs" />
              <p>
                Saves one log and returns its details. You can send it two ways:
              </p>
              <ul>
                <li>
                  <strong>Plain text.</strong> Send{" "}
                  <code>Content-Type: text/plain</code> with the log as the body.
                  Options go in the query string.
                </li>
                <li>
                  <strong>JSON.</strong> Send{" "}
                  <code>Content-Type: application/json</code> with an object.
                </li>
              </ul>
              <ParamTable rows={CREATE_PARAMS} />
              <p>
                The response is <code>201</code> with the fields below. Keep the{" "}
                <code>id</code> if you want to read the log again later.
              </p>
              <ParamTable rows={LOG_FIELDS} showNeed={false} />
              <p>
                This can fail with <code>400</code>, <code>413</code>,{" "}
                <code>422</code> or <code>429</code>. See{" "}
                <a href="#errors">Errors</a>.
              </p>
            </section>

            <section id="read" className="api-section">
              <h2>Read a log</h2>
              <Route method="GET" path="/v2/logs/{id}" />
              <p>
                Returns the same fields as an upload. Add{" "}
                <code>?content=true</code> to include the log text in a{" "}
                <code>content</code> field. Without it, the response stays small
                no matter how big the log is.
              </p>
              <p>
                If the id doesn&apos;t exist or the log has expired, you get a{" "}
                <code>404</code>:
              </p>
              <CodeTabs
                label="Not found response"
                caption="404 Not Found"
                samples={[{ id: "nf", label: "404 Not Found", code: NOT_FOUND_JSON }]}
              />
            </section>

            <section id="delete" className="api-section">
              <h2>Delete a log</h2>
              <Route method="DELETE" path="/v2/logs/{id}" />
              <p>
                Whoever saved a log can delete it in the first{" "}
                {DELETE_WINDOW_MINUTES} minutes. Saving returns a{" "}
                <code>deleteToken</code> once. Send it back in an{" "}
                <code>Authorization: Bearer</code> header. We keep only a hash
                of it, so keep the token yourself if you want to offer a delete
                button.
              </p>
              <CodeTabs
                label="Delete request"
                caption="Request"
                samples={DELETE_SAMPLES}
              />
              <p>
                On success you get <code>200</code>:
              </p>
              <CodeTabs
                label="Delete response"
                caption="200 OK"
                samples={[{ id: "deleted", label: "200 OK", code: DELETED_JSON }]}
              />
              <p>
                After that the log&apos;s page and raw text answer{" "}
                <code>404</code>. A wrong token gets <code>403</code>{" "}
                <code>invalid_token</code>, and once the window is over{" "}
                <code>403</code> <code>delete_window_closed</code>. See{" "}
                <a href="#errors">Errors</a>.
              </p>
            </section>

            <section id="raw" className="api-section">
              <h2>Get the raw text</h2>
              <Route method="GET" path="/v2/logs/{id}/raw" />
              <p>
                Returns the log exactly as saved, as{" "}
                <code>text/plain; charset=utf-8</code>. Useful for piping into
                other tools. Errors here are still JSON, so check the status code
                before parsing.
              </p>
            </section>

            <section id="insights" className="api-section">
              <h2>Read what we found</h2>
              <Route method="GET" path="/v2/logs/{id}/insights" />
              <p>
                Returns what minelog read from a saved log: the game version,
                loader, Java, launcher and mods, and any known problems with
                things to try. It works for server logs, client logs, crash
                reports and Java crash logs. For any other file the lists are
                empty.
              </p>
              <CodeTabs label="Read the findings" samples={INSIGHTS_SAMPLES} />
              <p>
                Here is the answer for a log with a startup line, the Paper
                banner and an <code>OutOfMemoryError</code>:
              </p>
              <CodeTabs
                label="Findings response"
                caption="200 OK"
                samples={[{ id: "insights", label: "200 OK", code: INSIGHTS_JSON }]}
              />
              <ParamTable rows={INSIGHT_FIELDS} showNeed={false} />

              <h3>Facts</h3>
              <p>
                <code>gameVersion</code>, <code>loader</code>, <code>java</code>{" "}
                and <code>launcher</code> are each <code>null</code> when the log
                doesn&apos;t say, or an object with these fields:
              </p>
              <ParamTable rows={FACT_FIELDS} showNeed={false} />
              <p>
                Everything is read from lines the game or server wrote itself.
                Player chat and console commands are skipped, so a line someone
                types in chat can&apos;t show up as a finding. A log that was
                edited by hand can still fool it, so treat the answer as what the
                log says, not as proof.
              </p>

              <h3>Problems</h3>
              <ParamTable rows={PROBLEM_FIELDS} showNeed={false} />
              <p>
                The list of known problems is short, and it grows. An empty list
                doesn&apos;t mean the log is healthy. It means none of the known
                ones showed up. These are the ids today, and an id never changes
                its meaning:
              </p>
              <div className="api-table-wrap scroll-quiet">
                <table className="api-table">
                  <thead>
                    <tr>
                      <th scope="col">Id</th>
                      <th scope="col">What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROBLEM_DOCS.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <code>{row.id}</code>
                        </td>
                        <td>{row.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Answers are cached for a minute, and reading findings has its own
                limit, listed under <a href="#limits">Limits</a>. If the id
                doesn&apos;t exist or the log has expired you get the same{" "}
                <code>404</code> as when reading a log.
              </p>
            </section>

            <section id="analyse" className="api-section">
              <h2>Analyse without saving</h2>
              <Route method="POST" path="/v2/analyse" />
              <p>
                Reads text the same way and returns the same answer, without
                saving anything. Use it when a tool wants the findings and has no
                need for a link. Please don&apos;t save a log just to read its
                findings, that stores data nobody needs.
              </p>
              <p>
                You can send it two ways, like saving a log: plain text with the
                log as the body, or JSON with an object.
              </p>
              <ParamTable rows={ANALYSE_PARAMS} />
              <CodeTabs label="Analyse a log" samples={ANALYSE_SAMPLES} />
              <p>
                The answer is <code>200</code> with the fields under{" "}
                <a href="#insights">Read what we found</a>. The text can be up to
                the analysis size limit in <a href="#limits">Limits</a>, and a
                text over it is refused with <code>413</code>, not cut. Each
                connection can run {ANALYSES_PER_MINUTE} a minute. Errors are the
                ones under <a href="#errors">Errors</a>.
              </p>
            </section>

            <section id="get-limits" className="api-section">
              <h2>Read the limits</h2>
              <Route method="GET" path="/v2/limits" />
              <p>
                Returns the current limits, so an app can check a file before
                trying to upload it:
              </p>
              <CodeTabs
                label="Limits response"
                caption="200 OK"
                samples={[{ id: "limits", label: "200 OK", code: LIMITS_JSON }]}
              />
            </section>

            <section id="errors" className="api-section">
              <h2>Errors</h2>
              <p>
                Every <code>/v2</code> error has the same shape: an{" "}
                <code>error</code> object with a <code>code</code> you can branch
                on and a <code>message</code> written for people. Show the
                message to users as is, but don&apos;t match on its wording,
                because it may change.
              </p>
              <CodeTabs
                label="Error response"
                caption="413 Payload Too Large"
                samples={[{ id: "err", label: "413 Payload Too Large", code: ERROR_JSON }]}
              />
              <div className="api-table-wrap scroll-quiet">
                <table className="api-table">
                  <thead>
                    <tr>
                      <th scope="col">Code</th>
                      <th scope="col">Status</th>
                      <th scope="col">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ERRORS.map((row) => (
                      <tr key={row.code}>
                        <td>
                          <code>{row.code}</code>
                        </td>
                        <td>{row.status}</td>
                        <td>{row.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="rate-limits" className="api-section">
              <h2>Rate limits</h2>
              <p>
                Each connection can save {UPLOADS_PER_MINUTE} logs a minute and{" "}
                {UPLOADS_PER_DAY} a day, and analyse {ANALYSES_PER_MINUTE} a
                minute. Reading the findings of a saved
                log and deleting have limits too, listed under{" "}
                <a href="#limits">Limits</a>. After that you get a{" "}
                <code>429</code> with a <code>Retry-After</code> header, in
                seconds. We count using a keyed hash of the IP address and never
                store the address itself. Reading a log, its text or its details
                isn&apos;t counted. Everything except saving is counted by each
                of our servers on its own, so those numbers are fair-use limits,
                not exact ones.
              </p>
              <p>
                An app running on a player&apos;s own machine is fine, since
                each player has their own connection. If your service will upload
                for many people from one server, contact us before you launch so
                we can plan for it.
              </p>
            </section>

            <section id="mclogs" className="api-section">
              <h2>mclo.gs compatibility</h2>
              <p>
                If your tool already uploads to mclo.gs, you don&apos;t need to
                rewrite it. Change <code>api.mclo.gs</code> to{" "}
                <code>api.minelog.org</code> and keep the <code>/1</code> paths:
              </p>
              <CodeTabs label="Switching hosts" samples={SWITCH_SAMPLES} />
              <p>
                The response has the shape those tools expect, with a{" "}
                <code>success</code> flag and times in unix seconds:
              </p>
              <CodeTabs
                label="Compatible upload response"
                caption="200 OK"
                samples={[{ id: "compat", label: "200 OK", code: COMPAT_JSON }]}
              />
              <p>
                The findings use mclo.gs&apos;s shape too. This is{" "}
                <code>GET /1/insights/{"{id}"}</code> and{" "}
                <code>POST /1/analyse</code>, and the same lists come back under{" "}
                <code>content.insights</code> when you add{" "}
                <code>?insights=1</code> to <code>GET /1/log/{"{id}"}</code>:
              </p>
              <CodeTabs
                label="Compatible insights response"
                caption="200 OK"
                samples={[{ id: "cinsights", label: "200 OK", code: COMPAT_INSIGHTS_JSON }]}
              />
              <p>
                Errors use the same flat shape rather than the{" "}
                <code>/v2</code> one:
              </p>
              <CodeTabs
                label="Compatible error response"
                caption="413 Payload Too Large"
                samples={[{ id: "cerr", label: "413 Payload Too Large", code: COMPAT_ERROR_JSON }]}
              />
              <p>
                A few things can&apos;t match. This is every mclo.gs
                endpoint and where it stands:
              </p>
              <div className="api-table-wrap scroll-quiet">
                <table className="api-table">
                  <thead>
                    <tr>
                      <th scope="col">Endpoint</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPAT.map((row) => (
                      <tr key={`${row.method} ${row.path}`}>
                        <td className="api-table__nowrap">
                          <span className="api-route__method api-route__method--small">
                            {row.method}
                          </span>{" "}
                          <code>{row.path}</code>
                        </td>
                        <td>
                          <span className="api-support" data-support={row.support}>
                            {row.support}
                          </span>
                        </td>
                        <td>{row.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                <code>/1/limits</code> returns our numbers in the units mclo.gs
                uses:
              </p>
              <CodeTabs
                label="Compatible limits response"
                caption="200 OK"
                samples={[{ id: "climits", label: "200 OK", code: COMPAT_LIMITS_JSON }]}
              />
              <p>
                Our limits differ from theirs. A tool that reads{" "}
                <code>/1/limits</code> before uploading picks ours up by itself.
                One that hard codes the mclo.gs numbers stays inside them, which
                always fits.
              </p>
            </section>

            <section id="stability" className="api-section">
              <h2>Stability</h2>
              <p>
                What you can count on for <code>/v2</code>:
              </p>
              <ul>
                <li>
                  We can add new fields to a response at any time. If your
                  client ignores fields it doesn&apos;t know, nothing breaks.
                </li>
                <li>
                  Changes that would break a working client go into a new
                  version, <code>/v3</code>. <code>/v2</code> keeps working
                  alongside it.
                </li>
                <li>
                  The <code>/1</code> paths follow mclo.gs. If they add something
                  we&apos;ll look at it, but we can&apos;t promise the same day.
                </li>
                <li>
                  Logs are deleted after {RETENTION_DAYS} days, whichever
                  protocol saved them.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
      <Analytics />
    </>
  );
}

