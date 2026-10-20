import type { Metadata } from "next";
import Link from "next/link";
import { LogsBrowser } from "@/components/dashboard/logs-browser";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/panel";
import { ownedLogs } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Logs" };

const LIMIT = 200;

export default async function LogsPage() {
  const { user } = await requireSession();
  const logs = await ownedLogs(user.id, LIMIT);

  return (
    <>
      <PageHeader
        title="Logs"
        description="Logs you saved while signed in. Delete one whenever you like, or let it expire."
        actions={
          <Link href="/" className="button">
            Share a log
          </Link>
        }
      />

      {logs.length > 0 ? (
        <LogsBrowser logs={logs} />
      ) : (
        <Panel title="Your logs">
          <EmptyState title="No logs yet">
            Logs you save while you&apos;re signed in show up here. Ones saved while signed out
            can&apos;t be added later.
          </EmptyState>
        </Panel>
      )}
    </>
  );
}
