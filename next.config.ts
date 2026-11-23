import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained server in .next/standalone, used by the Docker image
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  // allow phones/tablets on the LAN to load dev assets
  allowedDevOrigins: ["192.168.1.7"],
  // Analytics goes through our own domain (/ingest → PostHog EU) so tracking
  // protection and ad blockers don't drop it as a third-party request.
  async rewrites() {
    return [{ source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" }];
  },
  // PostHog endpoints end in "/" (e.g. /e/, /flags/); don't redirect them away
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
