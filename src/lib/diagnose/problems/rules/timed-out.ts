import type { Rule } from "../types";

const READ_TIMED_OUT = /Read timed out/;
const LOST_TIMEOUT = /lost connection: Timed out/;
const FORCIBLY_CLOSED = /An existing connection was forcibly closed/;

export const timedOut: Rule = {
  id: "connection-timed-out",
  read(line) {
    const short = line.slice(0, 1000);
    if (!READ_TIMED_OUT.test(short) && !LOST_TIMEOUT.test(short) && !FORCIBLY_CLOSED.test(short)) {
      return null;
    }
    return {
      key: "timeout",
      message: "A player lost connection because the network timed out.",
      solutions: [
        "Try joining again. A single timeout is usually a hiccup in the connection.",
        "If it keeps happening, restart your router and use a wired connection when you can.",
        "If everyone times out at the same spot, the server may be overloaded. Check for lag and give it more memory or CPU.",
      ],
    };
  },
};
