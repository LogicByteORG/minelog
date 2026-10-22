import { AUTH_PROVIDERS, type AuthProviderId } from "./auth-providers";

export type LinkedProvider = { providerId: string; createdAt: Date };

export function isProviderId(value: unknown): value is AuthProviderId {
  return AUTH_PROVIDERS.some((provider) => provider.id === value);
}

export function choosePrimary(
  stored: string | null,
  linked: LinkedProvider[],
): AuthProviderId | null {
  const known = linked
    .filter((item): item is LinkedProvider & { providerId: AuthProviderId } =>
      isProviderId(item.providerId),
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (isProviderId(stored) && known.some((item) => item.providerId === stored)) return stored;
  return known[0]?.providerId ?? null;
}
