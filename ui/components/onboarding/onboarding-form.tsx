"use client";

import { Button } from "@template/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/api-error";
import { COUNTRIES } from "@/lib/countries";
import type { OnboardingSubmission } from "@/lib/onboarding-store";
import { toast } from "@/stores/toast-store";

const HEARD_FROM_OPTIONS = [
  "Google search",
  "LinkedIn",
  "Twitter / X",
  "YouTube",
  "Friend or colleague",
  "Blog or article",
  "Event / webinar",
  "Other",
];

const ROLE_OPTIONS = [
  "Founder / Executive",
  "Developer / Engineer",
  "Product manager",
  "Marketing",
  "Customer support",
  "Student / Researcher",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  "Just me",
  "2–10",
  "11–50",
  "51–200",
  "201–1000",
  "1000+",
];

export function OnboardingForm({
  user,
  initial,
}: {
  user: { id: string; email: string; name: string };
  initial: OnboardingSubmission | null;
}) {
  const router = useRouter();
  const [country, setCountry] = useState(initial?.country ?? "");
  const [heardFrom, setHeardFrom] = useState(initial?.heardFrom ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [companySize, setCompanySize] = useState(initial?.companySize ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Editing mode (returning user updating their answers) vs first-time signup.
  const isEditing = Boolean(initial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!country) {
      setFieldError("Please select your country.");
      return;
    }
    if (!heardFrom) {
      setFieldError("Please tell us how you heard about Datalk.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, heardFrom, role, companySize, notes }),
      });

      if (!response.ok) {
        toast.error(
          await readApiError(response, "Could not save your details."),
        );
        return;
      }

      toast.success(
        isEditing
          ? "Your details were updated."
          : "Thanks! Your workspace is ready.",
        "Welcome to Datalk",
      );
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {fieldError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] leading-5 text-red-700"
        >
          {fieldError}
        </p>
      )}

      {/* Country */}
      <Field
        id="onboarding-country"
        label="Which country are you in?"
        hint="We use this to understand where our users are based."
        required
      >
        <select
          id="onboarding-country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <option value="">Select your country…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {/* How did you hear about us */}
      <Field
        id="onboarding-heard-from"
        label="How did you hear about Datalk?"
        hint="Helps us improve how we reach people."
        required
      >
        <select
          id="onboarding-heard-from"
          value={heardFrom}
          onChange={(e) => setHeardFrom(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <option value="">Select an option…</option>
          {HEARD_FROM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {/* Role */}
      <Field
        id="onboarding-role"
        label="What best describes you?"
        hint="Optional — helps us tailor the experience."
      >
        <select
          id="onboarding-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <option value="">Select an option…</option>
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {/* Company size */}
      <Field
        id="onboarding-company-size"
        label="How big is your team?"
        hint="Optional."
      >
        <select
          id="onboarding-company-size"
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <option value="">Select an option…</option>
          {COMPANY_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {/* Notes */}
      <Field
        id="onboarding-notes"
        label="Anything else you'd like to tell us?"
        hint="Optional — e.g. what you plan to build with Datalk."
      >
        <textarea
          id="onboarding-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </Field>

      <div className="mt-1 flex flex-col gap-2.5">
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving…" : isEditing ? "Save changes" : "Finish setup"}
        </Button>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700"
          >
            Skip for now
          </button>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-400">
        Signed in as{" "}
        <span className="font-medium text-slate-600">{user.email}</span>. These
        details help us improve Datalk for teams like yours.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
