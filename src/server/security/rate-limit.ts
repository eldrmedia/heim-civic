import "server-only";

import { createHmac, randomBytes } from "node:crypto";

const buckets = new Map<string, { count: number; resetsAt: number }>();
const processSecret =
  process.env.LOOKUP_RATE_LIMIT_SECRET ?? randomBytes(32).toString("hex");

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitPolicy = {
  namespace: string;
  windowMs: number;
  requestLimit: number;
};

function requestFingerprint(request: Request): string {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const clientAddress =
    forwardedFor || request.headers.get("x-real-ip") || "unknown";

  return createHmac("sha256", processSecret)
    .update(clientAddress)
    .digest("hex");
}

function checkRateLimit(
  request: Request,
  policy: RateLimitPolicy,
  now = Date.now(),
): RateLimitResult {
  const key = `${policy.namespace}:${requestFingerprint(request)}`;
  const existing = buckets.get(key);
  const bucket =
    !existing || existing.resetsAt <= now
      ? { count: 0, resetsAt: now + policy.windowMs }
      : existing;

  bucket.count += 1;
  buckets.set(key, bucket);

  if (buckets.size > 5_000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetsAt <= now) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: bucket.count <= policy.requestLimit,
    limit: policy.requestLimit,
    remaining: Math.max(0, policy.requestLimit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetsAt - now) / 1_000)),
  };
}

export function checkLookupRateLimit(
  request: Request,
  now = Date.now(),
): RateLimitResult {
  return checkRateLimit(
    request,
    { namespace: "lookup", windowMs: 60_000, requestLimit: 10 },
    now,
  );
}

export function checkCorrectionRateLimit(
  request: Request,
  now = Date.now(),
): RateLimitResult {
  return checkRateLimit(
    request,
    { namespace: "correction", windowMs: 10 * 60_000, requestLimit: 5 },
    now,
  );
}
