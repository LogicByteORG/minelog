import type { BrandSlug } from "./brand";

export type AuthProviderId = "github" | "discord";

export type AuthProvider = {
  id: AuthProviderId;
  label: string;
  brand: BrandSlug;
};

export const AUTH_PROVIDERS: AuthProvider[] = [
  { id: "github", label: "GitHub", brand: "github" },
  { id: "discord", label: "Discord", brand: "discord" },
];

export const LOGIN_PATH = "/login";

export const DASHBOARD_PATH = "/dash";

export const ACCOUNT_PATH = `${DASHBOARD_PATH}/account`;

export const AFTER_LOGIN_PATH = DASHBOARD_PATH;

export function linkErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "access_denied") {
    return "You cancelled the connection. Nothing was changed.";
  }
  if (code === "account_already_linked_to_different_user") {
    return "That account is already connected to a different minelog profile. Disconnect it there first, then try again.";
  }
  if (code === "unable_to_link_account") {
    return "We couldn't connect that account. Its email isn't verified with the provider yet.";
  }
  return "That account couldn't be connected. Give it another try in a moment.";
}

export function authErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "access_denied") {
    return "You cancelled the sign-in. Nothing was changed, so you can try again whenever you like.";
  }
  if (code === "email_not_found") {
    return "That account has no email we can read. Add a public or verified email to it and try again.";
  }
  return "Sign-in didn't go through. Give it another try in a moment.";
}
