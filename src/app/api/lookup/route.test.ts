import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/lookup/route";

function lookupRequest(body: unknown) {
  return new Request("http://localhost/api/lookup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "192.0.2.10",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/lookup", () => {
  it("rejects a P.O. box without reflecting submitted input", async () => {
    const submitted = "P.O. Box 123, Reno, NV 89501";
    const response = await POST(lookupRequest({ address: submitted }));
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(text).not.toContain(submitted);
    expect(JSON.parse(text)).toEqual({
      status: "invalid",
      message: "Enter a physical street address, not a P.O. box.",
    });
  });

  it("rejects non-JSON request bodies", async () => {
    const response = await POST(
      new Request("http://localhost/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "not-json",
      }),
    );

    expect(response.status).toBe(415);
  });
});
