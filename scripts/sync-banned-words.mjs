import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "src", "content", "banned-words.conf");
const target = path.join(root, "src", "content", "banned-words.json");

const raw = await readFile(source, "utf8");
const words = raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith("#"));

await writeFile(target, `${JSON.stringify(words, null, 2)}\n`, "utf8");
console.log(`Wrote ${words.length} entries to src/content/banned-words.json`);

