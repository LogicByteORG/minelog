import type { NSFWJS } from "nsfwjs/core";

export type Verdict = "ok" | "adult" | "unchecked";

type Prediction = { className: string; probability: number };

const EXPLICIT_LIMIT = 0.5;
const SEXY_LIMIT = 0.85;

const MIN_SIDE = 48;
const LOAD_TIMEOUT_MS = 15_000;

export function decide(predictions: Prediction[]): "ok" | "adult" {
  const score = (name: string) =>
    predictions.find((item) => item.className === name)?.probability ?? 0;
  const explicit = score("Porn") + score("Hentai");
  return explicit >= EXPLICIT_LIMIT || score("Sexy") >= SEXY_LIMIT ? "adult" : "ok";
}

export function needsCheck(src: string | undefined): src is string {
  if (!src) return false;
  if (/^data:image\/svg/i.test(src)) return false;
  if (/^data:image\/(png|jpe?g|gif|webp|bmp)[;,]/i.test(src)) return true;
  if (!/^https?:\/\//i.test(src)) return false;
  return !/\.svg(?:[?#]|$)/i.test(src);
}

const PROXY_BASE = "https://wsrv.nl/?url=";
const MAX_PROXY_SOURCE = 2000;

export function proxyUrl(src: string): string | null {
  if (src.length > MAX_PROXY_SOURCE) return null;
  if (/\.svg(?:[?#]|$)/i.test(src)) return null;
  const match = /^(https?):\/\/([^\s/?#]+)([^\s#]*)/i.exec(src.trim());
  if (!match) return null;
  const value = match[1].toLowerCase() === "https" ? `https://${match[2]}${match[3]}` : `${match[2]}${match[3]}`;
  const encoded = value.replace(/\?/g, "%3F").replace(/&/g, "%26");
  return `${PROXY_BASE}${encoded}`;
}

let detector: Promise<NSFWJS> | null = null;

function getDetector(): Promise<NSFWJS> {
  detector ??= (async () => {
    const tf = await import("@tensorflow/tfjs");
    await tf.ready();
    const { load } = await import("nsfwjs/core");
    const { MobileNetV2MidModel } = await import("nsfwjs/models/mobilenet_v2_mid");
    return load("MobileNetV2Mid", { modelDefinitions: [MobileNetV2MidModel] });
  })();
  detector.catch(() => {
    detector = null;
  });
  return detector;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("load"));
    };
    image.src = src;
  });
}

let queue: Promise<unknown> = Promise.resolve();

const seen = new Map<string, Promise<Verdict>>();

async function inspect(src: string): Promise<Verdict> {
  try {
    const image = await loadImage(src);
    if (image.naturalWidth < MIN_SIDE || image.naturalHeight < MIN_SIDE) return "ok";
    const model = await getDetector();
    return decide(await model.classify(image)) === "adult" ? "adult" : "ok";
  } catch {
    return "unchecked";
  }
}

export function checkImage(src: string): Promise<Verdict> {
  let result = seen.get(src);
  if (!result) {
    result = queue.then(() => inspect(src));
    queue = result;
    seen.set(src, result);
  }
  return result;
}

