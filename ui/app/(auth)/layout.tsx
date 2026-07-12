import type { ReactNode } from "react";

const features = [
  "Secure JWT-proxied backend",
  "Embeddable chatbot widget",
  "Coverage lab + knowledge gap inbox",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <div className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-bold text-sm text-white">
            D
          </div>
          <span className="font-semibold text-lg tracking-tight">Datalk</span>
        </div>

        <div>
          <p className="font-medium text-2xl leading-9 text-slate-100">
            &ldquo;Launch a document chatbot your customers can trust &mdash; without shipping new infrastructure.&rdquo;
          </p>
          <p className="mt-5 text-slate-400 text-sm leading-7">
            Datalk gives you the full pipeline: ingestion, retrieval testing, an embed studio, and a knowledge-gap feedback loop.
          </p>
        </div>

        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-slate-300 text-sm">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              {feature}
            </div>
          ))}
          <p className="pt-6 text-slate-600 text-xs">&copy; 2026 Datalk</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 lg:min-h-0 lg:bg-white">
        {children}
      </div>
    </div>
  );
}
