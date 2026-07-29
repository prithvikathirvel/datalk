"use client";

import { Badge } from "@template/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "./reveal";

const STEP_DURATION = 5200;

type StepId = "upload" | "understand" | "customize" | "launch";

interface Step {
  id: StepId;
  eyebrow: string;
  title: string;
  description: string;
  duration: string;
  outcome: string;
}

const steps: Step[] = [
  {
    id: "upload",
    eyebrow: "Step 1",
    title: "Drop in what you already have",
    description:
      "Add PDFs, website URLs, help docs, Google Drive links — whatever knowledge you have. No data cleaning, no schema, no engineer required.",
    duration: "~2 minutes",
    outcome: "Files accepted and queued",
  },
  {
    id: "understand",
    eyebrow: "Step 2",
    title: "Datalk reads and understands everything",
    description:
      "We split every source into searchable chunks, index the meaning behind the words, and show you exactly what the assistant now knows.",
    duration: "Automatic",
    outcome: "Knowledge base ready",
  },
  {
    id: "customize",
    eyebrow: "Step 3",
    title: "Make the assistant yours",
    description:
      "Pick your colour, greeting, and starter questions in a visual builder. Preview the live answers before a single customer sees them.",
    duration: "~3 minutes",
    outcome: "Branded widget configured",
  },
  {
    id: "launch",
    eyebrow: "Step 4",
    title: "Paste one line and go live",
    description:
      "Copy a single script tag into your site. Your assistant starts answering with cited sources, and you watch every gap in the dashboard.",
    duration: "~1 minute",
    outcome: "Live on your website",
  },
];

