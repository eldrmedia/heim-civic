import { NextResponse } from "next/server";

import { lookupRequestSchema } from "@/domain/geography/address";
import type { LookupResponse } from "@/domain/geography/types";
import { lookupNevadaAddress } from "@/server/geography/lookup-service";
import { checkLookupRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function json(body: LookupResponse, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { ...responseHeaders, ...headers },
  });
}

export async function POST(request: Request) {
  const limit = checkLookupRateLimit(request);
  const rateHeaders = {
    "RateLimit-Limit": String(limit.limit),
    "RateLimit-Remaining": String(limit.remaining),
  };

  if (!limit.allowed) {
    return json(
      {
        status: "rate-limited",
        message: "Too many lookup attempts. Wait a moment and try again.",
      },
      429,
      { ...rateHeaders, "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json(
      { status: "invalid", message: "Send the lookup as JSON." },
      415,
      rateHeaders,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_024) {
    return json(
      { status: "invalid", message: "Lookup request is too large." },
      413,
      rateHeaders,
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json(
      { status: "invalid", message: "Lookup request is not valid JSON." },
      400,
      rateHeaders,
    );
  }

  const parsed = lookupRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        status: "invalid",
        message:
          parsed.error.issues[0]?.message ?? "Enter a complete Nevada address.",
      },
      400,
      rateHeaders,
    );
  }

  try {
    return json(
      await lookupNevadaAddress(parsed.data.address),
      200,
      rateHeaders,
    );
  } catch {
    return json(
      {
        status: "review",
        message:
          "The lookup service is temporarily unavailable. Try again shortly.",
      },
      503,
      rateHeaders,
    );
  }
}
