import type { NextConfig } from "next";

import { securityHeaders } from "./src/config/security-headers";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.leg.state.nv.us",
        port: "",
        pathname: "/Session/**/legislators/**/Images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "bioguide.congress.gov",
        port: "",
        pathname: "/bioguide/photo/**",
        search: "",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
