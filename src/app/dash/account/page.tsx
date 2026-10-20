import type { Metadata } from "next";
import Image from "next/image";
import { ConnectedAccounts } from "@/components/dashboard/connected-accounts";
import { DeleteAccount } from "@/components/dashboard/delete-account";
import { DisplayNameForm } from "@/components/dashboard/display-name-form";
import { Detail, Notice, PageHeader, Panel } from "@/components/dashboard/panel";
import { linkErrorMessage } from "@/lib/auth-providers";
import { linkedAccounts, logSummary } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";
import { formatDate } from "@/lib/time";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: PageProps<"/dash/account">) {
  const { user } = await requireSession();
  const [linked, summary] = await Promise.all([linkedAccounts(), logSummary(user.id)]);
  const { error } = await searchParams;
  const notice = linkErrorMessage(typeof error === "string" ? error : undefined);

  return (
    <>
      <PageHeader title="Account" />

      {notice && <Notice>{notice}</Notice>}

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
        <ConnectedAccounts linked={linked} />
      </Panel>

      <Panel title="Delete account" tone="danger">
        <DeleteAccount logCount={summary.active} />
      </Panel>
    </>
  );
}
