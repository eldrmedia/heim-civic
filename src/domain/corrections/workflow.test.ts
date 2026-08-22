import { describe, expect, it } from "vitest";

import {
  canTransitionCorrection,
  createCorrectionAuditEvent,
} from "@/domain/corrections/workflow";

describe("correction workflow", () => {
  it("allows documented review transitions and rejects skipped states", () => {
    expect(canTransitionCorrection("received", "triaged")).toBe(true);
    expect(canTransitionCorrection("triaged", "investigating")).toBe(true);
    expect(canTransitionCorrection("resolved", "published")).toBe(true);
    expect(canTransitionCorrection("received", "published")).toBe(false);
    expect(canTransitionCorrection("published", "investigating")).toBe(false);
  });

  it("creates an immutable, sequenced intake event", () => {
    const event = createCorrectionAuditEvent({
      caseId: "HCN-20260822-ABC12345",
      sequence: 1,
      event: "status-transition",
      actor: "public-intake",
      occurredAt: "2026-08-22T20:00:00.000Z",
      reason: "Public correction submitted.",
      fromStatus: null,
      toStatus: "received",
      affectedRecordIds: ["/officials/us-congress-a000369"],
    });

    expect(event).toMatchObject({
      id: "HCN-20260822-ABC12345:event:1",
      sequence: 1,
      fromStatus: null,
      toStatus: "received",
    });
    expect(Object.isFrozen(event)).toBe(true);
  });

  it("requires before and after references for material changes", () => {
    expect(() =>
      createCorrectionAuditEvent({
        caseId: "HCN-20260822-ABC12345",
        sequence: 4,
        event: "material-record-change",
        actor: "editor:123",
        occurredAt: "2026-08-22T20:00:00.000Z",
        reason: "Corrected the committee assignment from official evidence.",
        fromStatus: "investigating",
        toStatus: "resolved",
        affectedRecordIds: ["official:nv-lcb-307"],
        evidenceUrls: ["https://www.leg.state.nv.us/official-source"],
      }),
    ).toThrow("before and after references");
  });
});
