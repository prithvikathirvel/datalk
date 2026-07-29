import Link from "next/link";
import type { ReactNode } from "react";

const steps = [
  "Upload your documents",
  "Datalk indexes them for you",
  "Paste one line and go live",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafb] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div
          className="dk-animate-float pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -bottom-28 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden="true"
        />

        <Link href="/" className="relative flex w-fit items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 font-semibold text-sm text-white ring-1 ring-white/15">
            D
          </span>
          <span className="font-semibold text-lg tracking-tight">Datalk</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-semibold text-3xl leading-tight tracking-tight">
            Turn your Sources into AI that answers customers.
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-7">
            Upload the Source and help pages you already have. Datalk reads them,
            learns them, and gives you a chatbot you can paste into your website
            today.
          </p>

          <ol className="mt-9 space-y-3">
            {steps.map((step, index) => (
              <li
                key={step}
                className="dk-animate-fade-up flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-slate-200 text-sm ring-1 ring-white/10"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-[11px] text-slate-950">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="relative flex items-center justify-between text-slate-500 text-xs">
          <p>&copy; 2026 Datalk</p>
          <p>Live in 10 minutes &middot; No credit card</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen items-center justify-center p-6 lg:min-h-0">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-slate-200/70 lg:block"
          aria-hidden="true"
        />
        {children}
      </main>
    </div>
  );
}
