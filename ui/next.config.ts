import type { NextConfig } from "next";

/**
 * Performance notes
 * -----------------
 * - Brand assets (favicons, og image, manifest) are versionless files under
 *   /public, so we cannot use immutable year-long caching. A 1-day browser
 *   TTL with a 7-day stale-while-revalidate window keeps repeat visits and
 *   social/search crawlers instant without ever serving truly stale assets.
 * - The embed script (/api/embed/script) sets its own CDN cache headers in
 *   the route handler — browsers 5 min, shared caches 10 min, plus a full
 *   day of stale-while-revalidate — so customer websites never pay the cold
 *   start on repeat loads.
 */

const BRAND_ASSET_CACHE =
  "public, max-age=86400, stale-while-revalidate=604800";

const brandAssetPaths = [
  "/favicon.ico",
  "/favicon.png",
  "/favicon.svg",
  "/logo.svg",
  "/og-image.png",
  "/manifest.json",
  "/icon-16.png",
  "/icon-32.png",
  "/icon-48.png",
  "/icon-96.png",
  "/icon-192.png",
  "/icon-512.png",
];

const nextConfig: NextConfig = {
  transpilePackages: ["@template/ui", "@template/contracts"],
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
      ...brandAssetPaths.map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: BRAND_ASSET_CACHE }],
      })),
    ];
  },
};

export default nextConfig;
