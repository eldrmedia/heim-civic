import type { MetadataRoute } from "next";

import { getSiteUrl, toSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: toSiteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
