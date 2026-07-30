import Link from "next/link";
import type { ReactNode } from "react";

const steps = [
  {
    title: "Upload your documents",
    body: "PDFs, help centre pages, or any URL you already have.",
  },
  {
    title: "Datalk indexes them",
    body: "We chunk, embed and verify every source automatically.",
  },
  {
    title: "Paste one line, go live",
    body: "A branded assistant on your site in under ten minutes.",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Brand panel — desktop only                                        */}
      {/* ---------------------------------------------------------------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 px-12 py-11 text-white xl:px-16 lg:flex">
        {/* hairline grid, matches the framed look of the landing page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_20%_0%,rgba(255,255,255,0.10),transparent_70%)]"
        />

        <Link href="/" className="relative flex w-fit items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-semibold text-[13px] text-slate-950">
            D
          </span>
          <span className="font-semibold text-[15px] tracking-tight">
            Datalk
          </span>
          <span className="rounded border border-white/15 px-1.5 py-0.5 font-medium text-[10px] text-white/60 uppercase tracking-widest">
            Beta
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-balance font-semibold text-[2rem] leading-[1.18] tracking-tight">
            Turn your sources into AI that answers customers.
          </h2>
          <p className="mt-4 text-[0.9375rem] text-slate-400 leading-7">
            Upload the docs and help pages you already have. Datalk reads them,
            learns them, and hands you a chatbot you can ship today.
          </p>

          <ol className="mt-10 border-white/10 border-t">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="dk-animate-fade-up flex gap-4 border-white/10 border-b py-4"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="mt-0.5 font-medium text-[11px] text-white/35 tabular-nums tracking-widest">
                  0{index + 1}
                </span>
                <div>
                  <p className="font-medium text-[0.9375rem] text-white leading-6">
                    {step.title}
                  </p>
                  <p className="mt-1 text-slate-400 text-sm leading-6">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative flex items-center justify-between text-[13px] text-slate-500">
          <p>&copy; 2026 Datalk</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live in 10 minutes · No credit card
          </p>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Form panel                                                        */}
      {/* ---------------------------------------------------------------- */}
      <main className="relative flex min-h-screen flex-col bg-white px-6 py-8 sm:px-10 lg:min-h-0 lg:px-14">
        <div className="hidden justify-end lg:flex">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-slate-900"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10 lg:py-0">
          {children}
        </div>
      </main>
    </div>
  );
}
