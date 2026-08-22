import "server-only";

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const allowedHosts = new Set(
      [
        new URL(request.url).host,
        request.headers.get("host"),
        request.headers.get("x-forwarded-host"),
      ].filter((host): host is string => Boolean(host)),
    );
    return allowedHosts.has(originHost);
  } catch {
    return false;
  }
}
