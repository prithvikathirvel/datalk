import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AmplifyProvider } from "@/components/auth/amplify-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Datalk";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} — AI-Powered Document Chat & Knowledge Assistant`,
    template: `%s | ${appName}`,
  },
  description:
    "Datalk is a SaaS workspace for document ingestion, RAG-powered chat, and embeddable AI chatbots. Upload documents, build knowledge bases, and deploy branded chatbots to any website.",
  keywords: [
    "AI chatbot",
    "document chat",
    "RAG",
    "knowledge base",
    "document ingestion",
    "embeddable chatbot",
    "SaaS",
    "Datalk",
    "AI assistant",
    "customer support bot",
  ],
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  applicationName: appName,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Google Search shows the favicon in results only when it's ≥48×48 (or a
  // multiple) and reachable — favicon.ico is a real 48px ICO and the PNG
  // steps cover every surface from browser tabs to PWA installs.
  icons: {
    icon: [
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: appName,
    title: `${appName} — AI-Powered Document Chat & Knowledge Assistant`,
    description:
      "Upload documents, build knowledge bases, and deploy branded AI chatbots to any website with Datalk.",
    // PNG, not SVG — Google and social crawlers ignore SVG preview images.
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${appName} — AI-Powered Document Chat & Knowledge Assistant`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — AI-Powered Document Chat & Knowledge Assistant`,
    description:
      "Upload documents, build knowledge bases, and deploy branded AI chatbots to any website.",
    images: ["/og-image.png"],
  },
  category: "technology",
};

/**
 * Structured data for Google: the Organization.logo and WebSite entries are
 * what power the site icon / knowledge panel in search results. Google only
 * supports a fixed set of schema types for this — image/svg URLs are not
 * eligible, which is why the logo points at the PNG favicon.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: appName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: appName,
      description:
        "Upload documents, build knowledge bases, and deploy branded AI chatbots to any website.",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
        {/* rel="shortcut icon" + explicit rel="icon" sizes is the combination
            Google's favicon crawler looks for on the homepage. */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="icon"
          href="/favicon.ico"
          sizes="48x48"
          type="image/x-icon"
        />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link
          rel="icon"
          href="/icon-192.png"
          sizes="192x192"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, app-controlled schema.org JSON — no user input */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AmplifyProvider>{children}</AmplifyProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
