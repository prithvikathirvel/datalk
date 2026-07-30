import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
};

export default function HomePage() {
  return <LandingPage />;
}
