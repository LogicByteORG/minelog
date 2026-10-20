import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { deleteLogsOf } from "./account-data";
import { COOKIE_PREFIX } from "./auth-config";
import { NAME_FILTER_MESSAGE, nameShapeProblem, normalizeName } from "./display-name";
import { checkNameModeration } from "./moderation";
import { pageBase } from "./site";

const FALLBACK_NAME = "minelog user";

declare global {
  var __minelogAuthPool: Pool | undefined;
}

function authPool(): Pool {
  return (globalThis.__minelogAuthPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  }));
}

function withoutTokens<T extends object>(account: T): T {
  return {
    ...account,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
  };
}

function checkedName(raw: string): string {
  const name = normalizeName(raw);
  const problem = nameShapeProblem(name);
  if (problem) throw new APIError("BAD_REQUEST", { message: problem });
  if (checkNameModeration(name)) {
    throw new APIError("BAD_REQUEST", { message: NAME_FILTER_MESSAGE });
  }
  return name;
}

export const auth = betterAuth({
  appName: "minelog",
  baseURL: pageBase(),
  database: authPool(),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
  account: { accountLinking: { allowDifferentEmails: true } },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await deleteLogsOf(user.id);
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            name: checkNameModeration(user.name ?? "") ? FALLBACK_NAME : user.name,
          },
        }),
      },
      update: {
        before: async (data) => ({
          data: {
            ...data,
            image: undefined,
            ...(typeof data.name === "string" ? { name: checkedName(data.name) } : {}),
          },
        }),
      },
    },
    account: {
      create: { before: async (account) => ({ data: withoutTokens(account) }) },
      update: { before: async (account) => ({ data: withoutTokens(account) }) },
    },
  },
  advanced: { cookiePrefix: COOKIE_PREFIX },
  plugins: [nextCookies()],
});
