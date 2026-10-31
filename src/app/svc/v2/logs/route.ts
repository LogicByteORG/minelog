import type { NextRequest } from "next/server";
import { domainUrl } from "@/lib/domain-settings";
import { findPageByKey, pageKeyFromRequest } from "@/lib/log-pages";
import { readBodyText } from "@/lib/service/body";
import { describeV2Created } from "@/lib/service/describe";
import { queryFlag } from "@/lib/service/fields";
import { json, preflight, v2Error, v2Failure } from "@/lib/service/respond";
import { uploadLog } from "@/lib/service/upload";
import { pageBase } from "@/lib/site";

export const OPTIONS = preflight;

export async function POST(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  try {
    const text = await readBodyText(request);
    const isJson = (request.headers.get("content-type") ?? "")
      .toLowerCase()
      .includes("json");

    let content: unknown = text;
    let hidePrivate: unknown;
    let source: unknown;

    if (isJson) {
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        return v2Error(400, "invalid_body", 'Send JSON like {"content": "..."}.');
      }
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        return v2Error(400, "invalid_body", 'Send JSON like {"content": "..."}.');
      }
      ({ content, hidePrivate, source } = payload as Record<string, unknown>);
    }

    hidePrivate ??= queryFlag(query.get("hidePrivate"));
    source ??= query.get("source") ?? undefined;

    // A page key (mlp_...) names the custom page, so the log opens branded. No key, a normal log.
    let customPage: { id: string; slug: string; domain: string | null } | null = null;
    if (request.headers.get("authorization")) {
      const key = pageKeyFromRequest(request);
      const found = key ? await findPageByKey(key) : null;
      if (!found) {
        return v2Error(
          401,
          "invalid_key",
          "That page key isn't valid. Generate a new one on your custom page in the minelog dashboard.",
        );
      }
      customPage = {
        id: found.id,
        slug: found.slug,
        domain: found.domainVerifiedAt ? found.domain : null,
      };
    }

    const saved = await uploadLog({
      content,
      hidePrivate,
      source,
      request,
      customPageId: customPage?.id ?? null,
    });
    const body = describeV2Created(saved, request);
    const url = customPage
      ? customPage.domain
        ? domainUrl(customPage.domain, saved.id)
        : `${pageBase()}/c/${customPage.slug}/${saved.id}`
      : null;
    return json(url ? { ...body, url } : body, 201);
  } catch (error) {
    return v2Failure(error);
  }
}
