import type {
  ApiKey,
  EmbedConfig,
  EmbedConfigSource,
  EmbedFeedback,
  EmbedPosition,
} from "@template/contracts";

/**
 * Translation layer between the Datalk Chat Service and the UI contracts.
 * The embed config endpoints return camelCase JSON; the other endpoints
 * (api_keys, feedback, sources) return snake_case — those shapes are kept
 * as-is below.
 */

// ─── Backend shapes ──────────────────────────────────────────────────────────

/** Matches EmbedConfig / EmbedConfigPublic from the OpenAPI spec (camelCase). */
export interface BackendEmbedConfig {
  id: string;
  userId?: string;
  botName: string;
  botDescription?: string | null;
  welcomeMessage: string;
  fallbackMessage: string;
  suggestedQuestions?: string[];
  primaryColor?: string;
  chatBackground?: string | null;
  position?: string;
  launcherLabel?: string;
  launcherStyle?: "circle" | "rounded" | "square" | null;
  avatarInitials: string;
  borderRadiusStyle?: string | null;
  widgetShadow?: string | null;
  fontFamily?: string | null;
  showPoweredBy?: boolean;
  allowedOrigins?: string[];
  collectVisitorEmail?: boolean;
  isActive?: boolean;
  model?: string | null;
  sourceDocumentIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendApiKeyCreated {
  id: string;
  config_id: string;
  name: string;
  key_prefix: string;
  api_key: string;
  expires_at?: string | null;
  created_at: string;
}

export interface BackendEmbedConfigSource {
  config_id: string;
  document_id: string;
  document_filename: string;
  added_at: string;
}

export interface BackendEmbedFeedback {
  id: string;
  config_id: string;
  user_id: string;
  thread_id?: string | null;
  question: string;
  answer?: string | null;
  visitor_email?: string | null;
  page_url?: string | null;
  parent_origin?: string | null;
  reason: EmbedFeedback["reason"];
  created_at: string;
}

// ─── Backend → UI ────────────────────────────────────────────────────────────

function optional(value: string | null | undefined) {
  return value ?? undefined;
}

export function toEmbedConfig(input: BackendEmbedConfig): EmbedConfig {
  return {
    id: input.id,
    userId: input.userId ?? "",
    botName: input.botName,
    botDescription: optional(input.botDescription),
    welcomeMessage: input.welcomeMessage,
    fallbackMessage: input.fallbackMessage,
    suggestedQuestions: input.suggestedQuestions ?? [],
    primaryColor: input.primaryColor ?? "#0f172a",
    chatBackground: optional(input.chatBackground),
    position: (input.position ?? "bottom-right") as EmbedPosition,
    launcherLabel: input.launcherLabel ?? "Chat",
    launcherStyle: input.launcherStyle ?? undefined,
    avatarInitials: input.avatarInitials,
    borderRadiusStyle:
      (input.borderRadiusStyle as EmbedConfig["borderRadiusStyle"]) ?? undefined,
    widgetShadow:
      (input.widgetShadow as EmbedConfig["widgetShadow"]) ?? undefined,
    fontFamily: optional(input.fontFamily),
    showPoweredBy: input.showPoweredBy ?? true,
    allowedOrigins: input.allowedOrigins ?? [],
    collectVisitorEmail: input.collectVisitorEmail ?? false,
    isActive: input.isActive ?? true,
    model: optional(input.model),
    sourceDocumentIds: input.sourceDocumentIds ?? [],
    createdAt: input.createdAt ?? "",
    updatedAt: input.updatedAt ?? "",
  };
}

export function toApiKey(input: BackendApiKeyCreated): ApiKey {
  return {
    id: input.id,
    configId: input.config_id,
    keyPrefix: input.key_prefix,
    name: input.name,
    isActive: true,
    expiresAt: optional(input.expires_at),
    createdAt: input.created_at,
  };
}

export function toEmbedConfigSource(
  input: BackendEmbedConfigSource,
): EmbedConfigSource {
  return {
    documentId: input.document_id,
    documentFilename: input.document_filename,
    addedAt: input.added_at,
  };
}

export function toEmbedFeedback(input: BackendEmbedFeedback): EmbedFeedback {
  return {
    id: input.id,
    botId: input.config_id,
    userId: input.user_id,
    threadId: optional(input.thread_id),
    question: input.question,
    answer: optional(input.answer),
    visitorEmail: optional(input.visitor_email),
    pageUrl: optional(input.page_url),
    parentOrigin: optional(input.parent_origin),
    reason: input.reason,
    createdAt: input.created_at,
  };
}

// ─── UI → Backend ────────────────────────────────────────────────────────────

function cleanList(values: unknown, limit?: number) {
  if (!Array.isArray(values)) return [];
  const cleaned = values
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  return limit ? cleaned.slice(0, limit) : cleaned;
}

/** Normalises a user-entered origin to a bare scheme+host, or null. */
export function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
      .origin;
  } catch {
    return null;
  }
}

function sanitizeHexColor(value: unknown, fallback: string) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

export interface EmbedConfigFormInput {
  botName?: string;
  botDescription?: string;
  welcomeMessage?: string;
  fallbackMessage?: string;
  suggestedQuestions?: string[];
  primaryColor?: string;
  chatBackground?: string;
  position?: string;
  launcherLabel?: string;
  launcherStyle?: string;
  avatarInitials?: string;
  borderRadiusStyle?: string;
  widgetShadow?: string;
  fontFamily?: string;
  showPoweredBy?: boolean;
  allowedOrigins?: string[];
  collectVisitorEmail?: boolean;
  isActive?: boolean;
  model?: string;
}

/**
 * Builds the create/update payload. `EmbedConfigCreate` requires bot_name,
 * welcome_message, fallback_message and avatar_initials, so those fall back to
 * sensible defaults rather than failing validation.
 */
export function toBackendConfigPayload(
  input: EmbedConfigFormInput,
): Record<string, unknown> {
  const allowedOrigins = cleanList(input.allowedOrigins)
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  return {
    bot_name: input.botName?.trim() || "AI Assistant",
    bot_description: input.botDescription?.trim() || null,
    welcome_message:
      input.welcomeMessage?.trim() ||
      "Hi! Ask me anything about our documents.",
    fallback_message:
      input.fallbackMessage?.trim() ||
      "I could not find a confident answer. Share your email and our team can follow up.",
    suggested_questions: cleanList(input.suggestedQuestions, 6),
    primary_color: sanitizeHexColor(input.primaryColor, "#0f172a"),
    chat_background: input.chatBackground?.trim() || null,
    position: input.position === "bottom-left" ? "bottom-left" : "bottom-right",
    launcher_label: input.launcherLabel?.trim() || "Chat",
    launcher_style: input.launcherStyle || "circle",
    // Backend caps avatar_initials at 4 characters.
    avatar_initials:
      input.avatarInitials?.trim().slice(0, 4).toUpperCase() || "AI",
    border_radius_style: input.borderRadiusStyle || "rounded",
    widget_shadow: input.widgetShadow || "soft",
    font_family: input.fontFamily || "system",
    show_powered_by: input.showPoweredBy ?? true,
    allowed_origins: Array.from(new Set(allowedOrigins)),
    collect_visitor_email: input.collectVisitorEmail ?? false,
    is_active: input.isActive ?? true,
    model: input.model?.trim() || null,
  };
}
