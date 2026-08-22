import { getPublishedSnapshotHealth } from "@/server/status/health-report";

export const dynamic = "force-dynamic";

export function GET() {
  const report = getPublishedSnapshotHealth();

  return Response.json(
    {
      schemaVersion: 1,
      scope: "published-snapshot-readiness",
      ...report,
    },
    {
      status: report.status === "ready" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
