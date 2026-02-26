import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: false,
    unoptimized: true,
  },
};

export default nextConfig;
