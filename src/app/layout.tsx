import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Heim Civic Nevada",
    template: "%s | Heim Civic Nevada",
  },
  description:
    "A nonpartisan, source-driven way for Nevada residents to understand who represents them.",
  metadataBase: new URL(getSiteUrl()),
  robots: { index: true, follow: true },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
