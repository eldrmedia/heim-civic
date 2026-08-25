import type { Metadata } from "next";

import { getSiteUrl, toSiteUrl } from "@/lib/site-url";

export const siteName = "Heim Civic Nevada";
export const defaultSiteDescription =
  "Find Nevada districts, current representatives, bills, recorded votes, and official public sources.";

type PageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  type?: "website" | "article" | "profile";
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  pathname,
  type = "website",
  index = true,
}: PageMetadataInput): Metadata {
  const canonicalPathname = normalizePathname(pathname);
  const canonical = toSiteUrl(canonicalPathname);
  const socialImage = toSiteUrl("/opengraph-image");
  const socialTitle = `${title} | ${siteName}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      siteName,
      title: socialTitle,
      description,
      url: canonical,
      locale: "en_US",
      images: [{ url: socialImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
    robots: {
      index: index && isPublicIndexingEnabled(),
      follow: true,
      googleBot: {
        index: index && isPublicIndexingEnabled(),
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function isPublicIndexingEnabled() {
  const url = getSiteUrl();
  const vercelEnvironment = process.env.VERCEL_ENV;

  if (!url.startsWith("https://")) return false;
  return vercelEnvironment !== "preview" && vercelEnvironment !== "development";
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";
  return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
}
