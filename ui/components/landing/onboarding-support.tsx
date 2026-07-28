"use client";

import { Badge } from "@template/ui";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Reveal, useInView } from "./reveal";

/* ------------------------------------------------------------------ */
/* Value strip — animated counters                                     */
/* ------------------------------------------------------------------ */

const outcomes = [
  {
    value: 10,
    suffix: " min",
    label: "From signup to live assistant",
    detail: "Median time for a first workspace",
  },
  {
    value: 0,
    suffix: "",
    label: "Lines of code to write",
    detail: "One script tag, copy and paste",
  },
  {
    value: 68,
    suffix: "%",
    label: "Support tickets deflected",
    detail: "Typical after the first month",
  },
  {
    value: 100,
    suffix: "%",
    label: "Answers with cited sources",
    detail: "Every reply links to your document",
  },
];

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    if (target === 0) {
      setValue(0);
      return;
    }
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - began) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, start, duration]);

  return value;
}

export function OutcomeStrip() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });

  return (
    <section className="relative z-10 py-20 p-5">
      <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />
      <div ref={ref} className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {outcomes.map((outcome, index) => (
          <OutcomeCard
            key={outcome.label}
            outcome={outcome}
            inView={inView}
            delay={index * 110}
          />
        ))}
      </div>
    </section>
  );
}

