import { promises as fs } from "node:fs";
import path from "node:path";
import type { EmbedConfig } from "@template/contracts";
import { getAdminUsername } from "./admin-store";
import {
  listOnboardingSubmissions,
  type OnboardingSubmission,
} from "./onboarding-store";
import { listUsers, type StoredUserProfile } from "./user-store";

/**
 * Aggregates everything the admin panel displays.
 *
 * Local JSON stores back onboarding + users today. Embed configs and the
 * knowledge-gap feedback inbox are owned by the chat/embed backend — the
 * frontend reads local development snapshots if present, otherwise the tabs
 * show an empty state. The backend admin contract (documented in
 * `ONBOARDING_ADMIN_BACKEND_API.md`) defines the production endpoints that
 * replace these reads: GET /admin/embed-configs and GET /admin/feedback.
 */

export interface AdminFeedbackItem {
  id: string;
  botId?: string;
  question: string;
  answer?: string | null;
  reason: string;
  visitorEmail?: string | null;
  pageUrl?: string | null;
  createdAt: string;
}

export interface AdminOverview {
  onboarding: Array<OnboardingSubmission & { user?: StoredUserProfile | null }>;
  users: StoredUserProfile[];
  embedConfigs: EmbedConfig[];
  feedback: AdminFeedbackItem[];
  adminUsername: string;
  generatedAt: string;
}

const dataDirectory = path.join(process.cwd(), ".data");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function readEmbedConfigs(): Promise<EmbedConfig[]> {
  const raw = await readJsonFile<{ configs?: EmbedConfig[] } | EmbedConfig[]>(
    path.join(dataDirectory, "embed-configs.json"),
  );
  if (!raw) return [];
  return Array.isArray(raw) ? raw : (raw.configs ?? []);
}

async function readFeedback(): Promise<AdminFeedbackItem[]> {
  const raw = await readJsonFile<
    { feedback?: AdminFeedbackItem[] } | AdminFeedbackItem[]
  >(path.join(dataDirectory, "feedback.json"));
  if (!raw) return [];
  return Array.isArray(raw) ? raw : (raw.feedback ?? []);
}

export async function collectAdminOverview(): Promise<AdminOverview> {
  const [submissions, users, embedConfigs, feedback, adminUsername] =
    await Promise.all([
      listOnboardingSubmissions(),
      listUsers(),
      readEmbedConfigs(),
      readFeedback(),
      getAdminUsername(),
    ]);

  const userById = new Map(users.map((u) => [u.id, u]));

  return {
    onboarding: submissions.map((submission) => ({
      ...submission,
      user: userById.get(submission.userId) ?? null,
    })),
    users,
    embedConfigs,
    feedback,
    adminUsername,
    generatedAt: new Date().toISOString(),
  };
}
