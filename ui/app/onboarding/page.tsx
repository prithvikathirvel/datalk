import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getOnboardingForUser } from "@/lib/onboarding-store";
import { getSessionUser } from "@/lib/session";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  title: "Tell us about you · Datalk",
  description:
    "Help us understand where our users are from and how they found Datalk.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteUrl}/onboarding` },
};

const benefits = [
  {
    title: "Country & discovery",
    body: "Two quick questions so we can serve teams like yours better.",
  },
  {
    title: "Fully skippable",
    body: "Short on time? Skip it now and finish anytime from Settings.",
  },
  {
    title: "You stay in control",
    body: "Your answers are editable later and never shared externally.",
  },
];

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const initial = await getOnboardingForUser(user.id);

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 px-12 py-11 text-white xl:px-16 lg:flex">
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
            One minute that helps us build for you.
          </h2>
          <p className="mt-4 text-[0.9375rem] text-slate-400 leading-7">
            Tell us where you&apos;re from and how you found Datalk —
            that&apos;s it. Then jump straight into your workspace.
          </p>

          <ol className="mt-10 border-white/10 border-t">
            {benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="dk-animate-fade-up flex gap-4 border-white/10 border-b py-4"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="mt-0.5 font-medium text-[11px] text-white/35 tabular-nums tracking-widest">
                  0{index + 1}
                </span>
                <div>
                  <p className="font-medium text-[0.9375rem] text-white leading-6">
                    {benefit.title}
                  </p>
                  <p className="mt-1 text-slate-400 text-sm leading-6">
                    {benefit.body}
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
            Free forever plan · No credit card
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col bg-white px-6 py-8 sm:px-10 lg:min-h-0 lg:px-14">
        <div className="hidden justify-end lg:flex">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-slate-900"
          >
            <span aria-hidden="true">&larr;</span> Back to dashboard
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10 lg:py-0">
          <div className="dk-animate-fade-up w-full max-w-[26rem]">
            <Link
              href="/"
              className="mb-10 flex w-fit items-center gap-3 lg:hidden"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 font-semibold text-[13px] text-white">
                D
              </span>
              <span className="font-semibold text-[15px] text-slate-950 tracking-tight">
                Datalk
              </span>
            </Link>

            <p className="font-medium text-[11px] text-slate-400 uppercase tracking-[0.18em]">
              {initial ? "Your profile" : "Almost there"}
            </p>
            <h1 className="mt-3 font-semibold text-[1.75rem] text-slate-950 leading-tight tracking-tight">
              {initial ? "Update your details" : "Tell us a little about you"}
            </h1>
            <p className="mt-2.5 text-[0.9375rem] text-slate-500 leading-7">
              {initial
                ? "Your answers help us improve Datalk. You can change them anytime."
                : "Where are you from and how did you find us? It only takes a minute."}
            </p>

            <div className="mt-8">
              <OnboardingForm user={user} initial={initial} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
