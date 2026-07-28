import { Badge } from "@template/ui";
import Link from "next/link";
import { OnboardingFlowSection } from "./onboarding-flow";
import {
  BeforeAfterSection,
  FaqSection,
  OnboardingCta,
  OutcomeStrip,
  UseCaseMarquee,
} from "./onboarding-support";

const features = [
  {
    title: "Document ingestion",
    description:
      "Upload, process, and verify knowledge before it reaches your chatbot.",
    metric: "2.4k",
    label: "chunks indexed",
  },
  {
    title: "Embeddable chatbot",
    description:
      "Ship a branded assistant to any website with one secure script tag.",
    metric: "99.9%",
    label: "widget uptime",
  },
  {
    title: "Coverage testing",
    description:
      "Test customer questions and find missing answers before visitors do.",
    metric: "87%",
    label: "answer readiness",
  },
];

const workflow = [
  "Upload processed documents",
  "Validate retrieval coverage",
  "Customize the website widget",
  "Monitor knowledge gaps",
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fafafb] text-slate-950">
      <div className="relative mx-auto w-full max-w-[1360px] px-6 md:px-10 lg:px-16">
        <FrameLines />
        <HeroSection />
        <UseCaseMarquee />
        <OnboardingFlowSection />
        <OutcomeStrip />
        <BeforeAfterSection />
        <FaqSection />
        <PricingSection />
        <OnboardingCta />
        <Footer />
      </div>
    </main>
  );
}

function FrameLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute top-0 bottom-0 left-6 w-px bg-slate-200/70 md:left-10 lg:left-16" />
      <div className="absolute top-0 right-6 bottom-0 w-px bg-slate-200/70 md:right-10 lg:right-16" />
    </div>
  );
}

