import { headers } from "next/headers";
import { auth } from "./auth";
import { timeAgo } from "./time";
import { readableIp } from "./ip-label";
import { deviceLabel, describeAgent, type DeviceKind } from "./user-agent";

export type SessionView = {
  id: string;
  device: string;
  kind: DeviceKind;
  ipAddress: string | null;
  signedInText: string;
  current: boolean;
};

export async function sessionViews(currentId: string, now = new Date()): Promise<SessionView[]> {
  const rows = await auth.api.listSessions({ headers: await headers() });
  const newestFirst = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return newestFirst
    .map((row) => {
      const device = describeAgent(row.userAgent);
      return {
        id: row.id,
        device: deviceLabel(device),
        kind: device.kind,
        ipAddress: readableIp(row.ipAddress),
        signedInText: `Signed in ${timeAgo(new Date(row.createdAt), now)}`,
        current: row.id === currentId,
      };
    })
    .sort((a, b) => Number(b.current) - Number(a.current));
}
