"use client";

import { cn } from "@template/ui";
import { memo, useEffect, useMemo, useState } from "react";
import type { AnalyticsData } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/stores/toast-store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Skeleton = memo(function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ""}`}
    />
  );
});

function formatMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

const MetricCard = memo(function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "blue" | "green" | "amber" | "red";
}) {
  const accentClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
    red: "border-red-200 bg-red-50",
  };
  return (
    <div
      className={cn(
        "rounded-xl border p-5 bg-white",
        accent ? accentClasses[accent] : "border-slate-200",
      )}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-semibold text-slate-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
});

// ─── Spark Bar Chart ──────────────────────────────────────────────────────────

const SparkBars = memo(function SparkBars({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((d) => (
        <div
          key={d.label}
          className="group relative flex flex-1 h-full flex-col items-center justify-end"
        >
          <div className="relative w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-sm bg-slate-200 transition-all group-hover:bg-slate-950"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="mt-1 text-[9px] text-slate-400 leading-none">
            {d.label.slice(5, 10)}
          </span>
          {/* tooltip */}
          <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-950 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
            {d.value}
          </div>
        </div>
      ))}
    </div>
  );
});

// ─── Satisfaction Donut (CSS-based) ───────────────────────────────────────────

const SatisfactionWidget = memo(function SatisfactionWidget({
  thumbsUp,
  thumbsDown,
  noFeedback,
}: {
  thumbsUp: number;
  thumbsDown: number;
  noFeedback: number;
}) {
  const total = thumbsUp + thumbsDown + noFeedback;
  const upPct = total > 0 ? Math.round((thumbsUp / total) * 100) : 0;
  const downPct = total > 0 ? Math.round((thumbsDown / total) * 100) : 0;

  const items = [
    { label: "Positive", value: thumbsUp, pct: upPct, color: "bg-emerald-500" },
    { label: "Negative", value: thumbsDown, pct: downPct, color: "bg-red-400" },
    {
      label: "No feedback",
      value: noFeedback,
      pct: 100 - upPct - downPct,
      color: "bg-slate-200",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-full overflow-hidden h-3">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${upPct}%` }}
        />
        <div
          className="h-full bg-red-400 transition-all"
          style={{ width: `${downPct}%` }}
        />
        <div className="h-full bg-slate-200 flex-1" />
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2.5 w-2.5 rounded-full shrink-0", item.color)}
              />
              <span className="text-slate-600">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-950">{item.value}</span>
              <span>({item.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Unable to load analytics data from API.");
        }
        const json = (await res.json()) as AnalyticsData;
        setData(json);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load analytics.";
        setError(message);
        toast.error(message, "Analytics unavailable");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const sparkData = useMemo(
    () =>
      data
        ? data.dailyConversations.map((d) => ({
            label: d.date,
            value: d.conversations,
          }))
        : [],
    [data],
  );

  const satisfactionScore =
    data && data.satisfaction.thumbsUp + data.satisfaction.thumbsDown > 0
      ? Math.round(
          (data.satisfaction.thumbsUp /
            (data.satisfaction.thumbsUp + data.satisfaction.thumbsDown)) *
            100,
        )
      : null;

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h1 className="font-semibold text-slate-950">Analytics</h1>
            <p className="text-slate-400 text-xs">
              Conversation insights for your Datalk workspace
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 font-medium">
            Loading...
          </span>
        </div>

        {/* Scrollable skeletons */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h1 className="font-semibold text-slate-950">Analytics</h1>
            <p className="text-slate-400 text-xs">
              Conversation insights for your Datalk workspace
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
            {error || "Failed to load analytics data."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Analytics</h1>
          <p className="text-slate-400 text-xs">
            Conversation insights for your Datalk workspace
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 font-medium">
          Last 8 days
        </span>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 p-6">
          {/* Metric row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total conversations"
              value={data.totalConversations.toLocaleString()}
              sub="All time"
            />
            <MetricCard
              label="Total messages"
              value={data.totalMessages.toLocaleString()}
              sub={`Avg ${data.avgMessagesPerConversation} / conversation`}
            />
            <MetricCard
              label="Avg response time"
              value={formatMs(data.avgResponseTimeMs)}
              accent="blue"
            />
            <MetricCard
              label="Unanswered rate"
              value={formatPercent(data.unansweredRate)}
              sub={`${data.unansweredQuestions.length} open questions`}
              accent={data.unansweredRate > 0.2 ? "amber" : undefined}
            />
          </div>

          {/* Row 2: chart + satisfaction */}
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <SectionCard
              title="Conversation activity"
              subtitle="Daily conversations over the last 8 days"
            >
              <SparkBars data={sparkData} />
            </SectionCard>

            <SectionCard
              title="User satisfaction"
              subtitle={
                satisfactionScore !== null
                  ? `${satisfactionScore}% positive feedback`
                  : "No feedback yet"
              }
            >
              <SatisfactionWidget
                thumbsUp={data.satisfaction.thumbsUp}
                thumbsDown={data.satisfaction.thumbsDown}
                noFeedback={data.satisfaction.noFeedback}
              />
            </SectionCard>
          </div>

          {/* Row 3: top questions + unanswered */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Most asked questions */}
            <SectionCard
              title="Most asked questions"
              subtitle="Ranked by frequency across all chatbots"
            >
              <div className="space-y-2">
                {data.topQuestions.map((q, idx) => {
                  const maxCount = data.topQuestions[0]?.count ?? 1;
                  return (
                    <div key={q.id} className="group flex items-center gap-3">
                      <span className="w-5 shrink-0 text-xs text-slate-400 font-medium text-right">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm text-slate-700">
                            {q.question}
                          </p>
                          <span className="shrink-0 text-xs font-semibold text-slate-950">
                            {q.count}×
                          </span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-slate-950 transition-all"
                            style={{ width: `${(q.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Unanswered questions */}
            <SectionCard
              title="Unanswered questions"
              subtitle="Questions your chatbot could not answer — improve your docs"
            >
              {data.unansweredQuestions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm text-slate-400">
                    All questions answered!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.unansweredQuestions.map((q) => (
                    <div key={q.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-800 leading-snug">
                          {q.question}
                        </p>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                          {q.botName}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(q.askedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
