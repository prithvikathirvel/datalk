import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@template/ui", "@template/contracts"],
};

export default nextConfig;
