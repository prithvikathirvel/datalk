"use client";

import { cn } from "@template/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminOverview } from "@/lib/admin-data";
import { countryName } from "@/lib/countries";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/stores/toast-store";

type TabId =
  | "overview"
  | "onboarding"
  | "users"
  | "chatbots"
  | "inbox"
  | "settings";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "onboarding", label: "Onboarding" },
  { id: "users", label: "Users" },
  { id: "chatbots", label: "Chatbots" },
  { id: "inbox", label: "Feedback inbox" },
  { id: "settings", label: "Settings" },
];

function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "emerald" | "amber" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50"
        : tone === "red"
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white";
  return (
    <div className={cn("rounded-xl border p-5", toneClass)}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-semibold text-slate-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function TableShell({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map((header) => (
              <th
                key={header}
                className="px-3 py-2.5 font-medium text-slate-400 text-[11px] uppercase tracking-wide whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">{children}</tbody>
      </table>
    </div>
  );
}

function OnboardingTab({ overview }: { overview: AdminOverview }) {
  const rows = overview.onboarding;
  if (rows.length === 0) {
    return <EmptyState text="No onboarding submissions yet." />;
  }
  return (
    <TableShell
      headers={[
        "User",
        "Country",
        "Heard from",
        "Role",
        "Team size",
        "Notes",
        "Submitted",
      ]}
    >
      {rows.map((row) => (
        <tr key={row.userId} className="align-top hover:bg-slate-50/60">
          <td className="px-3 py-3">
            <p className="font-medium text-slate-950">
              {row.user?.name ?? "—"}
            </p>
            <p className="text-xs text-slate-400">
              {row.user?.email ?? row.userId}
            </p>
          </td>
          <td className="px-3 py-3 whitespace-nowrap">
            {countryName(row.country)}
          </td>
          <td className="px-3 py-3 whitespace-nowrap">{row.heardFrom}</td>
          <td className="px-3 py-3">{row.role ?? "—"}</td>
          <td className="px-3 py-3 whitespace-nowrap">
            {row.companySize ?? "—"}
          </td>
          <td className="max-w-[220px] px-3 py-3 text-slate-500 break-words">
            {row.notes ?? "—"}
          </td>
          <td className="px-3 py-3 whitespace-nowrap text-slate-400">
            {formatDateTime(row.updatedAt)}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function UsersTab({ overview }: { overview: AdminOverview }) {
  const rows = overview.users;
  if (rows.length === 0) {
    return <EmptyState text="No registered users yet." />;
  }
  return (
    <TableShell headers={["Name", "Email", "Provider", "Onboarding", "Joined"]}>
      {rows.map((row) => (
        <tr key={row.id} className="hover:bg-slate-50/60">
          <td className="px-3 py-3 font-medium text-slate-950">{row.name}</td>
          <td className="px-3 py-3 text-slate-500">{row.email}</td>
          <td className="px-3 py-3">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                row.authProvider === "cognito"
                  ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
              )}
            >
              {row.authProvider === "cognito" ? "Google" : "Email"}
            </span>
          </td>
          <td className="px-3 py-3">
            {row.onboardingCompleted ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                Completed
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                Pending
              </span>
            )}
          </td>
          <td className="px-3 py-3 whitespace-nowrap text-slate-400">
            {formatDateTime(row.createdAt)}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function ChatbotsTab({ overview }: { overview: AdminOverview }) {
  const rows = overview.embedConfigs;
  if (rows.length === 0) {
    return (
      <EmptyState text="No chatbot configs yet. Connect the embed backend (see ONBOARDING_ADMIN_BACKEND_API.md) to surface them here." />
    );
  }
  return (
    <TableShell headers={["Bot", "Owner", "Status", "Origin", "Updated"]}>
      {rows.map((row) => (
        <tr key={row.id} className="hover:bg-slate-50/60">
          <td className="px-3 py-3 font-medium text-slate-950">
            {row.botName}
          </td>
          <td className="px-3 py-3 text-slate-500">{row.userId}</td>
          <td className="px-3 py-3">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                row.isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
              )}
            >
              {row.isActive ? "Active" : "Paused"}
            </span>
          </td>
          <td className="max-w-[220px] px-3 py-3 text-slate-500 break-words">
            {row.allowedOrigins?.join(", ") || "Any origin"}
          </td>
          <td className="px-3 py-3 whitespace-nowrap text-slate-400">
            {formatDateTime(row.updatedAt)}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function InboxTab({ overview }: { overview: AdminOverview }) {
  const rows = overview.feedback;
  if (rows.length === 0) {
    return (
      <EmptyState text="No flagged questions yet. When visitors click “Not helpful” on your embed chatbots, they land here." />
    );
  }
  return (
    <TableShell
      headers={["Question", "Reason", "Bot", "Page", "Visitor", "When"]}
    >
      {rows.map((row) => (
        <tr key={row.id} className="align-top hover:bg-slate-50/60">
          <td className="max-w-[280px] px-3 py-3 break-words">
            <p className="font-medium text-slate-950">{row.question}</p>
            {row.answer && (
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                {row.answer}
              </p>
            )}
          </td>
          <td className="px-3 py-3 whitespace-nowrap">{row.reason}</td>
          <td className="px-3 py-3 text-slate-500">{row.botId ?? "—"}</td>
          <td className="max-w-[180px] px-3 py-3 text-slate-500 break-words">
            {row.pageUrl ?? "—"}
          </td>
          <td className="px-3 py-3 text-slate-500">
            {row.visitorEmail ?? "—"}
          </td>
          <td className="px-3 py-3 whitespace-nowrap text-slate-400">
            {formatDateTime(row.createdAt)}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function SettingsTab({
  overview,
  onRefresh,
}: {
  overview: AdminOverview;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(overview.adminUsername);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function changeCredentials(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername,
          newPassword,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          detail?: string;
        } | null;
        toast.error(data?.detail ?? "Could not update credentials.");
        return;
      }
      toast.success("Admin credentials updated.", "Saved");
      setCurrentPassword("");
      setNewPassword("");
      onRefresh();
    } catch {
      toast.error("Could not update credentials.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    toast.info("Signed out of the admin panel.");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard
        title="Change admin credentials"
        subtitle="Updates the username and password used to access /admin. Takes effect immediately."
      >
        <form onSubmit={changeCredentials} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-cur-pw"
              className="text-[13px] font-medium text-slate-700"
            >
              Current password
            </label>
            <input
              id="admin-cur-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-new-user"
              className="text-[13px] font-medium text-slate-700"
            >
              New username
            </label>
            <input
              id="admin-new-user"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-new-pw"
              className="text-[13px] font-medium text-slate-700"
            >
              New password
            </label>
            <input
              id="admin-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-1 w-fit cursor-pointer rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Update credentials"}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Session"
        subtitle="End this browser session. You'll need to sign in again to open /admin."
      >
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          Sign out of admin
        </button>
      </SectionCard>
    </div>
  );
}

export function AdminDashboard({
  initialData,
}: {
  initialData: AdminOverview;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/overview", {
        cache: "no-store",
      });
      if (!response.ok) {
        toast.error("Could not refresh admin data.");
        return;
      }
      const overview = (await response.json()) as AdminOverview;
      setData(overview);
      toast.success("Admin data refreshed.");
    } catch {
      toast.error("Could not refresh admin data.");
    } finally {
      setRefreshing(false);
    }
  }

  const pendingOnboarding = data.users.filter(
    (u) => !u.onboardingCompleted,
  ).length;
  const completedOnboarding = data.users.filter(
    (u) => u.onboardingCompleted,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 font-semibold text-[13px] text-white">
              D
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 leading-tight">
                Datalk Admin
              </p>
              <p className="text-[11px] text-slate-400">
                Signed in as{" "}
                <span className="font-medium text-slate-500">
                  {data.adminUsername}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh data"}
          </button>
        </div>

        {/* Tabs */}
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2"
          aria-label="Admin sections"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                tab === t.id
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Registered users"
                value={data.users.length}
                sub="All accounts"
              />
              <StatCard
                label="Onboarding completed"
                value={completedOnboarding}
                sub="Users who answered the questions"
                tone="emerald"
              />
              <StatCard
                label="Onboarding pending"
                value={pendingOnboarding}
                sub="Users who skipped or haven't answered"
                tone={pendingOnboarding > 0 ? "amber" : "default"}
              />
              <StatCard
                label="Chatbots"
                value={data.embedConfigs.length}
                sub={`${data.embedConfigs.filter((c) => c.isActive).length} active`}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Latest onboarding submissions"
                subtitle="Most recent answers first"
              >
                {data.onboarding.length === 0 ? (
                  <EmptyState text="No submissions yet." />
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {data.onboarding.slice(0, 6).map((row) => (
                      <li
                        key={row.userId}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-950">
                            {row.user?.name ?? "Unknown user"}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {countryName(row.country)} · {row.heardFrom}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDateTime(row.updatedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                title="Knowledge-gap inbox"
                subtitle="Questions visitors flagged as unhelpful"
              >
                {data.feedback.length === 0 ? (
                  <EmptyState text="No flagged questions yet." />
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {data.feedback.slice(0, 6).map((row) => (
                      <li
                        key={row.id}
                        className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-950">
                            {row.question}
                          </p>
                          <p className="text-xs text-slate-400">{row.reason}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDateTime(row.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>
        )}

        {tab === "onboarding" && (
          <SectionCard
            title="Onboarding submissions"
            subtitle="Country, discovery source, role, and team size for every user who answered"
          >
            <OnboardingTab overview={data} />
          </SectionCard>
        )}

        {tab === "users" && (
          <SectionCard
            title="Registered users"
            subtitle="Every account — Google OAuth and email/password"
          >
            <UsersTab overview={data} />
          </SectionCard>
        )}

        {tab === "chatbots" && (
          <SectionCard
            title="Chatbot configs"
            subtitle="Embed widgets created across all workspaces"
          >
            <ChatbotsTab overview={data} />
          </SectionCard>
        )}

        {tab === "inbox" && (
          <SectionCard
            title="Knowledge-gap inbox"
            subtitle="Questions your visitors said the chatbot could not answer — content improvement backlog"
          >
            <InboxTab overview={data} />
          </SectionCard>
        )}

        {tab === "settings" && (
          <SettingsTab overview={data} onRefresh={refresh} />
        )}
      </main>
    </div>
  );
}
