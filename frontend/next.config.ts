import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Render deployment
  output: "standalone",
  // Turbopack is not supported on darwin/arm64 — use webpack for build
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
