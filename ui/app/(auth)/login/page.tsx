import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard mode="login">
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
