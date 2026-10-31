import type { VercelChallenge } from "./domain-settings";

const API = "https://api.vercel.com";

export type DomainReport = {
  verified: boolean;
  misconfigured: boolean;
  target: string | null;
  challenges: VercelChallenge[];
};

export type DomainFailure = { ok: false; error: string };

type Result<T> = ({ ok: true } & T) | DomainFailure;

function settings() {
  const token = process.env.VERCEL_API_TOKEN;
  const project = process.env.VERCEL_PROJECT_ID;
  if (!token || !project) return null;
  return { token, project, team: process.env.VERCEL_TEAM_ID };
}

export function domainsConfigured(): boolean {
  return settings() !== null;
}

const UNAVAILABLE: DomainFailure = {
  ok: false,
  error: "Custom domains aren't switched on for this deployment yet.",
};

const BUSY: DomainFailure = {
  ok: false,
  error: "Couldn't reach the domain service. Try again in a moment.",
};

async function call(path: string, method: "GET" | "POST" | "DELETE", body?: unknown) {
  const config = settings();
  if (!config) return null;
  const url = new URL(`${API}${path.replace("{project}", encodeURIComponent(config.project))}`);
  if (config.team) url.searchParams.set("teamId", config.team);
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${config.token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: response.status, data };
  } catch {
    return undefined;
  }
}

function challengesOf(data: Record<string, unknown>): VercelChallenge[] {
  const list = Array.isArray(data.verification) ? data.verification : [];
  return list.filter(
    (item): item is VercelChallenge =>
      Boolean(item) &&
      typeof item.type === "string" &&
      typeof item.domain === "string" &&
      typeof item.value === "string",
  );
}

function errorCode(data: Record<string, unknown>): string {
  const error = data.error as { code?: unknown } | undefined;
  return typeof error?.code === "string" ? error.code : "";
}

async function configOf(host: string): Promise<{ misconfigured: boolean; target: string | null } | undefined> {
  const reply = await call(`/v6/domains/${encodeURIComponent(host)}/config`, "GET");
  if (!reply || reply.status !== 200) return undefined;
  const recommended = Array.isArray(reply.data.recommendedCNAME) ? reply.data.recommendedCNAME : [];
  const best = recommended.find((item: { rank?: number }) => item?.rank === 1) ?? recommended[0];
  return {
    misconfigured: reply.data.misconfigured !== false,
    target: typeof best?.value === "string" ? best.value.replace(/\.$/, "") : null,
  };
}

export async function addDomain(host: string): Promise<Result<{ report: DomainReport }>> {
  const reply = await call("/v10/projects/{project}/domains", "POST", { name: host });
  if (reply === null) return UNAVAILABLE;
  if (!reply) return BUSY;
  if (reply.status === 409 || errorCode(reply.data) === "domain_already_in_use") {
    return { ok: false, error: "That domain is already connected to another project. Remove it there first." };
  }
  if (reply.status >= 400 && errorCode(reply.data) !== "domain_already_exists") {
    return { ok: false, error: "The domain service didn't accept that domain. Check it and try again." };
  }
  return readDomain(host);
}

export async function readDomain(host: string): Promise<Result<{ report: DomainReport }>> {
  const project = await call(`/v9/projects/{project}/domains/${encodeURIComponent(host)}`, "GET");
  if (project === null) return UNAVAILABLE;
  if (!project || project.status !== 200) return project?.status === 404 ? { ok: false, error: "That domain isn't set up anymore." } : BUSY;

  let verified = project.data.verified === true;
  let challenges = challengesOf(project.data);
  if (!verified) {
    const attempt = await call(`/v9/projects/{project}/domains/${encodeURIComponent(host)}/verify`, "POST");
    if (attempt?.status === 200 && attempt.data.verified === true) {
      verified = true;
      challenges = [];
    } else if (attempt && challenges.length === 0) {
      challenges = challengesOf(attempt.data);
    }
  }

  const config = await configOf(host);
  if (!config) return BUSY;
  return { ok: true, report: { verified, misconfigured: config.misconfigured, target: config.target, challenges } };
}

export async function removeDomain(host: string): Promise<boolean> {
  const reply = await call(`/v9/projects/{project}/domains/${encodeURIComponent(host)}`, "DELETE");
  return reply === null || Boolean(reply && (reply.status < 300 || reply.status === 404));
}
