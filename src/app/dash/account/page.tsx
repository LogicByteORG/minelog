import type { Metadata } from "next";
import Image from "next/image";
import { ConnectedAccounts } from "@/components/dashboard/connected-accounts";
import { DeleteAccount } from "@/components/dashboard/delete-account";
import { DisplayNameForm } from "@/components/dashboard/display-name-form";
import { Detail, Notice, PageHeader, Panel } from "@/components/dashboard/panel";
import { SessionsList } from "@/components/dashboard/sessions-list";
import { linkErrorMessage } from "@/lib/auth-providers";
import { AUTH_PROVIDERS } from "@/lib/auth-providers";
import { REVERIFY_MINUTES } from "@/lib/config";
import { linkedAccounts, logSummary } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";
import { sessionViews } from "@/lib/sessions";
import { primaryProvider } from "@/lib/verification";
import { formatDate } from "@/lib/time";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: PageProps<"/dash/account">) {
  const { user, session } = await requireSession();
  const [linked, summary, sessions, primaryId] = await Promise.all([
    linkedAccounts(),
    logSummary(user.id),
    sessionViews(session.id),
    primaryProvider(user.id),
  ]);
  const primary = AUTH_PROVIDERS.find((provider) => provider.id === primaryId) ?? null;
  const { error, verified, verify } = await searchParams;
  const notice =
    verify === "failed"
      ? "We couldn’t confirm it’s you, so nothing was changed. You can try again whenever you like."
      : linkErrorMessage(typeof error === "string" ? error : undefined);

  return (
    <>
      <PageHeader title="Account" />

      {notice && <Notice>{notice}</Notice>}

      {verified === "1" && primary && (
        <Notice tone="ok">
          Confirmed with {primary.label}. Go ahead with what you were doing, it stays unlocked for{" "}
          {REVERIFY_MINUTES} minutes.
        </Notice>
      )}

      <Panel title="Profile" description="Your picture comes from the account you first signed in with.">
        <div className="dash-profile">
          {user.image && (
            <Image
              className="dash-profile__avatar"
              src={user.image}
              width={56}
              height={56}
              alt=""
              unoptimized
              draggable={false}
            />
          )}
          <dl className="dash-details">
            <Detail label="Display name">
              <DisplayNameForm name={user.name} />
            </Detail>
            <Detail label="Email">{user.email}</Detail>
            <Detail label="Member since">{formatDate(new Date(user.createdAt))}</Detail>
          </dl>
        </div>
      </Panel>

      <Panel
        title="Connected accounts"
        description="Connect both to log in either way. At least one has to stay connected."
      >
        <ConnectedAccounts linked={linked} primary={primaryId} />
      </Panel>

      <Panel
        title="Active sessions"
        description="Devices that are signed in to your account. Sign out any you don’t recognize."
      >
        <SessionsList sessions={sessions} primary={primary} />
      </Panel>

      <Panel
        title="Your data"
        description="A JSON file with your profile, logs, servers, webhooks and alerts. Webhook addresses and server keys are left out, they can’t be read back."
      >
        <a href="/dash/account/export" download className="button hollow">
          Download my data
        </a>
      </Panel>

      <Panel title="Delete account" tone="danger">
        <DeleteAccount logCount={summary.active} primary={primary} />
      </Panel>
    </>
  );
}
