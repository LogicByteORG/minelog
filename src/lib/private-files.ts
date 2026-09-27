const ENV_NAME = /^(?:\.env(?:[.\-_].*|rc)?|.+\.env)$/i;

export function isPrivateFileName(filename: string): boolean {
  const base = filename.split(/[\/]/).pop() ?? "";
  return ENV_NAME.test(base);
}

const ASSIGNMENT = /^(?:export\s+)?([A-Z][A-Z0-9_]{1,63})\s*=\s*(.*)$/;
const SECRET_KEY =
  /SECRET|TOKEN|PASSWORD|PASSWD|PASSPHRASE|PRIVATE|CREDENTIAL|API_?KEY|ACCESS_?KEY|AUTH|DATABASE_URL|CONNECTION_STRING|DSN|SALT|(?:^|_)PASS(?:_|$)|_KEY$|^KEY$/;
const PLACEHOLDER =
  /^(?:|changeme|change[-_ ]me|your[-_ ].*|<.*>|x{3,}|\*+|todo|null|none|false|true|0)$/i;
const KNOWN_SECRET_VALUE =
  /^(?:sk[-_](?:live|test|proj|ant)[-_A-Za-z0-9]{8,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\..*|(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^\s:@]+:[^\s@]+@.*)$/;
const MAX_LINES_READ = 500;

function unquote(value: string): string {
  const trimmed = value.trim();
  const quoted = /^(["'])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
}

export function looksLikeEnvFile(text: string): boolean {
  let considered = 0;
  let assignments = 0;
  let secrets = 0;

  for (const raw of text.split(/\r?\n/, MAX_LINES_READ)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    considered += 1;
    const match = ASSIGNMENT.exec(line);
    if (!match) continue;
    assignments += 1;
    const value = unquote(match[2].replace(/\s+#\s.*$/, ""));
    if (PLACEHOLDER.test(value)) continue;
    if (SECRET_KEY.test(match[1]) || KNOWN_SECRET_VALUE.test(value)) secrets += 1;
  }

  return assignments >= 3 && secrets >= 1 && assignments / considered >= 0.8;
}

export function privateContentMessage(): string {
  return "This looks like an environment file with keys or passwords in it. minelog doesn't take private files, because every upload becomes a link anyone can open. Paste the lines you need instead, without the secrets.";
}

export function privateFileMessage(filename: string): string {
  return `${filename} can't be added. Environment files usually hold passwords and keys, so minelog doesn't take private files. Paste the lines you need instead, without the secrets.`;
}

