import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { LOGIN_PATH } from "./auth-providers";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}
