import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "login" | "signup";
}) {
  return (
    <div className="w-full max-w-md">
      {/* Mobile logo — hidden on desktop where the brand panel shows */}
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 font-bold text-sm text-white">
          D
        </div>
        <span className="font-semibold text-slate-950 tracking-tight">Datalk</span>
      </div>

      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-slate-950 tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          {mode === "login"
            ? "Sign in to your document AI workspace."
            : "Get started with your document AI workspace."}
        </p>
      </div>

      {children}

      <p className="mt-6 text-slate-500 text-sm">
        {mode === "login" ? "Don\u2019t have an account? " : "Already have an account? "}
        <Link
          className="font-medium text-slate-950 underline underline-offset-4"
          href={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
