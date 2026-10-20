import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

const blocked = new net.BlockList();

const BLOCKED_V4: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const BLOCKED_V6: [string, number][] = [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
];

for (const [address, prefix] of BLOCKED_V4) blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of BLOCKED_V6) blocked.addSubnet(address, prefix, "ipv6");

export function isPublicAddress(address: string): boolean {
  const family = net.isIPv4(address) ? "ipv4" : net.isIPv6(address) ? "ipv6" : null;
  if (!family) return false;
  return !blocked.check(address, family);
}

type LookupResult = string | dns.LookupAddress[];

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: LookupResult,
  family?: number,
) => void;

function guardedLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: LookupCallback,
): void {
  dns.lookup(hostname, options, (error, address, family) => {
    if (error) {
      callback(error, "", 0);
      return;
    }
    const found: LookupResult = address as LookupResult;
    const list = Array.isArray(found) ? found.map((entry) => entry.address) : [found];
    if (list.length === 0 || list.some((entry) => !isPublicAddress(entry))) {
      callback(Object.assign(new Error("blocked_address"), { code: "EBLOCKED" }), "", 0);
      return;
    }
    callback(null, found, family);
  });
}

export type PostOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  guard?: boolean;
};

export type PostResult = { ok: true; status: number } | { ok: false; error: string };

export function postJson(rawUrl: string, body: unknown, options: PostOptions = {}): Promise<PostResult> {
  const { headers = {}, timeoutMs = 5000, guard = true } = options;

  return new Promise((resolve) => {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      resolve({ ok: false, error: "Invalid URL" });
      return;
    }
    if (guard && url.protocol !== "https:") {
      resolve({ ok: false, error: "Only https URLs are allowed" });
      return;
    }

    const payload = Buffer.from(JSON.stringify(body));
    const client = url.protocol === "http:" ? http : https;

    const request = client.request(
      {
        method: "POST",
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        headers: {
          "content-type": "application/json",
          "content-length": String(payload.length),
          "user-agent": "minelog-webhooks/1",
          ...headers,
        },
        timeout: timeoutMs,
        ...(guard ? { lookup: guardedLookup as never } : {}),
      },
      (response) => {
        response.resume();
        resolve({ ok: true, status: response.statusCode ?? 0 });
      },
    );

    request.on("timeout", () => request.destroy(new Error("Timed out")));
    request.on("error", (error: NodeJS.ErrnoException) => {
      resolve({
        ok: false,
        error: error.code === "EBLOCKED" ? "Address is not allowed" : error.message || "Request failed",
      });
    });
    request.end(payload);
  });
}
