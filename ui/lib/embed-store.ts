import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  EmbedConfig,
  EmbedFeedback,
  EmbedPosition,
} from "@template/contracts";

interface EmbedStoreShape {
  configs: EmbedConfig[];
  feedback: EmbedFeedback[];
}

export interface EmbedConfigInput {
  id?: string;
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  position: EmbedPosition;
  launcherLabel: string;
  avatarInitials: string;
  allowedOrigins: string[];
  suggestedQuestions: string[];
  fallbackMessage: string;
  collectVisitorEmail: boolean;
  model?: string;
  isActive: boolean;
}

const dataDirectory =
  process.env.VERCEL
    ? "/tmp/datalk"
    : path.join(process.cwd(), ".data");
const embedFile = path.join(dataDirectory, "embed-configs.json");

const defaultStore: EmbedStoreShape = {
  configs: [],
  feedback: [],
};

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(embedFile);
  } catch {
    await fs.writeFile(
      embedFile,
      JSON.stringify(defaultStore, null, 2),
      "utf8",
    );
  }
}

async function readStore(): Promise<EmbedStoreShape> {
  await ensureStore();
  const content = await fs.readFile(embedFile, "utf8");
  const parsed = JSON.parse(content) as Partial<EmbedStoreShape>;
  return {
    configs: parsed.configs ?? [],
    feedback: parsed.feedback ?? [],
  };
}

async function writeStore(store: EmbedStoreShape) {
  await ensureStore();
  await fs.writeFile(embedFile, JSON.stringify(store, null, 2), "utf8");
}

export function sanitizeHexColor(value: string) {
  const color = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#0f172a";
}

export function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );
    return url.origin;
  } catch {
    return null;
  }
}

export function isOriginAllowed(config: EmbedConfig, origin?: string | null) {
  if (!config.allowedOrigins.length) {
    return true;
  }
  if (!origin) {
    return false;
  }
  const normalized = normalizeOrigin(origin);
  return normalized ? config.allowedOrigins.includes(normalized) : false;
}

export async function listEmbedConfigs(userId: string) {
  const store = await readStore();
  return store.configs
    .filter((config) => config.userId === userId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getEmbedConfig(id: string) {
  const store = await readStore();
  return store.configs.find((config) => config.id === id) ?? null;
}

export async function upsertEmbedConfig(
  userId: string,
  input: EmbedConfigInput,
) {
  const store = await readStore();
  const now = new Date().toISOString();
  const allowedOrigins = input.allowedOrigins
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  const suggestedQuestions = input.suggestedQuestions
    .map((question) => question.trim())
    .filter(Boolean)
    .slice(0, 6);

  const existingIndex = input.id
    ? store.configs.findIndex(
        (config) => config.id === input.id && config.userId === userId,
      )
    : -1;

  const config: EmbedConfig = {
    id: existingIndex >= 0 ? store.configs[existingIndex].id : randomUUID(),
    userId,
    botName: input.botName.trim() || "AI Assistant",
    welcomeMessage:
      input.welcomeMessage.trim() || "Hi! Ask me anything about our documents.",
    primaryColor: sanitizeHexColor(input.primaryColor),
    position: input.position,
    launcherLabel: input.launcherLabel.trim() || "Chat with us",
    avatarInitials:
      input.avatarInitials.trim().slice(0, 2).toUpperCase() || "AI",
    allowedOrigins: Array.from(new Set(allowedOrigins)),
    suggestedQuestions,
    fallbackMessage:
      input.fallbackMessage.trim() ||
      "I could not find a confident answer. Share your email and our team can follow up.",
    collectVisitorEmail: input.collectVisitorEmail,
    model: input.model?.trim() || undefined,
    isActive: input.isActive,
    createdAt:
      existingIndex >= 0 ? store.configs[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store.configs[existingIndex] = config;
  } else {
    store.configs.push(config);
  }

  await writeStore(store);
  return config;
}

export async function deleteEmbedConfig(userId: string, id: string) {
  const store = await readStore();
  const before = store.configs.length;
  store.configs = store.configs.filter(
    (config) => !(config.id === id && config.userId === userId),
  );
  await writeStore(store);
  return store.configs.length < before;
}

export async function addEmbedFeedback(
  config: EmbedConfig,
  input: {
    threadId?: string;
    question: string;
    answer?: string;
    visitorEmail?: string;
    pageUrl?: string;
    parentOrigin?: string;
    reason: EmbedFeedback["reason"];
  },
) {
  const store = await readStore();
  const feedback: EmbedFeedback = {
    id: randomUUID(),
    botId: config.id,
    userId: config.userId,
    threadId: input.threadId,
    question: input.question.trim(),
    answer: input.answer?.trim() || undefined,
    visitorEmail: input.visitorEmail?.trim() || undefined,
    pageUrl: input.pageUrl?.trim() || undefined,
    parentOrigin: input.parentOrigin?.trim() || undefined,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };
  store.feedback.push(feedback);
  await writeStore(store);
  return feedback;
}

export async function listEmbedFeedback(userId: string, botId?: string | null) {
  const store = await readStore();
  return store.feedback
    .filter(
      (item) => item.userId === userId && (!botId || item.botId === botId),
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
