import type { NextConfig } from "next";

const API_MODE = process.env.SERVICE === "api";

const TO_API = "/:path((?!_next/).*)";

const nextConfig: NextConfig = {
  distDir: API_MODE && !process.env.VERCEL ? ".next-api" : ".next",
  async rewrites() {
    return {
      beforeFiles: API_MODE
        ? [{ source: TO_API, destination: "/svc/:path" }]
        : [
            {
              source: TO_API,
              has: [{ type: "host", value: "api\\..+" }],
              destination: "/svc/:path",
            },
          ],
    };
  },
  sassOptions: {
    quietDeps: true,
    silenceDeprecations: [
      "import",
      "global-builtin",
      "color-functions",
      "slash-div",
      "if-function",
    ],
  },
};

export default nextConfig;

