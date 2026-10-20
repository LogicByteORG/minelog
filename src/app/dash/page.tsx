import Link from "next/link";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { LogTable } from "@/components/dashboard/log-table";
import { EmptyState, Figure, Figures, PageHeader, Panel } from "@/components/dashboard/panel";
import { DASHBOARD_PATH } from "@/lib/auth-providers";
import {
  ACTIVITY_DAYS,
  EXPIRING_SOON_DAYS,
  logActivity,
  logSummary,
  ownedLogs,
} from "@/lib/dashboard";
import { requireSession } from "@/lib/session";

const RECENT = 5;

const count = (value: number) => value.toLocaleString("en");

export default async function OverviewPage() {
  const { user } = await requireSession();
  const [summary, activity, recent] = await Promise.all([
    logSummary(user.id),
    logActivity(user.id),
    ownedLogs(user.id, RECENT),
  ]);

  const shareButton = (
    <Link href="/" className="button">
      Share a log
    </Link>
  );

  if (summary.active === 0) {
    return (
      <>
        <PageHeader title="Overview" actions={shareButton} />
        <Panel title="Logs">
          <EmptyState title="No logs yet">
            Logs you save while you&apos;re signed in show up here. Ones saved while signed out
            can&apos;t be added later.
          </EmptyState>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Overview" actions={shareButton} />

      <Figures>
        <Figure label="Active logs" value={count(summary.active)} />
        <Figure label="With errors" value={count(summary.withErrors)} />
        <Figure
          label="Expiring soon"
          value={count(summary.expiringSoon)}
          note={`Within ${EXPIRING_SOON_DAYS} days`}
        />
      </Figures>

      <Panel title="Saved per day" description={`The last ${ACTIVITY_DAYS} days, in UTC.`}>
        <ActivityChart days={activity} />
      </Panel>

      <Panel
        title="Recent logs"
        flush
        action={
          <Link href={`${DASHBOARD_PATH}/logs`} className="dash-panel__link">
            View all
          </Link>
        }
      >
        <LogTable logs={recent} />
      </Panel>
    </>
  );
}
