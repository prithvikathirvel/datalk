"use client";

import type { DocumentFile, EmbedConfig } from "@template/contracts";
import { Badge } from "@template/ui";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { readApiError } from "@/lib/api-error";
import type { AnalyticsData, DailyConversation } from "@/lib/data";
import {
  dashboardQuickActions,
  mockAnalyticsData,
  setupSteps,
} from "@/lib/data";
import { formatBytes, formatDateTime } from "@/lib/format";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Skeleton = memo(function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ""}`}
    />
  );
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  label,
  value,
  sub,
  loading,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${accent ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <p className="mt-1.5 text-3xl font-semibold text-slate-950">{value}</p>
      )}
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
});

// ─── Activity Bars ────────────────────────────────────────────────────────────

const ActivityBars = memo(function ActivityBars({
  data = [],
}: {
  data?: DailyConversation[];
}) {
  const max = Math.max(...data.map((d) => d.conversations), 0) || 1;
  return (
    <div className="flex h-20 items-end gap-1.5">
      {data.map((d) => (
        <div
          key={d.date}
          className="group relative flex flex-1 h-full flex-col items-center justify-end"
        >
          <div className="relative w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t bg-slate-200 transition-all group-hover:bg-slate-950"
              style={{ height: `${(d.conversations / max) * 100}%` }}
            />
          </div>
          <span className="mt-1 text-[9px] text-slate-400 leading-none">
            {d.date.slice(8)}
          </span>
          <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-slate-950 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
            {d.conversations}
          </div>
        </div>
      ))}
    </div>
  );
});

// ─── Setup Guide ──────────────────────────────────────────────────────────────

function SetupGuide({
  filesCount,
  embedsCount,
}: {
  filesCount: number;
  embedsCount: number;
}) {
  const completed: Record<string, boolean> = {
    upload: filesCount > 0,
    test: filesCount > 0,
    chat: filesCount > 0,
    embed: embedsCount > 0,
    analytics: false,
  };

  const doneCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">Getting started</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {doneCount} of {setupSteps.length} steps complete
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {setupSteps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 w-5 rounded-full ${i < doneCount ? "bg-slate-950" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {setupSteps.map((step, idx) => {
          const done = completed[step.id] ?? false;
          return (
            <Link
              key={step.id}
              href={step.href}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50 hover:border-slate-200"
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-slate-950 text-white"
                    : "border-2 border-slate-200 text-slate-400"
                }`}
              >
                {done ? (
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3"
                  >
                    <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-950"}`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {step.description}
                </p>
              </div>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-4 w-4 shrink-0 text-slate-300"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QuickActions = memo(function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
      {dashboardQuickActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm lg:flex-row lg:items-center lg:gap-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-700 h-[18px] w-[18px]"
            >
              <path d={action.iconPath} />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm text-slate-950">{action.label}</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
});

// ─── Recent Documents ─────────────────────────────────────────────────────────

function RecentDocuments({
  files,
  loading,
}: {
  files: DocumentFile[];
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">Recent documents</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest files in your knowledge base
          </p>
        </div>
        <Link
          href="/documents"
          className="text-xs text-slate-500 hover:text-slate-950 underline"
        >
          View all
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
          <p className="text-sm text-slate-500 font-medium">No documents yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Upload files to power your chatbot
          </p>
          <Link
            href="/documents"
            className="mt-3 inline-flex rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-medium text-white"
          >
            Upload now
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {files.slice(0, 5).map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-slate-500"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-950">
                  {file.filename}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(file.last_modified)}
                </p>
              </div>
              <Badge variant="secondary">{formatBytes(file.size)}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DashboardContent() {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [embeds, setEmbeds] = useState<EmbedConfig[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [filesRes, embedsRes, analyticsRes] = await Promise.all([
        fetch("/api/ingest/files", { cache: "no-store" }),
        fetch("/api/embed/configs", { cache: "no-store" }),
        fetch("/api/analytics", { cache: "no-store" }).catch(() => null),
      ]);
      setLoading(false);

      if (!filesRes.ok) {
        setError(await readApiError(filesRes, "Unable to reach the backend."));
      } else {
        setFiles((await filesRes.json()) as DocumentFile[]);
      }

      if (embedsRes.ok) {
        const data = (await embedsRes.json()) as { configs: EmbedConfig[] };
        setEmbeds(data.configs);
      }

      if (analyticsRes && analyticsRes.ok) {
        const data = (await analyticsRes.json()) as AnalyticsData;
        setAnalyticsData(data);
      }
    }
    void load();
  }, []);

  const totalSize = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
  const liveEmbeds = embeds.filter((e) => e.isActive).length;
  const analytics = analyticsData ?? mockAnalyticsData;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Overview</h1>
          <p className="text-slate-400 text-xs">Welcome back to Datalk</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
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
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Start chatting
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
              {error}
            </div>
          )}

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Documents"
              value={String(files.length)}
              sub={loading ? undefined : formatBytes(totalSize)}
              loading={loading}
            />
            <StatCard
              label="Conversations"
              value={analytics.totalConversations.toLocaleString()}
              sub="All time"
            />
            <StatCard
              label="Active embeds"
              value={loading ? "..." : String(liveEmbeds)}
              sub={loading ? undefined : `${embeds.length} total`}
              loading={loading}
            />
            <StatCard
              label="Satisfaction"
              value={`${Math.round(
                (analytics.satisfaction.thumbsUp /
                  Math.max(
                    analytics.satisfaction.thumbsUp +
                      analytics.satisfaction.thumbsDown,
                    1,
                  )) *
                  100,
              )}%`}
              sub="Positive feedback"
              accent
            />
          </div>

          {/* Activity + quick actions */}
          <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Conversation activity
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daily conversations · last 8 days
                  </p>
                </div>
                <Link
                  href="/analytics"
                  className="text-xs text-slate-500 hover:text-slate-950 underline"
                >
                  Full analytics
                </Link>
              </div>
              <ActivityBars data={analytics.dailyConversations} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 lg:w-72">
              <h2 className="mb-3 font-semibold text-slate-950">
                Quick actions
              </h2>
              <QuickActions />
            </div>
          </div>

          {/* Recent docs + setup guide */}
          <div className="grid gap-5 lg:grid-cols-2">
            <RecentDocuments files={files} loading={loading} />
            <SetupGuide filesCount={files.length} embedsCount={embeds.length} />
          </div>
        </div>
      </div>
    </div>
  );
}