export function OnboardingFlowSection() {
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.25,
    once: false,
  });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  const running = inView && !paused;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % steps.length);
      setCycle((value) => value + 1);
    }, STEP_DURATION);
    return () => window.clearTimeout(timer);
  }, [running, active, cycle]);

  const selectStep = (index: number) => {
    setActive(index);
    setCycle((value) => value + 1);
  };

  return (
    <section id="how-it-works" ref={ref} className="relative z-10 py-24 p-5">
      <SectionRule />

      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline">Getting started</Badge>
        <h2 className="mt-5 font-semibold text-4xl text-slate-950 tracking-tight md:text-5xl">
          New here? You are four short steps from a live assistant.
        </h2>
        <p className="mt-4 text-lg text-slate-500 leading-8">
          Datalk is built for teams without an AI department. Watch the whole
          journey below — from your first upload to a chatbot answering real
          customers on your website in under 10 minutes.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {[
          "No code required",
          "No model training",
          "Works with your existing docs",
          "Cancel anytime",
        ].map((item, index) => (
          <span
            key={item}
            className="dk-animate-fade-up inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-slate-600 text-sm shadow-sm"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <TickIcon className="h-3.5 w-3.5 text-emerald-600" />
            {item}
          </span>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <ol className="relative space-y-3">
            <span
              className="pointer-events-none absolute top-6 bottom-6 left-[27px] w-px bg-slate-200"
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <li key={step.id}>
                <StepRow
                  step={step}
                  index={index}
                  isActive={index === active}
                  isDone={index < active}
                  running={running}
                  cycle={cycle}
                  onSelect={() => selectStep(index)}
                />
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              className="rounded-full bg-slate-950 px-6 py-3 font-medium text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              href="/signup"
            >
              Start step 1 free
            </Link>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-600 text-sm transition-colors hover:text-slate-950"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
              {paused ? "Play walkthrough" : "Pause walkthrough"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <FlowStage active={active} />
        </div>
      </div>
    </section>
  );
}

function StepRow({
  step,
  index,
  isActive,
  isDone,
  running,
  cycle,
  onSelect,
}: {
  step: Step;
  index: number;
  isActive: boolean;
  isDone: boolean;
  running: boolean;
  cycle: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "step" : undefined}
      className={`relative flex w-full gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
        isActive
          ? "border-slate-300 bg-white shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)]"
          : "border-transparent bg-transparent hover:bg-white/70"
      }`}
    >
      <span className="relative z-10 shrink-0">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full border font-semibold text-sm transition-all duration-300 ${
            isActive
              ? "border-slate-950 bg-slate-950 text-white"
              : isDone
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-400"
          }`}
        >
          {isDone ? <TickIcon className="h-4 w-4" /> : index + 1}
        </span>
        {isActive ? (
          <span
            className="dk-pulse-ring absolute inset-0 rounded-full bg-slate-950/20"
            aria-hidden="true"
          />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`font-semibold text-sm transition-colors ${isActive ? "text-slate-950" : "text-slate-600"}`}
          >
            {step.title}
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 text-xs">
            {step.duration}
          </span>
        </span>

        <span
          className={`mt-2 block overflow-hidden text-slate-500 text-sm leading-6 transition-all duration-500 ${
            isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {step.description}
        </span>

        <span
          className={`mt-3 block h-1 overflow-hidden rounded-full bg-slate-100 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
        >
          {isActive ? (
            <span
              key={`${step.id}-${cycle}`}
              className="dk-progress-bar block h-full rounded-full bg-slate-950"
              style={{
                animationDuration: `${STEP_DURATION}ms`,
                animationPlayState: running ? "running" : "paused",
              }}
            />
          ) : null}
        </span>
      </span>
    </button>
  );
}

function FlowStage({ active }: { active: number }) {
  const step = steps[active];

  return (
    <div className="relative rounded-[2rem] border border-slate-200/80 bg-white p-3 shadow-[0_28px_90px_-38px_rgba(15,23,42,0.35)]">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center justify-between border-slate-200 border-b bg-white/80 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          </div>
          <p className="font-medium text-slate-400 text-xs">
            {step.eyebrow} · Datalk workspace
          </p>
          <Badge variant="success">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {step.outcome}
          </Badge>
        </div>

        <div className="relative min-h-[352px] p-6">
          <StageContent active={active} />
        </div>

        <FlowRail active={active} />
      </div>
    </div>
  );
}

function StageContent({ active }: { active: number }) {
  return (
    <div key={active} className="dk-animate-fade-in">
      {active === 0 ? <UploadStage /> : null}
      {active === 1 ? <UnderstandStage /> : null}
      {active === 2 ? <CustomizeStage /> : null}
      {active === 3 ? <LaunchStage /> : null}
    </div>
  );
}

function UploadStage() {
  const files = [
    { name: "Refund-Policy.pdf", size: "1.2 MB", progress: 100 },
    { name: "help.example.com", size: "Website", progress: 100 },
    { name: "Support-FAQ.md", size: "240 KB", progress: 64 },
  ];

  return (
    <div className="space-y-4">
      <div className="dk-animate-pop relative overflow-hidden rounded-2xl border-2 border-slate-300 border-dashed bg-white/70 p-7 text-center">
        <div className="dk-animate-float mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <UploadIcon />
        </div>
        <p className="mt-4 font-semibold text-slate-950">
          Add your knowledge sources
        </p>
        <p className="mt-1 text-slate-500 text-sm">
          PDF, website URL, Google Drive, Markdown — up to 100 MB per file
        </p>
      </div>

      <div className="space-y-2.5">
        {files.map((file, index) => (
          <div
            key={file.name}
            className="dk-animate-fade-up flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
            style={{ animationDelay: `${200 + index * 220}ms` }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
              <FileIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-slate-800 text-sm">
                  {file.name}
                </span>
                <span className="shrink-0 text-slate-400 text-xs">
                  {file.size}
                </span>
              </span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="dk-progress-bar block h-full rounded-full bg-slate-950"
                  style={{
                    width: `${file.progress}%`,
                    animationDuration: `${900 + index * 350}ms`,
                  }}
                />
              </span>
            </span>
            {file.progress === 100 ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <TickIcon className="h-3 w-3" />
              </span>
            ) : (
              <span className="text-slate-400 text-xs">{file.progress}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UnderstandStage() {
  const chunks = [80, 62, 94, 48, 71, 88, 55, 76, 41, 90, 66, 83].map(
    (height, index) => ({
      id: `chunk-${index}-${height}`,
      height,
      delay: index * 70,
    }),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["3", "sources"],
          ["1,284", "chunks"],
          ["100%", "indexed"],
        ].map(([value, label], index) => (
          <div
            key={label}
            className="dk-animate-fade-up rounded-2xl border border-slate-200 bg-white p-4 text-center"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="font-semibold text-2xl text-slate-950">{value}</p>
            <p className="mt-1 text-slate-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
        <div className="dk-animate-scan pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-slate-950/[0.06] to-transparent" />
        <p className="font-medium text-slate-950 text-sm">
          Reading and indexing your content
        </p>
        <p className="mt-1 text-slate-400 text-xs">
          Each block below is a passage the assistant can now cite
        </p>
        <div className="mt-4 grid grid-cols-6 gap-2">
          {chunks.map((chunk) => (
            <span
              key={chunk.id}
              className="dk-animate-pop flex h-12 items-end rounded-lg bg-slate-100 p-1"
              style={{ animationDelay: `${chunk.delay}ms` }}
            >
              <span
                className="w-full rounded bg-slate-950/85"
                style={{ height: `${chunk.height}%` }}
              />
            </span>
          ))}
        </div>
      </div>

      <div
        className="dk-animate-fade-up flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200"
        style={{ animationDelay: "900ms" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 ring-1 ring-emerald-200">
          <TickIcon className="h-4 w-4" />
        </span>
        <p className="text-emerald-800 text-sm">
          Your knowledge base is ready. Nothing to configure.
        </p>
      </div>
    </div>
  );
}

function CustomizeStage() {
  const swatches = [
    "bg-slate-950",
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-rose-500",
    "bg-amber-500",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div className="dk-animate-fade-up rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-medium text-slate-950 text-sm">Brand colour</p>
          <div className="mt-3 flex gap-2">
            {swatches.map((swatch, index) => (
              <span
                key={swatch}
                className={`dk-animate-pop h-8 w-8 rounded-full ${swatch} ${index === 0 ? "ring-2 ring-slate-950 ring-offset-2" : ""}`}
                style={{ animationDelay: `${index * 90}ms` }}
              />
            ))}
          </div>
        </div>

        <div
          className="dk-animate-fade-up rounded-2xl border border-slate-200 bg-white p-4"
          style={{ animationDelay: "150ms" }}
        >
          <p className="font-medium text-slate-950 text-sm">Welcome message</p>
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600 text-sm">
            Hi! Ask me anything about our plans
            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-slate-900" />
          </p>
        </div>

        <div
          className="dk-animate-fade-up rounded-2xl border border-slate-200 bg-white p-4"
          style={{ animationDelay: "300ms" }}
        >
          <p className="font-medium text-slate-950 text-sm">
            Starter questions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Pricing", "Refunds", "Integrations"].map((chip, index) => (
              <span
                key={chip}
                className="dk-animate-pop rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 text-xs"
                style={{ animationDelay: `${350 + index * 110}ms` }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="dk-animate-fade-up flex flex-col rounded-2xl border border-slate-200 bg-white p-4"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-2 border-slate-100 border-b pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 font-semibold text-white text-xs">
            D
          </span>
          <span className="font-medium text-slate-950 text-sm">
            Live preview
          </span>
          <Badge variant="outline" className="ml-auto">
            Instant
          </Badge>
        </div>

        <div className="mt-4 flex-1 space-y-3">
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-tr-md bg-slate-950 px-3 py-2 text-white text-xs leading-5">
              Do you offer a free trial?
            </p>
          </div>
          <div className="flex gap-2">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 font-semibold text-[10px] text-white">
              D
            </span>
            <p className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3 py-2 text-slate-600 text-xs leading-5">
              Yes — every workspace starts with a 14-day free trial, no card
              needed.
            </p>
          </div>
          <div className="flex items-center gap-1.5 pl-9">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="dk-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pr-1.5 pl-3">
          <span className="flex-1 text-slate-400 text-xs">Ask a question…</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white">
            <SendIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function LaunchStage() {
  return (
    <div className="space-y-4">
      <div className="dk-animate-fade-up overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between border-slate-800 border-b px-4 py-2.5">
          <p className="font-medium text-slate-400 text-xs">
            Paste before &lt;/body&gt;
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white">
            <TickIcon className="h-3 w-3" />
            Copied
          </span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] text-slate-300 leading-6">
          <code>
            {`<script
  src="https://cdn.datalk.ai/widget.js"
  data-bot-id="wk_28f4c1"
  async
></script>`}
          </code>
        </pre>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Live", "on your site", "emerald"],
          ["0.94", "avg confidence", "slate"],
          ["24/7", "answering", "slate"],
        ].map(([value, label, tone], index) => (
          <div
            key={label}
            className="dk-animate-fade-up rounded-2xl border border-slate-200 bg-white p-4"
            style={{ animationDelay: `${200 + index * 130}ms` }}
          >
            <p
              className={`font-semibold text-xl ${tone === "emerald" ? "text-emerald-600" : "text-slate-950"}`}
            >
              {value}
            </p>
            <p className="mt-1 text-slate-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div
        className="dk-animate-fade-up rounded-2xl border border-slate-200 bg-white p-4"
        style={{ animationDelay: "560ms" }}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium text-slate-950 text-sm">
            First conversations
          </p>
          <span className="text-slate-400 text-xs">updating live</span>
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["“What is included in the Pro plan?”", "answered · 2 sources"],
            ["“How do I cancel?”", "answered · 1 source"],
            ["“Do you support SSO?”", "gap flagged for you"],
          ].map(([question, meta], index) => (
            <div
              key={question}
              className="dk-animate-fade-up flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
              style={{ animationDelay: `${700 + index * 200}ms` }}
            >
              <p className="truncate text-slate-700 text-xs">{question}</p>
              <span
                className={`shrink-0 text-[11px] ${meta.includes("gap") ? "text-amber-600" : "text-emerald-600"}`}
              >
                {meta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowRail({ active }: { active: number }) {
  return (
    <div className="border-slate-200 border-t bg-white/70 px-5 py-4">
      <svg
        viewBox="0 0 600 56"
        className="h-14 w-full"
        role="img"
        aria-label={`Onboarding progress: step ${active + 1} of ${steps.length}`}
      >
        <title>Onboarding flow progress</title>
        <line
          x1="60"
          y1="20"
          x2="540"
          y2="20"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <line
          x1="60"
          y1="20"
          x2="540"
          y2="20"
          stroke="#94a3b8"
          strokeWidth="2"
          className="dk-flow-path"
        />
        <line
          x1="60"
          y1="20"
          x2={60 + (480 * active) / (steps.length - 1)}
          y2="20"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transition: "all 600ms cubic-bezier(0.22,1,0.36,1)" }}
        />
        {steps.map((step, index) => {
          const x = 60 + (480 * index) / (steps.length - 1);
          const isActive = index === active;
          const isDone = index < active;
          return (
            <g key={step.id}>
              <circle
                cx={x}
                cy={20}
                r={isActive ? 11 : 7}
                fill={isActive || isDone ? "#0f172a" : "#ffffff"}
                stroke={isActive || isDone ? "#0f172a" : "#cbd5e1"}
                strokeWidth="2"
                style={{ transition: "all 400ms cubic-bezier(0.22,1,0.36,1)" }}
              />
              <text
                x={x}
                y={48}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
                style={{ fontSize: 11 }}
              >
                {step.id === "upload"
                  ? "Upload"
                  : step.id === "understand"
                    ? "Index"
                    : step.id === "customize"
                      ? "Customise"
                      : "Go live"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SectionRule() {
  return <div className="absolute top-0 right-0 left-0 h-px bg-slate-200/70" />;
}

function TickIcon({ className }: { className?: string }) {
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
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 14V4m0 0L6 8m4-4 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 13.5V15a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-4 w-4"}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 3 3 10.2l6.6.5L17 17l0-14Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 2.2 10 6l-7 3.8V2.2Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="2.5" width="2.2" height="7" rx="0.8" />
      <rect x="6.8" y="2.5" width="2.2" height="7" rx="0.8" />
    </svg>
  );
}
