export const sourceFreshnessTargets = {
  boundaries: 92,
  officials: 8,
  legislation: 8,
  finance: 8,
} as const;

export type SourceHealthId = keyof typeof sourceFreshnessTargets;

export type SourceHealthInput = {
  id: SourceHealthId;
  generatedAt: string;
  recordCount: number;
  sourceCount: number;
};

export type SourceHealthCheck = SourceHealthInput & {
  state: "current" | "due-soon" | "stale" | "invalid";
  ageHours: number | null;
  targetDays: number;
  message: string;
};

export type SourceHealthReport = {
  status: "ready" | "degraded";
  checkedAt: string;
  checks: SourceHealthCheck[];
};

const dueSoonRatio = 0.75;
const maximumFutureSkewMilliseconds = 5 * 60 * 1000;

export function evaluateSourceHealth(
  snapshots: SourceHealthInput[],
  checkedAt = new Date(),
): SourceHealthReport {
  const checkedAtMilliseconds = checkedAt.getTime();
  const checks = snapshots.map((snapshot): SourceHealthCheck => {
    const targetDays = sourceFreshnessTargets[snapshot.id];
    const generatedAtMilliseconds = Date.parse(snapshot.generatedAt);

    if (
      !Number.isFinite(checkedAtMilliseconds) ||
      !Number.isFinite(generatedAtMilliseconds) ||
      generatedAtMilliseconds >
        checkedAtMilliseconds + maximumFutureSkewMilliseconds ||
      snapshot.recordCount < 1 ||
      snapshot.sourceCount < 1
    ) {
      return {
        ...snapshot,
        state: "invalid",
        ageHours: null,
        targetDays,
        message: "Snapshot metadata is invalid and requires operator review.",
      };
    }

    const ageHours = Math.max(
      0,
      Math.round(
        ((checkedAtMilliseconds - generatedAtMilliseconds) / 3_600_000) * 10,
      ) / 10,
    );
    const targetHours = targetDays * 24;

    if (ageHours > targetHours) {
      return {
        ...snapshot,
        state: "stale",
        ageHours,
        targetDays,
        message: `Snapshot exceeds its ${targetDays}-day freshness target.`,
      };
    }

    if (ageHours >= targetHours * dueSoonRatio) {
      return {
        ...snapshot,
        state: "due-soon",
        ageHours,
        targetDays,
        message: `Snapshot is approaching its ${targetDays}-day freshness target.`,
      };
    }

    return {
      ...snapshot,
      state: "current",
      ageHours,
      targetDays,
      message: `Snapshot is within its ${targetDays}-day freshness target.`,
    };
  });

  return {
    status: checks.some(
      (check) => check.state === "stale" || check.state === "invalid",
    )
      ? "degraded"
      : "ready",
    checkedAt: checkedAt.toISOString(),
    checks,
  };
}
