import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/corrections/route";

let requestNumber = 0;

function correctionRequest(
  body: unknown,
  headers: Record<string, string> = {},
) {
  requestNumber += 1;
  return new Request("http://localhost/api/corrections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      "X-Forwarded-For": `198.51.100.${requestNumber}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const validRequest = {
  recordType: "official",
  recordReference: "/officials/us-congress-h001066",
  issueDescription:
    "The displayed committee assignment appears to be out of date.",
  evidenceUrl: "https://www.house.gov/official-source",
  email: "reader@example.com",
  consent: true,
  website: "",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/corrections", () => {
  it("rejects invalid reports without reflecting submitted details", async () => {
    const submitted = "too short";
    const response = await POST(
      correctionRequest({ ...validRequest, issueDescription: submitted }),
    );
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(text).not.toContain(submitted);
    expect(JSON.parse(text)).toMatchObject({ status: "invalid" });
  });

  it("rejects cross-origin submissions", async () => {
    const response = await POST(
      correctionRequest(validRequest, { Origin: "https://example.org" }),
    );

    expect(response.status).toBe(403);
  });

  it("does not retain a report when delivery is not configured", async () => {
    const response = await POST(correctionRequest(validRequest));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: "unavailable",
      message: expect.stringContaining("No information was retained"),
    });
  });

  it("delivers an auditable received envelope and returns a case reference", async () => {
    vi.stubEnv(
      "CORRECTIONS_INTAKE_WEBHOOK_URL",
      "https://intake.example.test/cases",
    );
    vi.stubEnv("CORRECTIONS_INTAKE_WEBHOOK_TOKEN", "test-token");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 202 }));

    const response = await POST(correctionRequest(validRequest));
    const result = await response.json();

    expect(response.status).toBe(202);
    expect(result).toMatchObject({ status: "received" });
    expect(result.caseId).toMatch(/^HCN-\d{8}-[A-F0-9]{8}$/);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const delivered = JSON.parse(String(init?.body));
    expect(delivered).toMatchObject({
      schemaVersion: 1,
      status: "received",
      record: {
        type: "official",
        reference: "/officials/us-congress-h001066",
      },
      reporter: { contactConsent: true },
      audit: [{ event: "received", actor: "public-intake" }],
    });
  });
});
