import type { EmbedConfig } from "@template/contracts";
import { optionalNumber } from "@/lib/embed-mappers";

/**
 * UI-only widget appearance overrides (width / height / edge offset / input
 * placeholder), persisted in localStorage per chatbot.
 *
 * Why not the backend? The chatbot config API owns the visual identity
 * (name, colors, messages...). Sending extra fields it doesn't know about
 * makes strict validators reject the WHOLE save with HTTP 422. The widget
 * doesn't need these in the database anyway: the install snippet carries
 * them as `data-*` attributes on its own <script> tag (see
 * api/embed/script/route.ts), and the Embed Studio keeps its own copy here
 * so the form remembers what you configured. If backend support is added
 * later, toEmbedConfig already maps the fields back.
 */

export interface EmbedAppearance {
  widgetWidth: number;
  widgetHeight: number;
  launcherOffset: number;
  inputPlaceholder: string;
}

export const APPEARANCE_DEFAULTS: EmbedAppearance = {
  widgetWidth: 400,
  widgetHeight: 640,
  launcherOffset: 24,
  inputPlaceholder: "Ask a question...",
};

const KEY_PREFIX = "datalk-appearance-";

function storageKey(botId: string) {
  return `${KEY_PREFIX}${botId}`;
}

function sanitize(raw: unknown): Partial<EmbedAppearance> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: Partial<EmbedAppearance> = {};
  const width = optionalNumber(input.widgetWidth, 280, 560);
  const height = optionalNumber(input.widgetHeight, 400, 860);
  const offset = optionalNumber(input.launcherOffset, 0, 120);
  if (width !== undefined) out.widgetWidth = width;
  if (height !== undefined) out.widgetHeight = height;
  if (offset !== undefined) out.launcherOffset = offset;
  const placeholder =
    typeof input.inputPlaceholder === "string"
      ? input.inputPlaceholder.trim().slice(0, 80)
      : "";
  if (placeholder) out.inputPlaceholder = placeholder;
  return out;
}

/** Reads stored overrides for one chatbot ({} when nothing stored / SSR). */
export function loadAppearance(botId: string): Partial<EmbedAppearance> {
  if (typeof window === "undefined" || !botId) return {};
  try {
    const raw = window.localStorage.getItem(storageKey(botId));
    if (!raw) return {};
    return sanitize(JSON.parse(raw));
  } catch {
    return {};
  }
}

/** Persists the overrides for one chatbot. */
export function saveAppearance(
  botId: string,
  values: Partial<EmbedAppearance>,
) {
  if (typeof window === "undefined" || !botId) return;
  try {
    window.localStorage.setItem(
      storageKey(botId),
      JSON.stringify(sanitize(values)),
    );
  } catch {
    // Storage full/blocked — appearance simply won't be remembered across
    // page loads; the snippet still carries the values.
  }
}

/**
 * Merge order for what the studio edits and the snippet carries:
 * localStorage override → backend value (if supported) → built-in default.
 */
export function resolveAppearance(
  config: EmbedConfig | null,
  botId?: string | null,
): EmbedAppearance {
  const id = botId ?? config?.id ?? "";
  const stored = id ? loadAppearance(id) : {};
  return {
    widgetWidth:
      stored.widgetWidth ??
      config?.widgetWidth ??
      APPEARANCE_DEFAULTS.widgetWidth,
    widgetHeight:
      stored.widgetHeight ??
      config?.widgetHeight ??
      APPEARANCE_DEFAULTS.widgetHeight,
    launcherOffset:
      stored.launcherOffset ??
      config?.launcherOffset ??
      APPEARANCE_DEFAULTS.launcherOffset,
    inputPlaceholder:
      stored.inputPlaceholder ??
      config?.inputPlaceholder ??
      APPEARANCE_DEFAULTS.inputPlaceholder,
  };
}

/** Escapes a string for use inside an HTML attribute in the snippet text. */
export function escapeHtmlAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Builds the full install snippet. The data-* attributes are read by the
 * generated widget script straight off its own <script> tag on the host
 * page — that is how sizing reaches the widget without backend storage.
 */
export function buildInstallSnippet(
  origin: string,
  apiKey: string,
  appearance: EmbedAppearance,
) {
  const placeholder = escapeHtmlAttr(
    appearance.inputPlaceholder || APPEARANCE_DEFAULTS.inputPlaceholder,
  );
  return (
    `<script async src="${origin}/api/embed/script?apiKey=${apiKey}"` +
    ` data-width="${appearance.widgetWidth}"` +
    ` data-height="${appearance.widgetHeight}"` +
    ` data-offset="${appearance.launcherOffset}"` +
    ` data-placeholder="${placeholder}"></script>`
  );
}
