import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  correctionRequestSchema,
  type CorrectionIntakeEnvelope,
  type CorrectionResponse,
} from "@/domain/corrections/types";
import {
  deliverCorrection,
  getCorrectionDeliveryConfig,
} from "@/server/corrections/delivery";
import { checkCorrectionRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function json(body: CorrectionResponse, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { ...responseHeaders, ...headers },
  });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const allowedHosts = new Set(
      [
        new URL(request.url).host,
        request.headers.get("host"),
        request.headers.get("x-forwarded-host"),
      ].filter((host): host is string => Boolean(host)),
    );
    return allowedHosts.has(originHost);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const limit = checkCorrectionRateLimit(request);
  const rateHeaders = {
    "RateLimit-Limit": String(limit.limit),
    "RateLimit-Remaining": String(limit.remaining),
  };

  if (!limit.allowed) {
    return json(
      {
        status: "rate-limited",
        message:
          "Too many correction attempts. Wait a few minutes and try again.",
      },
      429,
      { ...rateHeaders, "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  if (!isSameOrigin(request)) {
    return json(
      { status: "invalid", message: "This submission origin is not allowed." },
      403,
      rateHeaders,
    );
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json(
      { status: "invalid", message: "Send the correction as JSON." },
      415,
      rateHeaders,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return json(
      { status: "invalid", message: "Correction request is too large." },
      413,
      rateHeaders,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(
      { status: "invalid", message: "Correction request is not valid JSON." },
      400,
      rateHeaders,
    );
  }

  const parsed = correctionRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        status: "invalid",
        message: "Review the highlighted fields and try again.",
        fields: parsed.error.flatten().fieldErrors,
      },
      400,
      rateHeaders,
    );
  }

  if (parsed.data.website) {
    return json(
      {
        status: "received",
        caseId: "HCN-RECEIVED",
        message: "Your correction request was received.",
      },
      202,
      rateHeaders,
    );
  }

  const config = getCorrectionDeliveryConfig();
  if (!config) {
    return json(
      {
        status: "unavailable",
        message:
          "Correction intake is temporarily unavailable. No information was retained.",
      },
      503,
      rateHeaders,
    );
  }

  const submittedAt = new Date().toISOString();
  const caseId = `HCN-${submittedAt.slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const envelope: CorrectionIntakeEnvelope = {
    schemaVersion: 1,
    caseId,
    status: "received",
    submittedAt,
    record: {
      type: parsed.data.recordType,
      reference: parsed.data.recordReference,
    },
    report: {
      description: parsed.data.issueDescription,
      evidenceUrl: parsed.data.evidenceUrl,
    },
    reporter: { email: parsed.data.email, contactConsent: true },
    audit: [
      { event: "received", actor: "public-intake", occurredAt: submittedAt },
    ],
  };

  try {
    await deliverCorrection(envelope, config);
  } catch {
    return json(
      {
        status: "unavailable",
        message:
          "We could not deliver this request. No information was retained; please try again.",
      },
      503,
      rateHeaders,
    );
  }

  return json(
    {
      status: "received",
      caseId,
      message: "Your correction request was received for editorial review.",
    },
    202,
    rateHeaders,
  );
}
