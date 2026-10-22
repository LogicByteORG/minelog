"use server";

import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ACCOUNT_PATH, AUTH_PROVIDERS } from "@/lib/auth-providers";
import { isOwnedLog, removeOwnedLog } from "@/lib/dashboard";
import { isValidId } from "@/lib/ids";
import { forgetLog } from "@/lib/log-cache";
import { REVERIFY_MESSAGE } from "@/lib/reverify";
import { getSession, requireSession } from "@/lib/session";
import { isProviderId } from "@/lib/primary-provider";
import { isReverifyError, isVerified, setPrimaryProvider } from "@/lib/verification";

export type ActionOutcome = { ok: true } | { ok: false; error: string; reverify?: boolean };

const NEEDS_VERIFY: ActionOutcome = { ok: false, error: REVERIFY_MESSAGE, reverify: true };

export async function ownsLog(id: string): Promise<boolean> {
  if (!isValidId(id)) return false;
  const session = await getSession();
  if (!session) return false;
  return isOwnedLog(id, session.user.id);
}

export async function deleteOwnedLog(id: string): Promise<ActionOutcome> {
  const { user } = await requireSession();

  if (!isValidId(id)) {
    return { ok: false, error: "That log doesn't exist anymore." };
  }

  try {
    const removed = await removeOwnedLog(id, user.id);
    if (!removed) return { ok: false, error: "That log doesn't exist anymore." };
    await forgetLog(id);
  } catch (error) {
    console.error("Deleting an owned log failed:", error);
    return { ok: false, error: "Couldn't delete the log. Try again in a moment." };
  }

  revalidatePath("/dash", "layout");
  return { ok: true };
}

export async function disconnectAccount(providerId: string): Promise<ActionOutcome> {
  await requireSession();

  if (!AUTH_PROVIDERS.some((provider) => provider.id === providerId)) {
    return { ok: false, error: "That account isn't connected." };
  }

  const requestHeaders = await headers();

  try {
    const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
    const target = accounts.find((account) => account.providerId === providerId);
    if (!target) return { ok: false, error: "That account isn't connected." };
    if (accounts.length < 2) {
      return {
        ok: false,
        error: "You need at least one way to log in, so the last account can't be disconnected.",
      };
    }
    await auth.api.unlinkAccount({ headers: requestHeaders, body: { accountId: target.id } });
  } catch (error) {
    if (isReverifyError(error)) return NEEDS_VERIFY;
    if (error instanceof APIError && error.body?.code === "SESSION_NOT_FRESH") {
      return {
        ok: false,
        error: "For your safety, log out and log back in before disconnecting an account.",
      };
    }
    console.error("Disconnecting an account failed:", error);
    return { ok: false, error: "Couldn't disconnect the account. Try again in a moment." };
  }

  revalidatePath(ACCOUNT_PATH);
  return { ok: true };
}

export async function makePrimaryAccount(providerId: string): Promise<ActionOutcome> {
  const { user } = await requireSession();

  if (!isProviderId(providerId)) return { ok: false, error: "That account isn’t connected." };

  try {
    const accounts = await auth.api.listUserAccounts({ headers: await headers() });
    if (!accounts.some((account) => account.providerId === providerId)) {
      return { ok: false, error: "That account isn’t connected." };
    }
    if (!(await isVerified(user.id))) return NEEDS_VERIFY;
    await setPrimaryProvider(user.id, providerId);
  } catch (error) {
    console.error("Changing the primary account failed:", error);
    return { ok: false, error: "Couldn’t change the primary account. Try again in a moment." };
  }

  revalidatePath(ACCOUNT_PATH);
  return { ok: true };
}
