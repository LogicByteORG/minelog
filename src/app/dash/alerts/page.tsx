import type { Metadata } from "next";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/panel";
import { listAlerts } from "@/lib/alerts";
import { ALERTS_PER_ACCOUNT, ALERT_RETENTION_DAYS } from "@/lib/config";
import { groupAlerts } from "@/lib/dashboard-views";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const { user } = await requireSession();
  const groups = groupAlerts(await listAlerts(user.id));

  return (
    <>
      <PageHeader
        title="Alerts"
        description={`Errors your servers found in their logs. The same error counts up instead of piling up, only you can read them, and each one is deleted after ${ALERT_RETENTION_DAYS} days. We keep the latest ${ALERTS_PER_ACCOUNT}.`}
      />

      {groups.length === 0 ? (
        <Panel title="No alerts">
          <EmptyState title="Nothing to worry about">
            When one of your connected servers finds an error, it shows up here, grouped by
            server.
          </EmptyState>
        </Panel>
      ) : (
        <AlertsList groups={groups} />
      )}
    </>
  );
}
