import Link from "next/link";
import type { ReactNode } from "react";

type AuthMode = "login" | "signup";

const copy: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    footerText: string;
    footerCta: string;
    footerHref: string;
  }
> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in with Google to open your workspace.",
    footerText: "New to Datalk?",
    footerCta: "Create a free workspace",
    footerHref: "/signup",
  },
  signup: {
    title: "Create your workspace",
    subtitle: "Start free with Google. No credit card, no setup call.",
    footerText: "Already have an account?",
    footerCta: "Sign in",
    footerHref: "/login",
  },
};

export function AuthCard({
  children,
  mode = "login",
}: {
  children: ReactNode;
  mode?: AuthMode;
}) {
  const { title, subtitle, footerText, footerCta, footerHref } = copy[mode];

  return (
    <div className="dk-animate-fade-up w-full max-w-sm">
      {/* Mobile logo */}
      <Link href="/" className="mb-8 flex w-fit items-center gap-3 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 font-semibold text-sm text-white">
          D
        </span>
        <span className="font-semibold text-slate-950 tracking-tight">
          Datalk
        </span>
      </Link>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
        <h1 className="font-semibold text-2xl text-slate-950 tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-slate-500 text-sm leading-6">{subtitle}</p>

        <div className="mt-7">{children}</div>


      </div>

      <p className="mt-6 text-center text-slate-500 text-sm">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="font-medium text-slate-950 underline underline-offset-4 transition-colors hover:text-slate-600"
        >
          {footerCta}
        </Link>
      </p>

      <p className="mt-8 text-center lg:hidden">
        <Link
          href="/"
          className="text-slate-400 text-xs transition-colors hover:text-slate-600"
        >
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
