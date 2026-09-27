import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const command = process.argv[2];
if (!["dev", "build", "start"].includes(command)) {
  console.error("Usage: node scripts/service.mjs <dev|build|start>");
  process.exit(1);
}

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const args = [nextBin, command];
if (command !== "build") args.push("-p", process.env.API_PORT ?? "4000");

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env: { ...process.env, SERVICE: "api" },
});
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

