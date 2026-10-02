import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "minelog: share Minecraft logs and crash reports with one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0e1013";
const INK = "#e7eaee";
const MUTED = "#8e97a4";
const LINE = "#272c33";

export default async function Image() {
  const icon = await readFile(join(process.cwd(), "public", "brand", "minelog-white.svg"));
  const mark = `data:image/svg+xml;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: BG,
          color: INK,
          border: `2px solid ${LINE}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={70} height={90} alt="" />
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>
            minelog
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Share a Minecraft log in one link.
          </div>
          <div style={{ fontSize: 34, color: MUTED, maxWidth: 900 }}>
            Server logs, client logs and crash reports. Private details are
            hidden before upload.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

