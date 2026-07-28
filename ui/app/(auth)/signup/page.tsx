import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create your workspace · Datalk",
  description:
    "Create a free Datalk workspace with Google and go live in minutes.",
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
