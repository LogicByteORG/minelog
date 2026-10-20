import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LogPageView } from "@/components/log-page-view";
import { LOGIN_PATH } from "@/lib/auth-providers";
import { isValidId } from "@/lib/ids";
import type { LogPage } from "@/lib/log-cache";
import { buildLogPage } from "@/lib/log-page";
import { findPrivateLog } from "@/lib/logs";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private log",
  robots: { index: false, follow: false },
};

export default async function PrivateLogPage({ params }: PageProps<"/p/[id]">) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);

  const stored = isValidId(id) ? await findPrivateLog(id, session.user.id) : null;
  if (!stored) notFound();

  const data = buildLogPage(stored);
  const log: LogPage = {
    ...data,
    createdAt: new Date(data.createdAt),
    expiresAt: new Date(data.expiresAt),
  };

  return <LogPageView log={log} isPrivate />;
}
