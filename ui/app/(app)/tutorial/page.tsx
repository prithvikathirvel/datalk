import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide · Datalk",
  robots: { index: false, follow: false },
};

const features = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
    what: "Your workspace at a glance — document count, conversation activity, active chatbots, and a getting-started checklist that tracks your progress.",
    when: "Land here every time you sign in. It answers one question: “where is my knowledge base right now?”",
  },
  {
    title: "Documents",
    href: "/documents",
    icon: (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />
    ),
    what: "Upload PDFs, Word documents, or website URLs. Datalk splits each file into searchable chunks, indexes the meaning behind the words, and makes them retrievable by the chatbot.",
    when: "Start here when you join. The more high-quality sources you add, the better your assistant answers.",
  },
  {
    title: "Chat",
    href: "/chat",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
    what: "Ask questions about your knowledge base in natural language. Every answer is grounded in your documents and cites the exact sources it came from.",
    when: "Use it to test your knowledge base before going live — ask the questions your real customers will ask.",
  },
  {
    title: "Chatbot Studio",
    href: "/studio",
    icon: <path d="M16 18l6-6-6-6M8 6L2 12l6 6" />,
    what: "Design the customer-facing assistant: bot name, welcome message, primary colour, launcher label, suggested questions, and fallback messages for unanswered queries.",
    when: "Use it once your knowledge base is ready. This is where you make the widget feel like part of your brand.",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
    what: "Conversations over time, satisfaction ratings, and usage trends across your deployed chatbots.",
    when: "Check weekly to see adoption and spot questions your assistant isn't answering well.",
  },
  {
    title: "Coverage Lab",
    href: "/quality",
    icon: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
    what: "Paste real customer questions and Datalk classifies each one as Covered, Weak, or Missing based on what your documents retrieve.",
    when: "Run it before you publish. Weak and Missing answers become a to-do list of content to add.",
  },
  {
    title: "Embed chatbot",
    href: "/embed",
    icon: (
      <path d="M8 13v-1a2 2 0 1 1 4 0v1m-6 5h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z" />
    ),
    what: "Create chatbots that live on your own website. Copy a one-line script, paste it before </body>, and the widget appears with everything you configured.",
    when: "The final step. After this, real customers can talk to your knowledge base 24/7.",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: (
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    ),
    what: "Manage your profile, chat model, retrieval settings, and the onboarding details you shared when you signed up.",
    when: "Whenever you want to tune behaviour or update your account details.",
  },
];

const firstTenMinutes = [
  {
    step: "1",
    title: "Upload your first documents",
    body: "Go to Documents and upload a few PDFs or help-centre pages you already have. Datalk processes them in the background.",
    href: "/documents",
    cta: "Upload documents",
  },
  {
    step: "2",
    title: "Verify your knowledge base",
    body: "Open Coverage Lab and paste 5–10 questions your customers actually ask. Fix anything flagged Weak or Missing by uploading more content.",
    href: "/quality",
    cta: "Run a coverage test",
  },
  {
    step: "3",
    title: "Chat with your documents",
    body: "Ask the same questions in Chat and check the answers and source citations. Tweak your wording until every answer feels right.",
    href: "/chat",
    cta: "Test the chat",
  },
  {
    step: "4",
    title: "Build and publish your chatbot",
    body: "In Chatbot Studio, brand the widget, then copy the one-line embed script into your website. Done — you're live.",
    href: "/studio",
    cta: "Open the studio",
  },
];

export default function TutorialPage() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Guide</h1>
          <p className="text-slate-400 text-xs">
            Everything in Datalk, explained in plain English
          </p>
        </div>
        <Link
          href="/dashboard?tour=1"
          className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-sm text-white transition-colors hover:bg-slate-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Take the interactive tour
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-10 p-6 pb-16">
          {/* Welcome */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
              Welcome aboard
            </p>
            <h2 className="mt-2 font-semibold text-2xl tracking-tight sm:text-3xl">
              From zero to a live chatbot in ~10 minutes
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
              Datalk turns the documents you already have into an AI assistant
              that answers your customers with cited sources. Follow the
              checklist below, or take the interactive tour to see each feature
              highlighted right on the dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["No code required", "No model training", "Cancel anytime"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </section>

          {/* First 10 minutes */}
          <section>
            <h2 className="font-semibold text-slate-950 text-lg">
              Your first 10 minutes
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Four steps, in order. Each one unlocks the next.
            </p>
            <ol className="mt-5 space-y-4">
              {firstTenMinutes.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-semibold text-sm text-white">
                    {item.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-[13px] leading-6 text-slate-500">
                      {item.body}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {item.cta}
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Feature glossary */}
          <section>
            <h2 className="font-semibold text-slate-950 text-lg">
              What every section does
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              A quick tour of the left-hand menu.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[18px] w-[18px] text-slate-700"
                        aria-hidden="true"
                      >
                        {feature.icon}
                      </svg>
                    </span>
                    <h3 className="font-medium text-slate-950">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-slate-600">
                    <span className="font-medium text-slate-800">
                      What it is:{" "}
                    </span>
                    {feature.what}
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-slate-500">
                    <span className="font-medium text-slate-800">
                      When to use it:{" "}
                    </span>
                    {feature.when}
                  </p>
                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900"
                  >
                    Open {feature.title}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="font-semibold text-slate-950">Pro tips</h2>
            <ul className="mt-4 space-y-3 text-[13px] leading-6 text-slate-600">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                Upload files as{" "}
                <span className="font-medium">both raw and processed</span> —
                raw keeps the original for the widget, processed powers semantic
                search.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                Keep documents focused: one topic per file usually retrieves
                better than one giant file.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                Use the Knowledge-gap inbox: when visitors say an answer
                wasn&apos;t helpful, that question becomes a content task for
                you.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                You can always redo the onboarding questions from Settings →
                About you.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
