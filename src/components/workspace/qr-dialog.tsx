"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { DownloadSimple, X } from "@phosphor-icons/react";
import { CopyLink } from "../copy-link";
import { Segmented } from "./segmented";

type Target = "page" | "raw";

const QUIET_ZONE = 2;
const DARK = "#0e1013";
const LIGHT = "#ffffff";
const PNG_MIN_SIZE = 1024;

type Runs = { size: number; runs: [number, number, number][] };

function makeRuns(text: string): Runs {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  const runs: [number, number, number][] = [];

  for (let row = 0; row < modules.size; row += 1) {
    let column = 0;
    while (column < modules.size) {
      if (!modules.get(row, column)) {
        column += 1;
        continue;
      }
      let end = column;
      while (end < modules.size && modules.get(row, end)) end += 1;
      runs.push([row + QUIET_ZONE, column + QUIET_ZONE, end - column]);
      column = end;
    }
  }
  return { size: modules.size + QUIET_ZONE * 2, runs };
}

function toPath({ runs }: Runs): string {
  return runs.map(([row, column, length]) => `M${column} ${row}h${length}v1h-${length}z`).join("");
}

function toSvgText(qr: Runs): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qr.size} ${qr.size}" shape-rendering="crispEdges">` +
    `<rect width="${qr.size}" height="${qr.size}" fill="${LIGHT}"/>` +
    `<path d="${toPath(qr)}" fill="${DARK}"/></svg>`
  );
}

function toPngBlob(qr: Runs): Promise<Blob | null> {
  const scale = Math.ceil(PNG_MIN_SIZE / qr.size);
  const canvas = document.createElement("canvas");
  canvas.width = qr.size * scale;
  canvas.height = qr.size * scale;

  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);

  context.fillStyle = LIGHT;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = DARK;
  for (const [row, column, length] of qr.runs) {
    context.fillRect(column * scale, row * scale, length * scale, scale);
  }
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type QrDialogProps = {
  open: boolean;
  onClose: () => void;
  logId: string;
  rawUrl: string;
};

export function QrDialog({ open, onClose, logId, rawUrl }: QrDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<Target>("page");
  const [problem, setProblem] = useState<string | null>(null);

  const origin = open ? window.location.origin : "";
  const url = target === "raw" ? rawUrl : `${origin}/${logId}`;

  const qr = useMemo(() => {
    if (!open) return null;
    try {
      return makeRuns(url);
    } catch {
      return null;
    }
  }, [open, url]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function handleClose() {
    onClose();
  }

  async function downloadPng() {
    if (!qr) return;
    const blob = await toPngBlob(qr);
    if (!blob) {
      setProblem("Couldn't make the image. Try the SVG instead.");
      return;
    }
    setProblem(null);
    saveFile(blob, `minelog-${logId}-${target}.png`);
  }

  function downloadSvg() {
    if (!qr) return;
    setProblem(null);
    saveFile(
      new Blob([toSvgText(qr)], { type: "image/svg+xml" }),
      `minelog-${logId}-${target}.svg`,
    );
  }

  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="qr-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="dialog__panel">
        <div className="dialog__head">
          <h2 id="qr-title" className="dialog__title">
            QR code
          </h2>
          <button
            type="button"
            className="dialog__close"
            aria-label="Close"
            data-tip="Close (Esc)"
            onClick={handleClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <Segmented<Target>
          label="What the QR code opens"
          options={[
            { value: "page", label: "Log page" },
            { value: "raw", label: "Raw text" },
          ]}
          value={target}
          onChange={(next) => {
            setTarget(next);
            setProblem(null);
          }}
        />

        <div className="qr" role="img" aria-label={`QR code that opens ${url}`}>
          {qr && (
            <svg
              viewBox={`0 0 ${qr.size} ${qr.size}`}
              shapeRendering="crispEdges"
              aria-hidden="true"
              focusable="false"
            >
              <rect width={qr.size} height={qr.size} fill={LIGHT} />
              <path d={toPath(qr)} fill={DARK} />
            </svg>
          )}
        </div>

        {open && <CopyLink key={url} url={url} block />}

        <div className="dialog__actions">
          <button
            type="button"
            className="button hollow button--sm"
            onClick={() => void downloadPng()}
            disabled={!qr}
          >
            <DownloadSimple aria-hidden="true" />
            Download PNG
          </button>
          <button
            type="button"
            className="button hollow button--sm"
            onClick={downloadSvg}
            disabled={!qr}
          >
            <DownloadSimple aria-hidden="true" />
            Download SVG
          </button>
        </div>

        {problem && (
          <p className="dialog__problem" role="alert">
            {problem}
          </p>
        )}
      </div>
    </dialog>
  );
}

