const localSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) return localSiteUrl;

  try {
    const url = new URL(configured);

    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return localSiteUrl;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return localSiteUrl;
  }
}

export function toSiteUrl(pathname: string) {
  const base = getSiteUrl();
  const normalizedPath =
    pathname === "/" ? "" : `/${pathname.replace(/^\/+/, "")}`;

  return `${base}${normalizedPath}`;
}
