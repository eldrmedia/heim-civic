import { parsePublicProductionUrl } from "@/domain/operations/launch-readiness";

export type DeploymentVerificationCheck = {
  id: string;
  state: "pass" | "fail";
  message: string;
};

export type DeploymentVerificationReport = {
  schemaVersion: 1;
  status: "ready" | "not-ready";
  checkedAt: string;
  checks: DeploymentVerificationCheck[];
};

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type VerificationInput = {
  deploymentUrl: string;
  checkedAt?: Date;
  fetchImplementation?: FetchLike;
};

type Artifact = {
  headers: Headers;
  body: string;
};

const requestTimeoutMilliseconds = 10_000;
const maximumBodyBytes = 2_000_000;

function result(
  id: string,
  passes: boolean,
  passMessage: string,
  failMessage: string,
): DeploymentVerificationCheck {
  return {
    id,
    state: passes ? "pass" : "fail",
    message: passes ? passMessage : failMessage,
  };
}

async function fetchArtifact(
  fetchImplementation: FetchLike,
  url: URL,
): Promise<Artifact | null> {
  try {
    const response = await fetchImplementation(url, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
      headers: { "user-agent": "Heim-Civic-Deployment-Check/1.0" },
    });
    const contentLength = Number(response.headers.get("content-length"));

    if (
      !response.ok ||
      (Number.isFinite(contentLength) && contentLength > maximumBodyBytes)
    ) {
      return null;
    }

    const body = await response.text();
    if (new TextEncoder().encode(body).byteLength > maximumBodyBytes)
      return null;

    return { headers: response.headers, body };
  } catch {
    return null;
  }
}

function hasContentType(artifact: Artifact | null, expected: string) {
  return artifact?.headers.get("content-type")?.includes(expected) ?? false;
}

function hasCanonical(body: string, expectedUrl: string) {
  return [...body.matchAll(/<link\b[^>]*>/gi)].some((match) => {
    const tag = match[0];
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    return rel === "canonical" && href?.replace(/\/$/, "") === expectedUrl;
  });
}

function verifyHeaders(home: Artifact | null) {
  if (!home) return false;
  const csp = home.headers.get("content-security-policy") ?? "";
  const permissions = home.headers.get("permissions-policy") ?? "";

  return (
    csp.includes("default-src 'self'") &&
    csp.includes("frame-ancestors 'none'") &&
    csp.includes("object-src 'none'") &&
    home.headers.get("strict-transport-security")?.includes("max-age=") ===
      true &&
    home.headers.get("x-content-type-options") === "nosniff" &&
    home.headers.get("x-frame-options") === "DENY" &&
    home.headers.get("referrer-policy") === "strict-origin-when-cross-origin" &&
    permissions.includes("geolocation=()") &&
    home.headers.get("x-powered-by") === null
  );
}

function sitemapLocations(body: string) {
  return [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
}

export async function verifyProductionDeployment({
  deploymentUrl,
  checkedAt = new Date(),
  fetchImplementation = fetch,
}: VerificationInput): Promise<DeploymentVerificationReport> {
  const baseUrl = parsePublicProductionUrl(deploymentUrl);

  if (!baseUrl) {
    return {
      schemaVersion: 1,
      status: "not-ready",
      checkedAt: checkedAt.toISOString(),
      checks: [
        result(
          "deployment-origin",
          false,
          "",
          "Provide the final non-reserved HTTPS deployment origin.",
        ),
      ],
    };
  }

  const origin = baseUrl.toString().replace(/\/$/, "");
  const paths = [
    "/",
    "/api/health",
    "/robots.txt",
    "/sitemap.xml",
    "/.well-known/security.txt",
    "/officials",
  ] as const;
  const artifacts = await Promise.all(
    paths.map((path) =>
      fetchArtifact(fetchImplementation, new URL(`${origin}${path}`)),
    ),
  );
  const home = artifacts[0] ?? null;
  const health = artifacts[1] ?? null;
  const robots = artifacts[2] ?? null;
  const sitemap = artifacts[3] ?? null;
  const securityContact = artifacts[4] ?? null;
  const officials = artifacts[5] ?? null;
  const locations = sitemap ? sitemapLocations(sitemap.body) : [];
  const uniqueLocations = new Set(locations);
  const locationsUseOrigin = locations.every((location) => {
    try {
      const url = new URL(location);
      return url.origin === baseUrl.origin && !url.search && !url.hash;
    } catch {
      return false;
    }
  });

  const checks = [
    result(
      "deployment-origin",
      true,
      "The deployment uses a final non-reserved HTTPS origin.",
      "",
    ),
    result(
      "home-response",
      hasContentType(home, "text/html") &&
        home?.body.includes("Heim Civic Nevada") === true &&
        !/name=["']robots["'][^>]+noindex/i.test(home.body) &&
        hasCanonical(home.body, origin),
      "The public home page is indexable and uses the configured canonical origin.",
      "The home page response, indexability, identity, or canonical is incorrect.",
    ),
    result(
      "security-headers",
      verifyHeaders(home),
      "Required transport, CSP, framing, MIME, referrer, and permissions headers are present.",
      "One or more required production security headers are missing or invalid.",
    ),
    result(
      "source-health",
      hasContentType(health, "application/json") &&
        (() => {
          try {
            return JSON.parse(health?.body ?? "null").status === "ready";
          } catch {
            return false;
          }
        })(),
      "The deployed source-health endpoint reports ready.",
      "The deployed source-health endpoint is unavailable, malformed, or degraded.",
    ),
    result(
      "crawl-policy",
      hasContentType(robots, "text/plain") &&
        robots?.body.includes(`Sitemap: ${origin}/sitemap.xml`) === true &&
        robots.body.includes("OAI-SearchBot") &&
        robots.body.includes("GPTBot"),
      "The deployed robots policy names the canonical sitemap and separates search from training bots.",
      "The deployed robots policy or canonical sitemap reference is incomplete.",
    ),
    result(
      "sitemap-coverage",
      hasContentType(sitemap, "application/xml") &&
        locations.length >= 1_300 &&
        locations.length === uniqueLocations.size &&
        locationsUseOrigin &&
        locations.some((location) => location.includes("/officials/")) &&
        locations.some((location) => location.includes("/districts/")) &&
        locations.some((location) => location.includes("/bills/")),
      "The production sitemap contains at least 1,300 unique same-origin civic routes.",
      "The production sitemap is unavailable, incomplete, duplicated, or contains a foreign origin.",
    ),
    result(
      "security-contact",
      hasContentType(securityContact, "text/plain") &&
        securityContact?.body.includes("Contact: mailto:") === true &&
        securityContact.body.includes("Expires:") &&
        !securityContact.body.includes("localhost"),
      "The machine-readable security contact is configured and available.",
      "The machine-readable security contact is unavailable or incomplete.",
    ),
    result(
      "official-directory",
      hasContentType(officials, "text/html") &&
        officials?.body.includes("Who represents Nevada.") === true &&
        hasCanonical(officials.body, `${origin}/officials`),
      "The public official directory is available at its canonical URL.",
      "The official directory response or canonical is incorrect.",
    ),
  ];

  return {
    schemaVersion: 1,
    status: checks.every((check) => check.state === "pass")
      ? "ready"
      : "not-ready",
    checkedAt: checkedAt.toISOString(),
    checks,
  };
}