function OutcomeCard({
  outcome,
  inView,
  delay,
}: {
  outcome: (typeof outcomes)[number];
  inView: boolean;
  delay: number;
}) {
  const count = useCountUp(outcome.value, inView);

  return (
    <div
      className="dk-reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      data-visible={inView ? "true" : "false"}
      style={{ "--dk-delay": `${delay}ms` } as React.CSSProperties}
    >
      <p className="font-semibold text-4xl text-slate-950 tabular-nums tracking-tight">
        {count}
        {outcome.suffix}
      </p>
      <p className="mt-3 font-medium text-slate-800 text-sm leading-6">
        {outcome.label}
      </p>
      <p className="mt-1 text-slate-400 text-xs leading-5">{outcome.detail}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Before / after comparison                                           */
/* ------------------------------------------------------------------ */

const before = [
  "Customers wait hours for a reply to a question already answered in your docs",
  "Your team copies and pastes the same policy paragraph every day",
  "Adding AI means hiring engineers, picking vendors, and months of work",
  "Nobody knows which questions your content fails to answer",
];

const after = [
  "Customers get an instant, sourced answer at 2am",
  "Your team handles only the genuinely new questions",
  "You upload documents and paste one script tag",
  "Every unanswered question lands in your gap inbox",
];

export function BeforeAfterSection() {
  return (
    <section className="relative z-10 py-24 p-5">
      <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />
      <Reveal className="mx-auto max-w-3xl text-center">
        <Badge variant="outline">Why teams switch</Badge>
        <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">
          What changes on day one.
        </h2>
        <p className="mt-4 text-slate-500 leading-7">
          The same documents you already maintain, doing far more work for you.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Reveal delay={80}>
          <div className="h-full rounded-3xl border border-slate-200 bg-white p-7">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <p className="font-semibold text-slate-500">Without Datalk</p>
            </div>
            <ul className="mt-6 space-y-4">
              {before.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-slate-500 text-sm leading-6"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="relative h-full overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 p-7 text-white">
            <div className="dk-animate-float pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6.4 4.6 9 10 3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <p className="font-semibold">With Datalk</p>
            </div>
            <ul className="mt-6 space-y-4">
              {after.map((item, index) => (
                <li
                  key={item}
                  className="dk-animate-fade-up flex gap-3 text-slate-200 text-sm leading-6"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6.4 4.6 9 10 3"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Objection handling FAQ                                              */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    question: "I am not technical. Can I really set this up myself?",
    answer:
      "Yes. If you can upload a file and paste a line into your website editor, you can launch Datalk. Everything else — reading, indexing, and answering — happens automatically. Most first-time users finish in under ten minutes.",
  },
  {
    question: "What if the assistant makes something up?",
    answer:
      "Datalk only answers from the documents you upload, and every reply shows the exact file and page it came from. When confidence is low, the assistant says it does not know and logs the question as a gap for you to fill.",
  },
  {
    question: "How much content do I need to start?",
    answer:
      "One document is enough to see it work. Most teams start with an FAQ or policy PDF, watch the first answers, then add more sources over the following week.",
  },
  {
    question: "Where does my data live and who can see it?",
    answer:
      "Your documents stay inside your own workspace. Access is scoped per tenant, tokens never reach the browser, and you can delete any source — and everything indexed from it — at any time.",
  },
  {
    question: "What happens after I go live?",
    answer:
      "The dashboard shows every question asked, how confident the answer was, and which topics your content misses. You improve the documents, and the assistant improves with them.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 py-24 p-5">
      <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Badge variant="outline">Before you sign up</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">
            The questions new customers ask us.
          </h2>
          <p className="mt-4 text-slate-500 leading-7">
            Still unsure? Create a workspace, upload one file, and see the
            answers yourself.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 font-medium text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            href="/signup"
          >
            Try it with one document
          </Link>
        </Reveal>

        <div className="lg:col-span-8">
          <div className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {faqs.map((faq, index) => {
              const isOpen = open === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`flex-1 font-medium transition-colors ${isOpen ? "text-slate-950" : "text-slate-700"}`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-transform duration-300 ${
                        isOpen
                          ? "rotate-45 border-slate-950 bg-slate-950 text-white"
                          : ""
                      }`}
                    >
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 2v8M2 6h8"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-400 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-slate-500 text-sm leading-7">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Use-case marquee                                                    */
/* ------------------------------------------------------------------ */

const useCases = [
  "Customer support deflection",
  "Employee handbook Q&A",
  "Product documentation search",
  "Onboarding new hires",
  "Policy and compliance lookups",
  "Sales enablement answers",
  "Partner and reseller portals",
  "Course and training material",
];

const marqueeItems = [...useCases, ...useCases].map((label, index) => ({
  id: `use-case-${index}-${label}`,
  label,
}));

export function UseCaseMarquee() {
  return (
    <section className="relative z-10 py-16 p-5">
      <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />
      <p className="text-center text-slate-400 text-sm">
        Teams start with one of these on day one
      </p>
      <div className="dk-marquee-mask mt-6 overflow-hidden">
        <div className="dk-animate-marquee flex w-max gap-3">
          {marqueeItems.map((item) => (
            <span
              key={item.id}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-slate-600 text-sm shadow-sm"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final onboarding CTA                                                */
/* ------------------------------------------------------------------ */

export function OnboardingCta() {
  return (
    <section className="relative z-10 py-24 p-5">
      <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 p-8 text-white md:p-14">
          <div className="dk-animate-float pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Badge
                variant="outline"
                className="bg-white/10 text-white ring-white/20"
              >
                Free to start
              </Badge>
              <h2 className="mt-5 font-semibold text-4xl tracking-tight md:text-5xl">
                Your first answer is ten minutes away.
              </h2>
              <p className="mt-4 max-w-xl text-slate-300 leading-7">
                Create a workspace, upload a single document, and ask it a
                question. If it does not feel useful in the first session, you
                have lost nothing but ten minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-white px-6 py-3 font-medium text-slate-950 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  href="/signup"
                >
                  Create free workspace
                </Link>
                <Link
                  className="rounded-full border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
                  href="/login"
                >
                  I already have an account
                </Link>
              </div>
              <p className="mt-4 text-slate-400 text-xs">
                No credit card · No sales call · Delete your data anytime
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="font-medium text-sm text-white">
                  Your first session, step by step
                </p>
                {[
                  "Sign up with email or Google",
                  "Upload one document",
                  "Ask it a real customer question",
                  "Copy the embed snippet",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="dk-animate-fade-up flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3"
                    style={{ animationDelay: `${index * 140}ms` }}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-[11px] text-slate-950">
                      {index + 1}
                    </span>
                    <span className="text-slate-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
