import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AmplifyProvider } from "@/components/auth/amplify-provider";
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
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
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${appName} — AI-Powered Document Chat & Knowledge Assistant`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — AI-Powered Document Chat & Knowledge Assistant`,
    description:
      "Upload documents, build knowledge bases, and deploy branded AI chatbots to any website.",
    images: ["/og-image.svg"],
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
