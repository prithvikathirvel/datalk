import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  title: "Create your workspace · Datalk",
  description:
    "Create a free Datalk workspace with Google and go live in minutes.",
  // Canonicalize to the bare /signup URL for the same reason as /login.
  alternates: {
    canonical: `${siteUrl}/signup`,
  },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <AuthCard mode="signup">
      <SignupForm error={error} next={next} />
    </AuthCard>
  );
}
