import Link from "next/link";
import { Badge } from "@template/ui";

const features = [
  {
    title: "Document ingestion",
    description: "Upload, process, and verify knowledge before it reaches your chatbot.",
    metric: "2.4k",
    label: "chunks indexed",
  },
  {
    title: "Embeddable chatbot",
    description: "Ship a branded assistant to any website with one secure script tag.",
    metric: "99.9%",
    label: "widget uptime",
  },
  {
    title: "Coverage testing",
    description: "Test customer questions and find missing answers before visitors do.",
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
        <DashboardSection />
        <FeatureSection />
        <WorkflowSection />
        <PricingSection />
        <CtaSection />
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
      {top ? <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" /> : null}
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
    <section className="relative z-10 pt-10 pb-20 md:pt-16 md:pb-24">
      <nav className="mb-20 flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 font-semibold text-white">D</div>
          <span className="font-semibold text-slate-950">Datalk</span>
        </Link>
        <div className="hidden items-center gap-7 text-slate-500 text-sm md:flex">
          <a href="#platform" className="transition-colors hover:text-slate-950">
            Platform
          </a>
          <a href="#workflow" className="transition-colors hover:text-slate-950">
            Workflow
          </a>
          <a href="#pricing" className="transition-colors hover:text-slate-950">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link className="hidden rounded-full px-4 py-2 font-medium text-slate-600 text-sm transition-colors hover:text-slate-950 sm:inline-flex" href="/login">
            Login
          </Link>
          <Link className="rounded-full bg-slate-950 px-4 py-2 font-medium text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-lg" href="/signup">
            Start free
          </Link>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-6">
          <Badge variant="outline">Document AI infrastructure</Badge>
          <h1 className="mt-6 max-w-3xl font-semibold text-5xl text-slate-950 tracking-tight md:text-6xl lg:text-7xl">
            Launch a document chatbot your customers can trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-500 leading-8">
            A professional SaaS workspace for ingestion, retrieval testing, embedded chatbots, and knowledge-gap improvement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-full bg-slate-950 px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-xl" href="/signup">
              Create workspace
            </Link>
            <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 font-medium text-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-lg" href="/login">
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
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
    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-3 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28),inset_0_1px_0_white] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-30px_rgba(15,23,42,0.34)]">
      <div className="rounded-[1.5rem] border border-white bg-gradient-to-br from-slate-50 to-white p-5 shadow-[inset_0_2px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-slate-200 border-b pb-4">
          <div>
            <p className="font-medium text-slate-950 text-sm">Answer Quality</p>
            <p className="text-slate-500 text-xs">Last 7 days</p>
          </div>
          <Badge variant="success">+18%</Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_160px]">
          <LineChart />
          <div className="space-y-3">
            <MetricTile label="Covered" value="87%" color="bg-emerald-500" />
            <MetricTile label="Weak" value="9%" color="bg-amber-500" />
            <MetricTile label="Missing" value="4%" color="bg-red-500" />
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium text-slate-700 text-sm">Knowledge gaps</span>
            <span className="text-slate-400 text-xs">auto-detected</span>
          </div>
          <div className="space-y-2">
            {[
              ["Refund conditions", "Needs source"],
              ["Cancellation timeline", "Weak answer"],
              ["Regional pricing", "Missing"],
            ].map(([title, status]) => (
              <div key={title} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-slate-700 text-sm">{title}</span>
                <span className="text-slate-400 text-xs">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniHeroCard({ title, description, metric, label }: { title: string; description: string; metric: string; label: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.2),inset_0_1px_0_white] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="rounded-[1.25rem] border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-slate-500 text-sm leading-6">{description}</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-3 py-2 font-semibold text-sm text-white">{metric}</div>
        </div>
        <div className="h-16 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-emerald-600">healthy</span>
          </div>
          <div className="flex h-7 items-end gap-1.5">
            {[42, 56, 48, 66, 74, 62, 84, 78].map((height, index) => (
              <div key={`${label}-${height}-${index}`} className="flex-1 rounded-t bg-slate-900/80" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSection() {
  return (
    <section id="platform" className="relative z-10 py-24">
      <SectionDivider />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <Badge variant="outline">Product interface</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">A complete operating system for RAG quality.</h2>
          <p className="mt-4 text-slate-500 leading-7">
            Manage ingestion, retrieval readiness, embedded deployments, and feedback loops from one clean workspace.
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
          <p className="text-slate-500 text-sm">Documents, retrieval, and embedded chatbot performance</p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsCard label="Documents indexed" value="1,284" change="+12%" />
        <AnalyticsCard label="Widget conversations" value="8,402" change="+31%" />
        <AnalyticsCard label="Human handoffs" value="142" change="-8%" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-950 text-sm">Retrieval confidence</p>
              <p className="text-slate-400 text-xs">Score distribution by week</p>
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
              <div key={title} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
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
    <section className="relative z-10 py-24">
      <SectionDivider />
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline">Capabilities</Badge>
        <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">Everything required to publish reliable document AI.</h2>
        <p className="mt-4 text-slate-500 leading-7">Designed for teams that need more than a chatbot demo.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeatureCard title="Secure tenant auth" description="JWT proxy architecture keeps tokens server-side while your backends receive user-scoped sub claims." />
        <FeatureCard title="Website embed studio" description="Customize color, launcher, origins, welcome prompts, and fallback paths without engineering help." />
        <FeatureCard title="Coverage lab" description="Run customer question sets against semantic search and prioritize content gaps before launch." />
        <FeatureCard title="Knowledge gap inbox" description="Every weak answer becomes an actionable backlog item for improving source documents." />
        <FeatureCard title="Retrieval testing" description="Inspect top chunks, scores, document IDs, and page metadata from the same workflow." />
        <FeatureCard title="Clean SaaS workspace" description="Minimal, focused screens for documents, chat, embeds, settings, and readiness checks." />
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
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
    <section id="workflow" className="relative z-10 py-24">
      <SectionDivider />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <Badge variant="outline">How it works</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">From documents to production chatbot in four steps.</h2>
        </div>
        <div className="lg:col-span-7">
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 font-semibold text-white text-sm">{index + 1}</div>
                <p className="font-semibold text-slate-950">{step}</p>
                <p className="mt-2 text-slate-500 text-sm leading-6">A focused workflow that keeps quality visible before and after launch.</p>
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
    <section id="pricing" className="relative z-10 py-24">
      <SectionDivider />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Badge variant="outline">Pricing</Badge>
          <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight">Start small. Publish when ready.</h2>
          <p className="mt-4 text-slate-500 leading-7">Use the built-in local auth for demos, then connect production billing and database storage when you deploy.</p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="font-semibold text-2xl text-slate-950">Professional workspace</p>
                <p className="mt-2 text-slate-500">Documents, chat, embed builder, coverage lab, and gap inbox.</p>
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
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-slate-700 text-sm">
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
    <section className="relative z-10 py-24">
      <SectionDivider />
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm md:p-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="font-semibold text-4xl tracking-tight">Give your customers answers from the documents you already own.</h2>
            <p className="mt-4 max-w-2xl text-slate-300 leading-7">Connect your ingestion and chat services, upload processed files, and publish a trustworthy embedded assistant.</p>
          </div>
          <div className="flex gap-3 lg:col-span-4 lg:justify-end">
            <Link className="rounded-full bg-white px-6 py-3 font-medium text-slate-950" href="/signup">
              Start now
            </Link>
            <Link className="rounded-full border border-white/20 px-6 py-3 font-medium text-white" href="/login">
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

function MetricTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-slate-500 text-xs">{label}</span>
      </div>
      <p className="mt-2 font-semibold text-xl text-slate-950">{value}</p>
    </div>
  );
}

function LineChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-slate-500 text-xs">Answer confidence</span>
        <span className="text-emerald-600 text-xs">+14.2%</span>
      </div>
      <svg className="h-44 w-full" viewBox="0 0 420 180" role="img" aria-label="Answer confidence chart">
        <g stroke="#e2e8f0" strokeWidth="1">
          {[30, 70, 110, 150].map((y) => (
            <line key={y} x1="28" x2="410" y1={y} y2={y} />
          ))}
          {[80, 150, 220, 290, 360].map((x) => (
            <line key={x} x1={x} x2={x} y1="16" y2="160" />
          ))}
        </g>
        <path d="M32 132 C80 122 92 80 136 92 C182 106 188 44 236 56 C286 68 302 34 342 38 C374 42 386 30 408 24" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        <path d="M32 132 C80 122 92 80 136 92 C182 106 188 44 236 56 C286 68 302 34 342 38 C374 42 386 30 408 24 L408 160 L32 160 Z" fill="url(#confidenceGradient)" opacity="0.28" />
        <defs>
          <linearGradient id="confidenceGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <g fill="#94a3b8" fontSize="10">
          <text x="28" y="176">Mon</text>
          <text x="138" y="176">Wed</text>
          <text x="248" y="176">Fri</text>
          <text x="358" y="176">Sun</text>
        </g>
      </svg>
    </div>
  );
}

function AnalyticsCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-semibold text-3xl text-slate-950">{value}</p>
        <span className={change.startsWith("+") ? "text-emerald-600 text-xs" : "text-red-500 text-xs"}>{change}</span>
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
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-40 w-full items-end gap-1">
              <div className="w-1/2 rounded-t bg-slate-950 transition-all duration-500" style={{ height: `${value}%` }} />
              <div className="w-1/2 rounded-t bg-amber-400 transition-all duration-500" style={{ height: `${weak[index]}%` }} />
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
