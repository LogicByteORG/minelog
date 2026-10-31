export const DOMAIN_MAX = 253;

export const DNS_TARGET = "cname.vercel-dns.com";

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TLD = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

const OWN_SUFFIXES = ["minelog.org", "logicbyte.org", "vercel.app", "vercel.dev", "vercel.com", "now.sh", "localhost"];

export type DomainCheck = { ok: true; host: string } | { ok: false; error: string };

export type DnsRecord = { type: "CNAME" | "TXT"; name: string; value: string };

export type DomainState = "pending" | "active";

export function checkDomain(raw: unknown): DomainCheck {
  let host = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  host = host.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/[/?#].*$/, "").replace(/\.$/, "");

  if (host === "") return { ok: false, error: "Type the domain you want to use, like logs.yoursite.com." };
  if (host.length > DOMAIN_MAX || IPV4.test(host) || host.includes(":") || host.includes("@")) {
    return { ok: false, error: "That doesn't look like a domain name. Try something like logs.yoursite.com." };
  }

  const labels = host.split(".");
  if (!labels.every((label) => LABEL.test(label)) || !TLD.test(labels[labels.length - 1])) {
    return { ok: false, error: "That doesn't look like a domain name. Try something like logs.yoursite.com." };
  }
  if (labels.length < 3) {
    return {
      ok: false,
      error: "Use a subdomain like logs.yoursite.com. Root domains can't point at minelog.",
    };
  }
  if (OWN_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
    return { ok: false, error: "That domain belongs to minelog or its host. Use one of your own." };
  }
  return { ok: true, host };
}

export type VercelChallenge = { type: string; domain: string; value: string };

export function dnsRecords(
  host: string,
  target: string | null,
  challenges: readonly VercelChallenge[] = [],
): DnsRecord[] {
  const records: DnsRecord[] = [{ type: "CNAME", name: host, value: target ?? DNS_TARGET }];
  for (const challenge of challenges) {
    if (challenge.type.toUpperCase() === "TXT") {
      records.push({ type: "TXT", name: challenge.domain, value: challenge.value });
    }
  }
  return records;
}

export function domainUrl(host: string, id?: string): string {
  return id ? `https://${host}/${id}` : `https://${host}`;
}

export function isOwnHost(host: string, ownHosts: readonly string[]): boolean {
  const name = host.split(":")[0].toLowerCase();
  return (
    ownHosts.includes(name) ||
    name === "localhost" ||
    name.endsWith(".localhost") ||
    name.endsWith(".vercel.app") ||
    OWN_SUFFIXES.some((suffix) => name === suffix || name.endsWith(`.${suffix}`))
  );
}
