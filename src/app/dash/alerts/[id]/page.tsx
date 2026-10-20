import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteAlert } from "@/components/dashboard/delete-alert";
import { Detail, PageHeader, Panel } from "@/components/dashboard/panel";
import { LogView } from "@/components/log-view";
import { getAlert } from "@/lib/alerts";
import { ID_PATTERN } from "@/lib/label";
import { requireSession } from "@/lib/session";
import { formatDate, formatUtc } from "@/lib/time";

export const metadata: Metadata = { title: "Alert" };

const LINES = 2000;

export default async function AlertPage({ params }: PageProps<"/dash/alerts/[id]">) {
  const { id } = await params;
  const { user } = await requireSession();
  const alert = ID_PATTERN.test(id) ? await getAlert(user.id, id) : null;
  if (!alert) notFound();

  return (
    <>
      <PageHeader
        title="Error details"
        description={alert.summary}
        actions={
          <div className="dash-page__counter">
            <Link href="/dash/alerts" className="button hollow">
              All alerts
            </Link>
            <DeleteAlert id={alert.id} />
          </div>
        }
      />

      <Panel title="Summary">
        <dl className="dash-details">
          <Detail label="Server">{alert.serverName}</Detail>
          <Detail label="Seen">
            {alert.occurrences.toLocaleString("en")} {alert.occurrences === 1 ? "time" : "times"}
          </Detail>
          <Detail label="First seen">{formatUtc(alert.firstSeenAt)}</Detail>
          <Detail label="Last seen">{formatUtc(alert.lastSeenAt)}</Detail>
          <Detail label="Deleted on">{formatDate(alert.expiresAt)}</Detail>
        </dl>
      </Panel>

      <Panel title="Log lines" description="From the most recent time it happened." flush>
        <div className="dash-log">
          <LogView text={alert.content} limit={LINES} label="Log lines around the error" />
        </div>
      </Panel>
    </>
  );
}
