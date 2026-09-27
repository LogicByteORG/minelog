import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { CASES } from "./hostile/cases";

const STAGE_LIMIT_MS = 4000;
const CASE_LIMIT_MS = 40_000;

function run(name: string): Promise<{ stage: string; ms: number }[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./hostile/worker.ts", import.meta.url), {
      execArgv: ["--import", "tsx"],
      workerData: { name },
    });
    const times: { stage: string; ms: number }[] = [];
    const timer = setTimeout(() => {
      void worker.terminate();
      const last = times.length > 0 ? `after ${times[times.length - 1].stage}` : "before finishing any reader";
      reject(new Error(`"${name}" was still running after ${CASE_LIMIT_MS} ms, ${last}`));
    }, CASE_LIMIT_MS);

    worker.on("message", (message: { stage?: string; ms?: number; done?: boolean }) => {
      if (message.done) {
        clearTimeout(timer);
        resolve(times);
      } else {
        times.push({ stage: message.stage!, ms: message.ms! });
      }
    });
    worker.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

for (const name of Object.keys(CASES)) {
  test(`hostile input: ${name}`, async () => {
    const times = await run(name);
    for (const { stage, ms } of times) {
      assert.ok(ms < STAGE_LIMIT_MS, `${stage} took ${ms.toFixed(0)} ms`);
    }
  });
}

