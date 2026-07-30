import Link from "next/link";
import type { ReactNode } from "react";

type AuthMode = "login" | "signup";

const copy: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    footerText: string;
    footerCta: string;
    footerHref: string;
  }
> = {
  login: {
    eyebrow: "Sign in",
    title: "Welcome back",
    subtitle: "Continue with Google to open your workspace.",
    footerText: "New to Datalk?",
    footerCta: "Create a free workspace",
    footerHref: "/signup",
  },
  signup: {
    eyebrow: "Get started",
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
  const { eyebrow, title, subtitle, footerText, footerCta, footerHref } =
    copy[mode];

  return (
    <div className="dk-animate-fade-up w-full max-w-[26rem]">
      {/* Mobile logo — the desktop brand panel is hidden on small screens */}
      <Link href="/" className="mb-10 flex w-fit items-center gap-3 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 font-semibold text-[13px] text-white">
          D
        </span>
        <span className="font-semibold text-[15px] text-slate-950 tracking-tight">
          Datalk
        </span>
      </Link>

      <p className="font-medium text-[11px] text-slate-400 uppercase tracking-[0.18em]">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-semibold text-[1.75rem] text-slate-950 leading-tight tracking-tight">
        {title}
      </h1>
      <p className="mt-2.5 text-[0.9375rem] text-slate-500 leading-7">
        {subtitle}
      </p>

      <div className="mt-8">{children}</div>

      <div className="mt-8 border-slate-200 border-t pt-5">
        <p className="text-[0.9375rem] text-slate-500">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900"
          >
            {footerCta}
          </Link>
        </p>
      </div>

      <p className="mt-10 lg:hidden">
        <Link
          href="/"
          className="text-slate-400 text-[13px] transition-colors hover:text-slate-900"
        >
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
