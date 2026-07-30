import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

/**
 * Generates /sitemap.xml.
 *
 * Only lists public, indexable pages. Authenticated app routes
 * (/dashboard, /chat, /documents, /analytics, /quality, /settings, /embed)
 * and the /widget iframe are intentionally omitted — they are noindexed
 * and disallowed in robots.ts, so listing them here would only create
 * "Excluded by noindex" / "Blocked by robots.txt" noise in Search Console.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
