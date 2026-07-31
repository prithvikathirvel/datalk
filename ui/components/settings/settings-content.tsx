"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Separator,
  Textarea,
} from "@template/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o (recommended)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (faster, cheaper)" },
  { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku (fast)" },
];

export function SettingsContent({
  user,
}: {
  user: { id: string; email: string; name: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Simulate save — preferences would be persisted server-side
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Settings</h1>
          <p className="text-slate-400 text-xs">Manage your account and preferences</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-600 text-sm transition-colors hover:bg-slate-50"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6 12.5A1.5 1.5 0 0 1 7.5 11h4a1.5 1.5 0 0 1 1.5 1.5V14a1 1 0 0 0 2 0v-1.5ZM8 1a.75.75 0 0 1 .75.75v5.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 1.06-1.06l.72.72V1.75A.75.75 0 0 1 8 1Z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-8 p-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your account information. Email cannot be changed here — contact support for updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={user.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="userId"
                    value={user.id}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(user.id)}
                    className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
                    title="Copy user ID"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Chat & Ingestion preferences</CardTitle>
              <CardDescription>
                Configure how the chat assistant and document parser behave for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={savePreferences} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="model">Default model</Label>
                  <Select id="model" name="model" defaultValue="gpt-4o">
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-[11px] text-slate-400">
                    Choose the LLM model used for generating responses. Larger models are more capable but slower.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topK">Default retrieval chunks (top_k)</Label>
                  <Input
                    id="topK"
                    name="topK"
                    type="number"
                    min="1"
                    max="50"
                    defaultValue="5"
                  />
                  <p className="text-[11px] text-slate-400">
                    Number of document chunks retrieved per query. Higher values return more context but increase token usage.
                  </p>
                </div>

                {/* Future Ingestion Preferences addition */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="chunkSize">Default Chunk Size (tokens)</Label>
                    <Input
                      id="chunkSize"
                      name="chunkSize"
                      type="number"
                      min="100"
                      max="2000"
                      defaultValue="500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Target length for document segments. Larger chunks hold more context but cost more.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chunkOverlap">Chunk Overlap (tokens)</Label>
                    <Input
                      id="chunkOverlap"
                      name="chunkOverlap"
                      type="number"
                      min="0"
                      max="500"
                      defaultValue="50"
                    />
                    <p className="text-[11px] text-slate-400">
                      Tokens shared between adjacent chunks. Prevents loss of context at boundaries.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contextPrompt">Custom system prompt (optional)</Label>
                  <Textarea
                    id="contextPrompt"
                    name="contextPrompt"
                    className="min-h-20"
                    placeholder="e.g. You are a helpful assistant for an HR department. Keep answers concise and professional."
                  />
                  <p className="text-[11px] text-slate-400">
                    A custom system prompt overrides the default assistant behavior for all your chats.
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save preferences"}
                  </Button>
                  {saved && (
                    <span className="text-emerald-600 text-sm font-medium">
                      ✓ Saved
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* SaaS Subscription & Limits */}
          <Card>
            <CardHeader>
              <CardTitle>SaaS Subscription & Plan Limits</CardTitle>
              <CardDescription>
                Monitor your active subscription limits, quotas, and monthly usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <p className="font-semibold text-slate-950 text-sm">Active Plan: Pro Tier</p>
                  <p className="text-xs text-slate-500">Renews on August 25, 2026. $49/month</p>
                </div>
                <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Document Chunk Usage</span>
                    <span className="text-slate-900">4,288 / 20,000 chunks (21.4%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-950 h-2 rounded-full" style={{ width: "21.4%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Monthly Chat Message Requests</span>
                    <span className="text-slate-900">1,820 / 10,000 queries (18.2%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-950 h-2 rounded-full" style={{ width: "18.2%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">S3 Raw Storage</span>
                    <span className="text-slate-900">45.8 MB / 500 MB (9.16%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-950 h-2 rounded-full" style={{ width: "9.16%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Alerts</CardTitle>
              <CardDescription>
                Configure how and when you receive emails, summaries, and gap detection alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={savePreferences}>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                    />
                    <div>
                      <p className="font-semibold text-slate-950 text-sm">Failed Ingestion Alerts</p>
                      <p className="text-slate-500 text-xs">Notify me immediately by email if a document ingestion job fails.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                    />
                    <div>
                      <p className="font-semibold text-slate-950 text-sm">Knowledge Gap & Feedback Summaries</p>
                      <p className="text-slate-500 text-xs">Receive a daily digest of customer widget questions that could not be answered.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                    />
                    <div>
                      <p className="font-semibold text-slate-950 text-sm">Weekly Usage Reports</p>
                      <p className="text-slate-500 text-xs">A weekly statistics email outlining widget activity, most popular queries, and token counts.</p>
                    </div>
                  </label>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save notification settings"}
                  </Button>
                  {saved && (
                    <span className="text-emerald-600 text-sm font-medium">
                      ✓ Saved
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Data & Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Data & usage</CardTitle>
              <CardDescription>
                View usage statistics and manage your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Documents
                  </p>
                  <p className="mt-1 font-semibold text-2xl text-slate-950">
                    —
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Uploaded files
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Conversations
                  </p>
                  <p className="mt-1 font-semibold text-2xl text-slate-950">
                    —
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Total threads
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Embed Bots
                  </p>
                  <p className="mt-1 font-semibold text-2xl text-slate-950">
                    —
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Active widgets
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <a
                  href="/documents"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-50"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.086a1.5 1.5 0 0 1 1.06.44l1.415 1.413A1.5 1.5 0 0 0 9.122 4.5H12.5A1.5 1.5 0 0 1 14 6v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Z" />
                  </svg>
                  Manage documents
                </a>
                <a
                  href="/embed"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-50"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8Zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.208C3.438 7.96 3 8.914 3 10a5 5 0 0 0 10 0 6.96 6.96 0 0 1-.185-1.741Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Embed widgets
                </a>
                <a
                  href="/analytics"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-50"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                  </svg>
                  View analytics
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Danger zone</CardTitle>
              <CardDescription>
                Irreversible actions — proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
                <div>
                  <p className="font-medium text-red-800 text-sm">
                    Delete all conversations
                  </p>
                  <p className="text-red-600 text-xs">
                    Permanently removes your entire chat history. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-red-700 text-sm transition-colors hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
                <div>
                  <p className="font-medium text-red-800 text-sm">
                    Delete all documents
                  </p>
                  <p className="text-red-600 text-xs">
                    Removes all uploaded documents and their embeddings. Chats will stop working.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-red-700 text-sm transition-colors hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}