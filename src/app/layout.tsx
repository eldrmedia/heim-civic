import type { Metadata } from "next";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/atoms/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import {
  defaultSiteDescription,
  isPublicIndexingEnabled,
  siteName,
} from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultSiteDescription,
  metadataBase: new URL(getSiteUrl()),
  alternates: { canonical: getSiteUrl() },
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: defaultSiteDescription,
    url: getSiteUrl(),
    locale: "en_US",
    images: [
      {
        url: `${getSiteUrl()}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Heim Civic Nevada — Nevada government, made findable",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultSiteDescription,
    images: [`${getSiteUrl()}/opengraph-image`],
  },
  robots: {
    index: isPublicIndexingEnabled(),
    follow: true,
    googleBot: {
      index: isPublicIndexingEnabled(),
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${getSiteUrl()}/#organization`,
                name: "Heim Civic Foundation",
                url: getSiteUrl(),
                description:
                  "An independent public-interest civic transparency project for Nevada.",
              },
              {
                "@type": "WebSite",
                "@id": `${getSiteUrl()}/#website`,
                url: getSiteUrl(),
                name: siteName,
                description: defaultSiteDescription,
                publisher: { "@id": `${getSiteUrl()}/#organization` },
                inLanguage: "en-US",
              },
            ],
          }}
        />
        {children}
      </body>
    </html>
  );
}
