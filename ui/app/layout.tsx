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
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.app";

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
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
