import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/waitlist/route";

let requestNumber = 0;

function waitlistRequest(body: unknown, headers: Record<string, string> = {}) {
  requestNumber += 1;
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      "X-Forwarded-For": `203.0.113.${requestNumber}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const validRequest = {
  email: "Reader@Example.com",
  consent: true,
  location: "Washoe County",
  role: "resident",
  desiredFeatures: ["districts-and-representatives", "bills-and-votes"],
  membershipInterest: "five-dollars",
  website: "",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/waitlist", () => {
  it("requires affirmative consent without reflecting the email", async () => {
    const response = await POST(
      waitlistRequest({ ...validRequest, consent: false }),
    );
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(text).not.toContain(validRequest.email);
    expect(JSON.parse(text)).toMatchObject({ status: "invalid" });
  });

  it("rejects cross-origin submissions", async () => {
    const response = await POST(
      waitlistRequest(validRequest, { Origin: "https://example.org" }),
    );

    expect(response.status).toBe(403);
  });

  it("does not retain a request when confirmation delivery is unavailable", async () => {
    const response = await POST(waitlistRequest(validRequest));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: "unavailable",
      message: expect.stringContaining("not retained"),
    });
  });

  it("delivers a pending-confirmation envelope with minimized preferences", async () => {
    vi.stubEnv(
      "WAITLIST_INTAKE_WEBHOOK_URL",
      "https://intake.example.test/waitlist",
    );
    vi.stubEnv("WAITLIST_INTAKE_WEBHOOK_TOKEN", "test-token");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 202 }));

    const response = await POST(waitlistRequest(validRequest));
    const result = await response.json();

    expect(response.status).toBe(202);
    expect(result).toEqual({
      status: "confirmation-pending",
      message: "Check your email to confirm your waitlist request.",
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const delivered = JSON.parse(String(init?.body));
    expect(delivered).toMatchObject({
      schemaVersion: 1,
      status: "pending-confirmation",
      contact: { email: "reader@example.com" },
      consent: {
        source: "public-waitlist-form",
        confirmationRequired: true,
      },
      preferences: {
        location: "Washoe County",
        role: "resident",
        membershipInterest: "five-dollars",
      },
      prohibitedDataNotice: {
        exactAddressAccepted: false,
        politicalPreferenceAccepted: false,
      },
    });
  });
});
