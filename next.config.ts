import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // allow phones/tablets on the LAN to load dev assets
  allowedDevOrigins: ["192.168.1.7"],
};

export default nextConfig;
