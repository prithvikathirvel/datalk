import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Local JSON store for first-time onboarding submissions
 * (country, how they heard about us, role, team size, notes).
 *
 * This is the development/demo implementation. The production contract for
 * the backend service that replaces this file is documented in
 * `ONBOARDING_ADMIN_BACKEND_API.md` at the repository root — the Next.js BFF
 * route (`ui/app/api/onboarding/route.ts`) is the single place that would
 * switch from this store to calling that backend.
 */

export interface OnboardingSubmission {
  /** User id this submission belongs to. */
  userId: string;
  /** ISO 3166-1 alpha-2 country code. Required. */
  country: string;
  /** How the user heard about Datalk. Required. */
  heardFrom: string;
  /** What best describes the user (free-form select). Optional. */
  role?: string;
  /** Organisation size band. Optional. */
  companySize?: string;
  /** Free-form notes. Optional. */
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const dataDirectory = path.join(process.cwd(), ".data");
const onboardingFile = path.join(dataDirectory, "onboarding.json");

interface OnboardingFileShape {
  submissions: OnboardingSubmission[];
}

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(onboardingFile);
  } catch {
    await fs.writeFile(
      onboardingFile,
      JSON.stringify({ submissions: [] }, null, 2),
      "utf8",
    );
  }
}

async function readSubmissions(): Promise<OnboardingSubmission[]> {
  await ensureStore();
  const content = await fs.readFile(onboardingFile, "utf8");
  const parsed = JSON.parse(content) as OnboardingFileShape;
  return parsed.submissions ?? [];
}

async function writeSubmissions(submissions: OnboardingSubmission[]) {
  await ensureStore();
  await fs.writeFile(
    onboardingFile,
    JSON.stringify({ submissions }, null, 2),
    "utf8",
  );
}

/** Get the current submission for a user, or null if they never submitted. */
export async function getOnboardingForUser(
  userId: string,
): Promise<OnboardingSubmission | null> {
  const submissions = await readSubmissions();
  return submissions.find((s) => s.userId === userId) ?? null;
}

/** Create or update the submission for a user. */
export async function upsertOnboarding(
  userId: string,
  input: Pick<
    OnboardingSubmission,
    "country" | "heardFrom" | "role" | "companySize" | "notes"
  >,
): Promise<OnboardingSubmission> {
  const now = new Date().toISOString();
  const submissions = await readSubmissions();
  const existing = submissions.find((s) => s.userId === userId);

  const submission: OnboardingSubmission = {
    userId,
    country: input.country.trim(),
    heardFrom: input.heardFrom.trim(),
    role: input.role?.trim() || undefined,
    companySize: input.companySize?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    Object.assign(existing, submission);
  } else {
    submissions.push(submission);
  }

  await writeSubmissions(submissions);
  return submission;
}

/** All submissions, newest first — used by the admin panel. */
export async function listOnboardingSubmissions(): Promise<
  OnboardingSubmission[]
> {
  const submissions = await readSubmissions();
  return submissions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
