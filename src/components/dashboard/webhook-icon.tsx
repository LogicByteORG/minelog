import { MicrosoftTeamsLogo, SlackLogo, WebhooksLogo } from "@phosphor-icons/react/dist/ssr";
import type { WebhookKind } from "@/lib/webhook-url";
import { BrandIcon } from "../brand-icon";

export function WebhookIcon({ kind, size = 20 }: { kind: WebhookKind; size?: number }) {
  if (kind === "discord") return <BrandIcon slug="discord" size={size} />;
  if (kind === "slack") return <SlackLogo size={size} aria-hidden="true" />;
  if (kind === "teams") return <MicrosoftTeamsLogo size={size} aria-hidden="true" />;
  if (kind === "googlechat") return <BrandIcon slug="googlechat" size={size} />;
  if (kind === "telegram") return <BrandIcon slug="telegram" size={size} />;
  if (kind === "guilded") return <BrandIcon slug="guilded" size={size} />;
  if (kind === "mattermost") return <BrandIcon slug="mattermost" size={size} />;
  return <WebhooksLogo size={size} aria-hidden="true" />;
}
