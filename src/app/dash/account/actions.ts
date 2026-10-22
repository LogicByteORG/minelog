"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { ActionOutcome } from "@/app/dash/actions";
import { auth } from "@/lib/auth";
import { ACCOUNT_PATH } from "@/lib/auth-providers";
import { REVERIFY_MESSAGE } from "@/lib/reverify";
import { requireSession } from "@/lib/session";
import { isReverifyError } from "@/lib/verification";

export async function signOutDevice(id: string): Promise<ActionOutcome> {
  const { session } = await requireSession();

  if (typeof id !== "string" || id === session.id) {
    return { ok: false, error: "That's the device you're using. Use Log out for this one." };
  }

  const requestHeaders = await headers();

  try {
    const sessions = await auth.api.listSessions({ headers: requestHeaders });
    const target = sessions.find((item) => item.id === id);
    if (!target) return { ok: false, error: "That device is already signed out." };
    await auth.api.revokeSession({ headers: requestHeaders, body: { token: target.token } });
  } catch (error) {
    console.error("Signing out a device failed:", error);
    return { ok: false, error: "Couldn't sign that device out. Try again in a moment." };
  }

  revalidatePath(ACCOUNT_PATH);
  return { ok: true };
}

export async function signOutOtherDevices(): Promise<ActionOutcome> {
  await requireSession();

  try {
    await auth.api.revokeOtherSessions({ headers: await headers() });
  } catch (error) {
    if (isReverifyError(error)) return { ok: false, error: REVERIFY_MESSAGE, reverify: true };
    console.error("Signing out other devices failed:", error);
    return { ok: false, error: "Couldn't sign the other devices out. Try again in a moment." };
  }

  revalidatePath(ACCOUNT_PATH);
  return { ok: true };
}
