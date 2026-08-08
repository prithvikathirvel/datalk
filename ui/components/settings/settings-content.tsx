"use client";

import { Button, Input, Label, Select, Textarea } from "@template/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { countryName } from "@/lib/countries";
import type { OnboardingSubmission } from "@/lib/onboarding-store";
import { toast } from "@/stores/toast-store";

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o (recommended)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (faster, cheaper)" },
  { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku (fast)" },
];

/**
 * Flat settings layout — bordered sections with row dividers instead of
 * stacked shadowed cards, so the page reads as one connected surface.
 */
function Section({
  title,
  description,
  tone = "default",
  children,
}: {
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white ${
        danger ? "border-red-200" : "border-slate-200"
      }`}
    >
      <header
        className={`border-b px-5 py-4 ${
          danger
            ? "border-red-100 bg-red-50/50"
            : "border-slate-100 bg-slate-50/50"
        }`}
      >
        <h2
          className={`text-sm font-semibold ${
            danger ? "text-red-700" : "text-slate-950"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={`mt-0.5 text-xs ${danger ? "text-red-500" : "text-slate-400"}`}
          >
            {description}
          </p>
        ) : null}
      </header>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-6">
      <div className="pt-1.5">
        <Label htmlFor={htmlFor} className="text-[13px] text-slate-700">
          {label}
        </Label>
        {hint ? (
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            {hint}
          </p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function SettingsContent({
  user,
}: {
  user: { id: string; email: string; name: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingSubmission | null>(
    null,
  );
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadOnboarding() {
      try {
        const res = await fetch("/api/onboarding", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          submission: OnboardingSubmission | null;
        };
        if (!cancelled) setOnboarding(data.submission);
      } catch {
        // Non-fatal — the section shows the "complete it" prompt instead.
      } finally {
        if (!cancelled) setOnboardingLoading(false);
      }
    }
    void loadOnboarding();
    return () => {
      cancelled = true;
    };
  }, []);

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
    toast.success("Chat preferences saved.", "Saved");
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Settings</h1>
          <p className="text-slate-400 text-xs">
            Manage your account and preferences
          </p>
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
              d="M6 12.5A1.5 1.5 0 0 1 7.5 11h4a1.5 1.5 0 0 1 1.5 1.5V14a1 1 0 0 0 2 0v-1.5A3.5 3.5 0 0 0 11.5 9h-4A3.5 3.5 0 0 0 4 12.5V14a1 1 0 0 0 2 0v-1.5ZM8 1a.75.75 0 0 1 .75.75v5.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 1.06-1.06l.72.72V1.75A.75.75 0 0 1 8 1Z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-6 pb-10">
          {/* Profile */}
          <Section
            title="Profile"
            description="Your account information. Email cannot be changed here — contact support for updates."
          >
            <Row label="Full name" htmlFor="name">
              <Input id="name" value={user.name} readOnly />
            </Row>
            <Row label="Email address" htmlFor="email">
              <Input id="email" value={user.email} readOnly />
            </Row>
            <Row
              label="User ID"
              hint="Include this when contacting support about ingestion or API issues."
              htmlFor="userId"
            >
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
            </Row>
          </Section>

          {/* Chat Preferences */}
          <Section
            title="Chat preferences"
            description="Configure how the chat assistant behaves for your account."
          >
            <form onSubmit={savePreferences}>
              <Row
                label="Default model"
                hint="Larger models are more capable but slower."
                htmlFor="model"
              >
                <Select id="model" name="model" defaultValue="gpt-4o">
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Row>
              <Row
                label="Retrieval chunks (top_k)"
                hint="Chunks retrieved per query. Higher values give more context but increase token usage."
                htmlFor="topK"
              >
                <Input
                  id="topK"
                  name="topK"
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="5"
                />
              </Row>
              <Row
                label="System prompt"
                hint="Overrides the default assistant behavior for all your chats."
                htmlFor="contextPrompt"
              >
                <Textarea
                  id="contextPrompt"
                  name="contextPrompt"
                  className="min-h-24"
                  placeholder="e.g. You are a helpful assistant for an HR department. Keep answers concise and professional."
                />
              </Row>
              <div className="flex items-center gap-3 px-5 py-4">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving…" : "Save preferences"}
                </Button>
              </div>
            </form>
          </Section>

          {/* About you (onboarding) */}
          <Section
            title="About you"
            description="The details you shared when you joined — used to improve Datalk for teams like yours."
          >
            <Row
              label="Onboarding status"
              hint="You can update these answers anytime."
            >
              {onboardingLoading ? (
                <p className="text-sm text-slate-400">Loading…</p>
              ) : onboarding ? (
                <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
                  <p className="text-slate-700">
                    <span className="font-medium">Country:</span>{" "}
                    {countryName(onboarding.country)}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium">Heard about Datalk via:</span>{" "}
                    {onboarding.heardFrom}
                  </p>
                  {onboarding.role && (
                    <p className="text-slate-700">
                      <span className="font-medium">Role:</span>{" "}
                      {onboarding.role}
                    </p>
                  )}
                  {onboarding.companySize && (
                    <p className="text-slate-700">
                      <span className="font-medium">Team size:</span>{" "}
                      {onboarding.companySize}
                    </p>
                  )}
                  {onboarding.notes && (
                    <p className="text-slate-500">{onboarding.notes}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  You skipped the onboarding questions when you signed up.
                </p>
              )}
              <div className="mt-2">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {onboarding ? "Update details" : "Complete onboarding"}
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
            </Row>
          </Section>

          {/* Quick links */}
          <Section
            title="Data"
            description="Jump to the places that manage your content."
          >
            <div className="flex flex-wrap gap-2.5 px-5 py-4">
              {[
                {
                  href: "/documents",
                  label: "Manage documents",
                  icon: (
                    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.086a1.5 1.5 0 0 1 1.06.44l1.415 1.413A1.5 1.5 0 0 0 9.122 4.5H12.5A1.5 1.5 0 0 1 14 6v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Z" />
                  ),
                },
                {
                  href: "/studio",
                  label: "Chatbot Studio",
                  icon: (
                    <path
                      fillRule="evenodd"
                      d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8Zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.208C3.438 7.96 3 8.914 3 10a5 5 0 0 0 10 0 6.96 6.96 0 0 1-.185-1.741Z"
                      clipRule="evenodd"
                    />
                  ),
                },
                {
                  href: "/analytics",
                  label: "View analytics",
                  icon: (
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                  ),
                },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 text-[13px] transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          </Section>

          {/* Danger Zone */}
          <Section
            tone="danger"
            title="Danger zone"
            description="Irreversible actions — proceed with caution."
          >
            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3">
                <div>
                  <p className="font-medium text-red-800 text-sm">
                    Delete all conversations
                  </p>
                  <p className="text-red-500 text-xs">
                    Permanently removes your entire chat history. This cannot be
                    undone.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-red-600 text-[13px] font-medium transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3">
                <div>
                  <p className="font-medium text-red-800 text-sm">
                    Delete all documents
                  </p>
                  <p className="text-red-500 text-xs">
                    Removes all uploaded documents and their embeddings. Chats
                    will stop working.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-red-600 text-[13px] font-medium transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
