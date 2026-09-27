import { parentPort, workerData } from "node:worker_threads";
import { CASES, STAGES } from "./cases";

const text = CASES[workerData.name as string]();
for (const [stage, run] of Object.entries(STAGES)) {
  const started = performance.now();
  run(text);
  parentPort!.postMessage({ stage, ms: performance.now() - started });
}
parentPort!.postMessage({ done: true });

