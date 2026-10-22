import { APIError } from "better-auth/api";
import type { AuthProviderId } from "./auth-providers";
import { REVERIFY_MINUTES } from "./config";
import { db } from "./db";
import { choosePrimary, type LinkedProvider } from "./primary-provider";
import { REVERIFY_CODE } from "./reverify";

export function isReverifyError(error: unknown): boolean {
  return error instanceof APIError && error.body?.code === REVERIFY_CODE;
}

export async function primaryProvider(userId: string): Promise<AuthProviderId | null> {
  const [linked, [stored]] = await Promise.all([
    db()<LinkedProvider[]>`
      select "providerId" as provider_id, "createdAt" as created_at
      from public.account
      where "userId" = ${userId}
    `,
    db()<{ primaryProvider: string | null }[]>`
      select primary_provider from public.account_security where user_id = ${userId}
    `,
  ]);
  return choosePrimary(stored?.primaryProvider ?? null, linked);
}

export async function setPrimaryProvider(userId: string, provider: AuthProviderId): Promise<void> {
  await db()`
    insert into public.account_security (user_id, primary_provider)
    values (${userId}, ${provider})
    on conflict (user_id) do update set primary_provider = excluded.primary_provider
  `;
}

export async function recordVerification(userId: string, provider: AuthProviderId): Promise<void> {
  await db()`
    insert into public.account_security (user_id, verified_provider, verified_at)
    values (${userId}, ${provider}, now())
    on conflict (user_id) do update set
      verified_provider = excluded.verified_provider,
      verified_at = excluded.verified_at
  `;
}

export async function isVerified(userId: string): Promise<boolean> {
  const primary = await primaryProvider(userId);
  if (!primary) return true;
  const rows = await db()<{ one: number }[]>`
    select 1 as one
    from public.account_security
    where user_id = ${userId}
      and verified_provider = ${primary}
      and verified_at > now() - make_interval(mins => ${REVERIFY_MINUTES})
  `;
  return rows.length > 0;
}
