import type { MetadataRoute } from "next";

import { getSiteUrl, toSiteUrl } from "@/lib/site-url";
import { isPublicIndexingEnabled } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isPublicIndexingEnabled()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/search"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/search"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: toSiteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
