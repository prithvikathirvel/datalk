import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  title: "Sign in · Datalk",
  description: "Sign in to your Datalk workspace with Google.",
  // Canonicalize to the bare /login URL — this page can be requested with
  // ?next=/dashboard or ?error=... query params (post-redirect), which would
  // otherwise look like duplicate content with no canonical to Google.
  alternates: {
    canonical: `${siteUrl}/login`,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <AuthCard mode="login">
      <LoginForm error={error} next={next} />
    </AuthCard>
  );
}
