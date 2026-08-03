import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

/**
 * Generates /robots.txt at build/request time.
 *
 * Public marketing + legal pages stay crawlable. Authenticated app pages and
 * internal API routes are disallowed here — middleware redirects Googlebot
 * to /login before any page content (or a `noindex` tag) can ever be
 * rendered for them, so blocking the crawl outright is what actually saves
 * crawl budget and avoids "Page with redirect" churn in Search Console.
 *
 * `/widget` is intentionally NOT disallowed here: it is a real, publicly
 * reachable page (embedded via <iframe> on customer sites, gated only by an
 * `apiKey` query param, not a login session) so Googlebot can genuinely
 * fetch it. It carries a page-level `noindex` meta tag instead (see
 * app/widget/page.tsx) — the Google-recommended approach for pages that are
 * crawlable but should never appear in search results, since blocking a
 * crawlable URL via robots.txt can leave it listed with no snippet instead
 * of fully removing it from the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/documents",
        "/chat",
        "/analytics",
        "/quality",
        "/settings",
        "/embed",
        "/studio",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
