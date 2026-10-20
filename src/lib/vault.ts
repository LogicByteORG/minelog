import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const VERSION = "v1";

function key(): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not set, so stored webhook URLs can't be locked or opened.");
  }
  return Buffer.from(hkdfSync("sha256", secret, "minelog-vault", "webhook-urls", 32));
}

const encode = (data: Buffer) => data.toString("base64url");
const decode = (text: string) => Buffer.from(text, "base64url");

export function seal(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [VERSION, encode(iv), encode(cipher.getAuthTag()), encode(body)].join(".");
}

export function open(sealed: string): string {
  const [version, iv, tag, body] = sealed.split(".");
  if (version !== VERSION || !iv || !tag || !body) {
    throw new Error("Unknown sealed value format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", key(), decode(iv));
  decipher.setAuthTag(decode(tag));
  return Buffer.concat([decipher.update(decode(body)), decipher.final()]).toString("utf8");
}
