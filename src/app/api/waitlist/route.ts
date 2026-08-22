import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  waitlistRequestSchema,
  type WaitlistEnvelope,
  type WaitlistResponse,
} from "@/domain/waitlist/types";
import { checkWaitlistRateLimit } from "@/server/security/rate-limit";
import { isSameOriginRequest } from "@/server/security/same-origin";
import {
  deliverWaitlistRequest,
  getWaitlistDeliveryConfig,
} from "@/server/waitlist/delivery";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function json(body: WaitlistResponse, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { ...responseHeaders, ...headers },
  });
}

export async function POST(request: Request) {
  const limit = checkWaitlistRateLimit(request);
  const rateHeaders = {
    "RateLimit-Limit": String(limit.limit),
    "RateLimit-Remaining": String(limit.remaining),
  };

  if (!limit.allowed) {
    return json(
      {
        status: "rate-limited",
        message: "Too many waitlist attempts. Wait before trying again.",
      },
      429,
      { ...rateHeaders, "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  if (!isSameOriginRequest(request)) {
    return json(
      { status: "invalid", message: "This submission origin is not allowed." },
      403,
      rateHeaders,
    );
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json(
      { status: "invalid", message: "Send the waitlist request as JSON." },
      415,
      rateHeaders,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4_096) {
    return json(
      { status: "invalid", message: "Waitlist request is too large." },
      413,
      rateHeaders,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(
      { status: "invalid", message: "Waitlist request is not valid JSON." },
      400,
      rateHeaders,
    );
  }

  const parsed = waitlistRequestSchema.safeParse(payload);
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
        status: "confirmation-pending",
        message: "Check your email to confirm your waitlist request.",
      },
      202,
      rateHeaders,
    );
  }

  const config = getWaitlistDeliveryConfig();
  if (!config) {
    return json(
      {
        status: "unavailable",
        message:
          "The waitlist is temporarily unavailable. Your information was not retained.",
      },
      503,
      rateHeaders,
    );
  }

  const submittedAt = new Date().toISOString();
  const envelope: WaitlistEnvelope = {
    schemaVersion: 1,
    subscriptionId: `HCN-W-${randomUUID()}`,
    status: "pending-confirmation",
    submittedAt,
    contact: { email: parsed.data.email },
    consent: {
      capturedAt: submittedAt,
      source: "public-waitlist-form",
      confirmationRequired: true,
    },
    preferences: {
      location: parsed.data.location,
      role: parsed.data.role,
      desiredFeatures: parsed.data.desiredFeatures,
      membershipInterest: parsed.data.membershipInterest,
    },
    prohibitedDataNotice: {
      exactAddressAccepted: false,
      politicalPreferenceAccepted: false,
    },
  };

  try {
    await deliverWaitlistRequest(envelope, config);
  } catch {
    return json(
      {
        status: "unavailable",
        message:
          "We could not deliver this request. Your information was not retained.",
      },
      503,
      rateHeaders,
    );
  }

  return json(
    {
      status: "confirmation-pending",
      message: "Check your email to confirm your waitlist request.",
    },
    202,
    rateHeaders,
  );
}