function SectionDivider({ top = true }: { top?: boolean }) {
  return (
    <>
      {top ? (
        <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />
      ) : null}
      <div className="absolute top-0 left-0 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <div className="absolute h-3.5 w-3.5 rounded-full border border-slate-300" />
      </div>
      <div className="absolute top-0 right-0 hidden h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center md:flex">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <div className="absolute h-3.5 w-3.5 rounded-full border border-slate-300" />
      </div>
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative z-10 pb-20 md:pb-15 p-5">
      <nav className="mb-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 font-semibold text-white">
            D
          </div>
          <span className="font-semibold text-slate-950">Datalk</span>
        </Link>
        <div className="hidden items-center gap-7 text-slate-500 text-sm md:flex">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-slate-950"
          >
            How it works
          </a>
          <a href="#faq" className="transition-colors hover:text-slate-950">
            FAQ
          </a>
          <a href="#pricing" className="transition-colors hover:text-slate-950">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-full px-4 py-2 font-medium text-slate-600 text-sm transition-colors hover:text-slate-950 sm:inline-flex"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-full bg-slate-950 px-4 py-2 font-medium text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            href="/signup"
          >
            Start free
          </Link>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-6">
          <span className="dk-animate-fade-up inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 text-xs shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="dk-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live in 10 minutes · No code required
          </span>
          <h1
            className="dk-animate-fade-up mt-6 max-w-3xl font-semibold text-5xl text-slate-950 tracking-tight md:text-6xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Turn your documents into AI that answers customers.
          </h1>
          <p
            className="dk-animate-fade-up mt-6 max-w-2xl text-lg text-slate-500 leading-8"
            style={{ animationDelay: "160ms" }}
          >
            Upload the PDFs and help pages you already have. Datalk reads them,
            learns them, and gives you a chatbot you can paste into your website
            today — with every answer backed by a real source.
          </p>
          <div
            className="dk-animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              className="rounded-full bg-slate-950 px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              href="/signup"
            >
              Start free — upload your first doc
            </Link>
            <a
              className="rounded-full border border-slate-200 bg-white px-6 py-3 font-medium text-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              href="#how-it-works"
            >
              See how it works
            </a>
          </div>
          <div
            className="dk-animate-fade-up mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400 text-sm"
            style={{ animationDelay: "320ms" }}
          >
            {[
              "No credit card",
              "No model training",
              "Delete your data anytime",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-3 w-3 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          className="dk-animate-fade-up lg:col-span-6"
          style={{ animationDelay: "200ms" }}
        >
          <HeroProductCard />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <MiniHeroCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

function HeroProductCard() {
  return (
    <div className="group relative transition-transform duration-300 hover:-translate-y-1">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-3 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28),inset_0_1px_0_white] transition-shadow duration-300 group-hover:shadow-[0_28px_90px_-30px_rgba(15,23,42,0.34)]">
        <div className="overflow-hidden rounded-[1.5rem] border border-white bg-gradient-to-b from-slate-50 to-white shadow-[inset_0_2px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-slate-200 border-b bg-white/80 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 font-semibold text-sm text-white">
                D
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-slate-950 text-sm">
                  Datalk Assistant
                </p>
                <p className="text-slate-400 text-xs">
                  Answers from 1,284 documents
                </p>
              </div>
            </div>
            <Badge variant="success">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live widget
            </Badge>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-slate-950 px-4 py-3 shadow-sm">
                <p className="text-sm text-white leading-6">
                  Can I get a refund after 30 days?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-semibold text-white text-xs">
                D
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-slate-600 text-sm leading-6">
                  Yes — annual plans are refundable within{" "}
                  <span className="font-medium text-slate-950">45 days</span> of
                  purchase. Monthly plans can be cancelled anytime and stay
                  active until the end of the billing cycle.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <SourceChip name="Refund-Policy.pdf" page="p. 4" />
                  <SourceChip name="Terms.pdf" page="p. 2" />
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 text-xs ring-1 ring-emerald-200">
                    <CheckIcon />
                    0.94 confidence
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div className="inline-flex items-center rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-slate-400 text-sm">
                Searching documents…
              </div>
            </div>
          </div>

          <div className="border-slate-200 border-t bg-white/70 px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {["Cancellation timeline", "Enterprise pricing"].map(
                (question) => (
                  <button
                    key={question}
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-500 text-xs transition-colors hover:border-slate-300 hover:text-slate-950"
                  >
                    {question}
                  </button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-2 pr-2 pl-4 shadow-sm">
              <span className="flex-1 truncate text-slate-400 text-sm">
                Ask your documents…
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white transition-transform duration-300 group-hover:rotate-12">
                <SendIcon />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="absolute -top-5 -right-3 z-20 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.25)] md:flex">
        <CoverageRing />
        <div>
          <p className="font-semibold text-slate-950 text-sm">87% coverage</p>
          <p className="text-slate-400 text-xs">42 questions tested</p>
        </div>
      </div> */}

      {/* <div className="absolute -bottom-6 -left-4 z-20 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.25)] md:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
          <CheckIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-slate-950 text-sm">Source verified</p>
          <p className="text-slate-400 text-xs">Refund-Policy.pdf · chunk #418</p>
        </div>
      </div> */}
    </div>
  );
}

function SourceChip({ name, page }: { name: string; page: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-slate-500 text-xs">
      <svg
        className="h-3.5 w-3.5 text-slate-400"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 1.5h4.5L12 5V14.5H4V1.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 1.5V5H12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      {name} · {page}
    </span>
  );
}

function CoverageRing() {
  const circumference = 2 * Math.PI * 20;
  return (
    <svg
      className="h-12 w-12 -rotate-90"
      viewBox="0 0 48 48"
      role="img"
      aria-label="Retrieval coverage ring showing 87 percent"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="6"
      />
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="#0f172a"
        strokeLinecap="round"
        strokeWidth="6"
        strokeDasharray={`${circumference * 0.87} ${circumference}`}
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-3 w-3"}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 6.4 4.6 9 10 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M17 3 3 10.2l6.6.5L17 17l0-14Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="M9.6 10.7 17 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function MiniHeroCard({
  title,
  description,
  metric,
  label,
}: {
  title: string;
  description: string;
  metric: string;
  label: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.2),inset_0_1px_0_white] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="rounded-[1.25rem] border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-slate-500 text-sm leading-6">
              {description}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-3 py-2 font-semibold text-sm text-white">
            {metric}
          </div>
        </div>
        <div className="h-16 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-emerald-600">healthy</span>
          </div>
          <div className="flex h-7 items-end gap-1.5">
            {[42, 56, 48, 66, 74, 62, 84, 78].map((height, index) => (
              <div
                key={`${label}-${height}-${index}`}
                className="flex-1 rounded-t bg-slate-900/80"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSection() {
  return (
    <section id="platform" className="relative z-10 py-24 p-5">
      <SectionDivider />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <Badge variant="outline">Product interface</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">
            A complete operating system for RAG quality.
          </h2>
          <p className="mt-4 text-slate-500 leading-7">
            Manage ingestion, retrieval readiness, embedded deployments, and
            feedback loops from one clean workspace.
          </p>
        </div>
        <div className="lg:col-span-8">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-slate-200 border-b pb-4">
        <div>
          <p className="font-semibold text-slate-950">Workspace analytics</p>
          <p className="text-slate-500 text-sm">
            Documents, retrieval, and embedded chatbot performance
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsCard label="Documents indexed" value="1,284" change="+12%" />
        <AnalyticsCard
          label="Widget conversations"
          value="8,402"
          change="+31%"
        />
        <AnalyticsCard label="Human handoffs" value="142" change="-8%" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-950 text-sm">
                Retrieval confidence
              </p>
              <p className="text-slate-400 text-xs">
                Score distribution by week
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Legend color="bg-slate-950" label="Covered" />
              <Legend color="bg-amber-500" label="Weak" />
            </div>
          </div>
          <BarChart />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-medium text-slate-950 text-sm">Activity feed</p>
          <div className="mt-4 space-y-3">
            {[
              ["Policy.pdf processed", "1,420 chunks"],
              ["Pricing question covered", "0.91 confidence"],
              ["Embed installed", "docs.example.com"],
              ["Gap detected", "Refund exceptions"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                <div>
                  <p className="font-medium text-slate-700 text-sm">{title}</p>
                  <p className="text-slate-400 text-xs">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureSection() {
  return (
    <section className="relative z-10 py-24 p-5">
      <SectionDivider />
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline">Capabilities</Badge>
        <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">
          Everything required to publish reliable document AI.
        </h2>
        <p className="mt-4 text-slate-500 leading-7">
          Designed for teams that need more than a chatbot demo.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeatureCard
          title="Secure tenant auth"
          description="JWT proxy architecture keeps tokens server-side while your backends receive user-scoped sub claims."
        />
        <FeatureCard
          title="Website embed studio"
          description="Customize color, launcher, origins, welcome prompts, and fallback paths without engineering help."
        />
        <FeatureCard
          title="Coverage lab"
          description="Run customer question sets against semantic search and prioritize content gaps before launch."
        />
        <FeatureCard
          title="Knowledge gap inbox"
          description="Every weak answer becomes an actionable backlog item for improving source documents."
        />
        <FeatureCard
          title="Retrieval testing"
          description="Inspect top chunks, scores, document IDs, and page metadata from the same workflow."
        />
        <FeatureCard
          title="Clean SaaS workspace"
          description="Minimal, focused screens for documents, chat, embeds, settings, and readiness checks."
        />
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-5 h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50" />
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-slate-500 text-sm leading-6">{description}</p>
    </div>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="relative z-10 py-24 p-5">
      <SectionDivider />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <Badge variant="outline">How it works</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">
            From documents to production chatbot in four steps.
          </h2>
        </div>
        <div className="lg:col-span-7">
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 font-semibold text-white text-sm">
                  {index + 1}
                </div>
                <p className="font-semibold text-slate-950">{step}</p>
                <p className="mt-2 text-slate-500 text-sm leading-6">
                  A focused workflow that keeps quality visible before and after
                  launch.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 py-24 p-5">
      <SectionDivider />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Badge variant="outline">Pricing</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">
            Start small. Publish when ready.
          </h2>
          <p className="mt-4 text-slate-500 leading-7">
            Use the built-in local auth for demos, then connect production
            billing and database storage when you deploy.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="font-semibold text-2xl text-slate-950">
                  Professional workspace
                </p>
                <p className="mt-2 text-slate-500">
                  Documents, chat, embed builder, coverage lab, and gap inbox.
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-semibold text-4xl text-slate-950">Custom</p>
                <p className="text-slate-400 text-sm">bring your backends</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                "Unlimited local workspaces",
                "Secure JWT backend proxy",
                "Embeddable chatbot widget",
                "Knowledge gap feedback loop",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-slate-700 text-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative z-10 py-24 p-5">
      <SectionDivider />
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm md:p-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="font-semibold text-4xl tracking-tight">
              Give your customers answers from the documents you already own.
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300 leading-7">
              Connect your ingestion and chat services, upload processed files,
              and publish a trustworthy embedded assistant.
            </p>
          </div>
          <div className="flex gap-3 lg:col-span-4 lg:justify-end">
            <Link
              className="rounded-full bg-white px-6 py-3 font-medium text-slate-950"
              href="/signup"
            >
              Start now
            </Link>
            <Link
              className="rounded-full border border-white/20 px-6 py-3 font-medium text-white"
              href="/login"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 py-10">
      <SectionDivider />
      <div className="flex flex-col justify-between gap-4 text-slate-500 text-sm md:flex-row md:items-center">
        <p>© 2026 Datalk. Data talk workspace.</p>
        <div className="flex gap-5">
          <Link href="/login" className="hover:text-slate-950">
            Login
          </Link>
          <Link href="/signup" className="hover:text-slate-950">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}

function AnalyticsCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-semibold text-3xl text-slate-950">{value}</p>
        <span
          className={
            change.startsWith("+")
              ? "text-emerald-600 text-xs"
              : "text-red-500 text-xs"
          }
        >
          {change}
        </span>
      </div>
    </div>
  );
}

function BarChart() {
  const values = [72, 84, 78, 91, 86, 94, 88, 96];
  const weak = [22, 16, 19, 12, 15, 9, 13, 7];
  return (
    <div>
      <div className="flex h-56 items-end gap-3 border-slate-200 border-b border-l px-4 pb-4">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div className="flex h-40 w-full items-end gap-1">
              <div
                className="w-1/2 rounded-t bg-slate-950 transition-all duration-500"
                style={{ height: `${value}%` }}
              />
              <div
                className="w-1/2 rounded-t bg-amber-400 transition-all duration-500"
                style={{ height: `${weak[index]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-8 text-center text-slate-400 text-xs">
        {values.map((_, index) => (
          <span key={`week-${index}`}>W{index + 1}</span>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-500">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
