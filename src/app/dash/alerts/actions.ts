"use server";

import { revalidatePath } from "next/cache";
import { deleteAlert } from "@/lib/alerts";
import { ID_PATTERN } from "@/lib/label";
import { requireSession } from "@/lib/session";

export type AlertOutcome = { ok: true } | { ok: false; error: string };

export async function removeAlert(id: string): Promise<AlertOutcome> {
  const { user } = await requireSession();
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    return { ok: false, error: "That alert doesn't exist anymore." };
  }
  if (!(await deleteAlert(user.id, id))) {
    return { ok: false, error: "That alert doesn't exist anymore." };
  }
  revalidatePath("/dash/alerts");
  return { ok: true };
}
