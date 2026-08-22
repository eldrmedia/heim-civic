import { toSiteUrl } from "@/lib/site-url";
import { getSecurityContactEmail } from "@/server/security/security-contact";

export const dynamic = "force-dynamic";

export function GET() {
  const email = getSecurityContactEmail();

  if (!email) {
    return new Response("Security contact is not configured.\n", {
      status: 503,
      headers: securityTextHeaders,
    });
  }

  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + 180);

  return new Response(
    [
      `Contact: mailto:${email}`,
      `Policy: ${toSiteUrl("/security")}`,
      `Canonical: ${toSiteUrl("/.well-known/security.txt")}`,
      `Expires: ${expires.toISOString()}`,
      "Preferred-Languages: en",
      "",
    ].join("\n"),
    { headers: securityTextHeaders },
  );
}

const securityTextHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};
