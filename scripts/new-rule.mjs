import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const id = process.argv[2];
const sample = process.argv.slice(3).join(" ").trim();

if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: npm run rule:new -- <rule-id> "<sample log line>"');
  console.error("The id is kebab-case, like mixin-failed.");
  process.exit(1);
}
if (!sample) {
  console.error("Give one real log line as the sample, in quotes.");
  process.exit(1);
}

const file = `${id}.ts`;
const rulePath = path.join(root, "src", "lib", "diagnose", "problems", "rules", file);
try {
  await access(rulePath);
  console.error(`${file} already exists. Pick another id or edit it directly.`);
  process.exit(1);
} catch {}

const name = id.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
const literal = sample.slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

await writeFile(
  rulePath,
  `import type { Rule } from "../types";

const PATTERN = /${literal}/;

export const ${name}: Rule = {
  id: "${id}",
  read(line) {
    if (!PATTERN.test(line.slice(0, 1000))) return null;
    return {
      key: "main",
      message: "Describe what is wrong in plain words.",
      solutions: [
        "Most likely fix first.",
        "Second thing to try.",
      ],
    };
  },
};
`,
);

const indexPath = path.join(root, "src", "lib", "diagnose", "problems", "rules", "index.ts");
const index = await readFile(indexPath, "utf8");
const imports = [...index.matchAll(/^import \{ \w+ \} from "\.\/\S+";$/gm)];
const lastImport = imports[imports.length - 1];
const withImport = `${index.slice(0, lastImport.index + lastImport[0].length)}\nimport { ${name} } from "./${id}";${index.slice(lastImport.index + lastImport[0].length)}`;
const arrayEnd = withImport.indexOf("];", withImport.indexOf("export const RULES"));
const withRule = `${withImport.slice(0, arrayEnd)}  ${name},\n${withImport.slice(arrayEnd)}`;
await writeFile(indexPath, withRule);

const docsPath = path.join(root, "src", "content", "api-docs.ts");
const docs = await readFile(docsPath, "utf8");
const docsAnchor = docs.indexOf("export const PROBLEM_DOCS");
const docsEnd = docs.indexOf("];", docsAnchor);
const withDocs =
  `${docs.slice(0, docsEnd)}  { id: "${id}", text: "One line saying when this fires." },\n${docs.slice(docsEnd)}`;
await writeFile(docsPath, withDocs);

console.log(`Wrote src/lib/diagnose/problems/rules/${file}`);
console.log("Wired into rules/index.ts and PROBLEM_DOCS.");
console.log("Next: edit the message and solutions, then paste this into tests/diagnose/problems.test.ts:");
console.log("");
console.log(`test("a short name for the case", () => {`);
console.log(`  assert.deepEqual(ids(server(${JSON.stringify(sample)})), ["${id}"]);`);
console.log(`});`);
