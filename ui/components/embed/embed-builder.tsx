"use client";

import type {
  ApiKey,
  EmbedConfig,
  EmbedFeedback,
  EmbedPosition,
} from "@template/contracts";
import {
  Badge,
  Button,
  cn,
  Input,
  Label,
  Select,
  Textarea,
} from "@template/ui";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { ApiKeyModal } from "@/components/embed/api-key-modal";
import { ApiKeysPanel } from "@/components/embed/api-keys-panel";
import { SourcesPanel } from "@/components/embed/sources-panel";
import { DataTable } from "@/components/ui/data-table";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import { formatDateTime } from "@/lib/format";

const defaults = {
  botName: "Docs Assistant",
  welcomeMessage: "Hi! I can answer questions from our documents.",
  primaryColor: "#0f172a",
  position: "bottom-right" as EmbedPosition,
  launcherLabel: "Ask AI",
  avatarInitials: "AI",
  allowedOrigins: [] as string[],
  suggestedQuestions: [
    "What can you help me with?",
    "Summarize the key points",
    "How do I get started?",
  ],
  fallbackMessage:
    "I could not find a confident answer. Leave your email and our team can follow up.",
  collectVisitorEmail: true,
  model: "",
  isActive: true,
  fontFamily: "system",
  chatBackground: "#f8fafc",
  launcherStyle: "circle" as const,
  borderRadiusStyle: "rounded" as const,
  widgetShadow: "soft" as const,
  botDescription: "Answers from your documents",
  contextPrompt: "",
  showPoweredBy: true,
};

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
  } | null;
  return data?.detail ?? "Request failed.";
}

type EditorTab =
  | "brand"
  | "messages"
  | "sources"
  | "security"
  | "keys"
  | "feedback";

const EDITOR_TABS: Array<{ id: EditorTab; label: string; icon: ReactNode }> = [
  {
    id: "brand",
    label: "Brand",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Messages",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "sources",
    label: "Sources",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "keys",
    label: "API Keys",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export function EmbedBuilder() {
  const [configs, setConfigs] = useState<EmbedConfig[]>([]);
  const [feedback, setFeedback] = useState<EmbedFeedback[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState(false);
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>("brand");
  const [previewWidth, setPreviewWidth] = useState(440);
  /** Raw API key held only long enough to show the one-time modal. */
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [issuedKey, setIssuedKey] = useState<ApiKey | null>(null);
  const [keyModalKind, setKeyModalKind] = useState<"created" | "rotated">(
    "created",
  );
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = previewWidth;

    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return;
      const delta = dragStartX.current - ev.clientX;
      setPreviewWidth(
        Math.max(240, Math.min(640, dragStartWidth.current + delta)),
      );
    }

    function onUp() {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function openStudio(id: string | null) {
    setSelectedId(id);
    // The raw key belongs to one chatbot only — never carry it across.
    setRevealedKey(null);
    setIssuedKey(null);
    setActiveTab("brand");
    setNotice(id ? null : "Creating a new chatbot — save when ready.");
    setError(null);
    setStudioMode(true);
  }

  function backToList() {
    setStudioMode(false);
    setNotice(null);
    setError(null);
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConfigs(nextSelectedId?: string | null) {
    setError(null);
    const configsResponse = await fetch("/api/embed/configs", { cache: "no-store" });

    if (!configsResponse.ok) {
      setError(await readError(configsResponse));
      return;
    }

    const configsData = (await configsResponse.json()) as {
      configs: EmbedConfig[];
    };
    setConfigs(configsData.configs);
    if (nextSelectedId !== undefined) {
      setSelectedId(nextSelectedId);
    }
  }

  async function loadFeedback() {
    const feedbackResponse = await fetch("/api/embed/feedback", { cache: "no-store" });
    if (feedbackResponse.ok) {
      const feedbackData = (await feedbackResponse.json()) as {
        feedback: EmbedFeedback[];
      };
      setFeedback(feedbackData.feedback);
    }
  }

  async function loadAll(nextSelectedId?: string | null) {
    setLoading(true);
    setError(null);
    await Promise.all([loadConfigs(nextSelectedId), loadFeedback()]);
    setLoading(false);
  }

  async function saveConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const isCreating = !selectedId;
    setSaving(true);
    setError(null);
    setNotice(null);

    const response = await fetch("/api/embed/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedId ?? undefined,
        botName: String(formData.get("botName") ?? defaults.botName),
        welcomeMessage: String(
          formData.get("welcomeMessage") ?? defaults.welcomeMessage,
        ),
        primaryColor: String(
          formData.get("primaryColor") ?? defaults.primaryColor,
        ),
        position: String(
          formData.get("position") ?? defaults.position,
        ) as EmbedPosition,
        launcherLabel: String(
          formData.get("launcherLabel") ?? defaults.launcherLabel,
        ),
        avatarInitials: String(
          formData.get("avatarInitials") ?? defaults.avatarInitials,
        ),
        allowedOrigins: String(formData.get("allowedOrigins") ?? "").split(
          "\n",
        ),
        suggestedQuestions: String(
          formData.get("suggestedQuestions") ?? "",
        ).split("\n"),
        fallbackMessage: String(
          formData.get("fallbackMessage") ?? defaults.fallbackMessage,
        ),
        collectVisitorEmail: formData.get("collectVisitorEmail") === "on",
        model: String(formData.get("model") ?? ""),
        isActive: formData.get("isActive") === "on",
        // Extended brand fields — these are rendered in the Brand tab but were
        // previously omitted here, so every edit was silently discarded.
        botDescription: String(formData.get("botDescription") ?? ""),
        chatBackground: String(
          formData.get("chatBackground") ?? defaults.chatBackground,
        ),
        launcherStyle: String(
          formData.get("launcherStyle") ?? defaults.launcherStyle,
        ) as EmbedConfig["launcherStyle"],
        borderRadiusStyle: String(
          formData.get("borderRadiusStyle") ?? defaults.borderRadiusStyle,
        ) as EmbedConfig["borderRadiusStyle"],
        widgetShadow: String(
          formData.get("widgetShadow") ?? defaults.widgetShadow,
        ) as EmbedConfig["widgetShadow"],
        fontFamily: String(formData.get("fontFamily") ?? defaults.fontFamily),
        showPoweredBy: formData.get("showPoweredBy") === "on",
        contextPrompt: String(formData.get("contextPrompt") ?? ""),
      }),
    });

    setSaving(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    const data = (await response.json()) as {
      config: EmbedConfig;
      apiKey?: string;
      key?: ApiKey;
    };

    // A brand-new chatbot returns its raw API key exactly once.
    if (isCreating && data.apiKey) {
      setKeyModalKind("created");
      setRevealedKey(data.apiKey);
      setIssuedKey(data.key ?? null);
      setNotice("Chatbot created. Save your API key before closing.");
    } else {
      setNotice("Saved. Preview and install code updated.");
    }

    await loadConfigs(data.config.id);
    setSelectedId(data.config.id);
    setStudioMode(true);
  }

  async function deleteSelected() {
    if (!selectedId || !confirm("Delete this embed chatbot?")) return;
    const response = await fetch(`/api/embed/configs/${selectedId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setNotice("Embed chatbot deleted.");
    await loadConfigs(null);
    setStudioMode(false);
  }

  const selected = configs.find((c) => c.id === selectedId) ?? null;
  // The raw key is only in memory right after create/rotate. Once it is gone
  // the snippet shows a placeholder rather than a key we cannot recover.
  const snippetKey = revealedKey ?? "YOUR_API_KEY";
  const installCode = selected
    ? `<script async src="${origin}/api/embed/script?apiKey=${snippetKey}"></script>`
    : "Save a chatbot to generate the install code.";
  const gaps = feedback.filter(
    (item) => !selectedId || item.botId === selectedId,
  );
  const preview: EmbedConfig = selected ?? {
    id: "preview",
    userId: "preview",
    createdAt: "",
    updatedAt: "",
    ...defaults,
  };

  // ── List view ────────────────────────────────────────────────────────────────
  if (!studioMode) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h1 className="font-semibold text-slate-950">Embed Studio</h1>
            <p className="text-slate-400 text-xs">
              Deploy chatbots powered by your Datalk knowledge base
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadAll()}
              disabled={loading}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 0 1-2.64-6.36" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
              Refresh
            </Button>
            <Button onClick={() => openStudio(null)} size="sm">
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="mr-1.5 h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            New chatbot
          </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm">
              {notice}
            </div>
          )}
          <DataTable
            columns={[
              {
                key: "botName",
                header: "Chatbot name",
                render: (row) => (
                  <div>
                    <p className="font-medium text-slate-950">{row.botName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {row.botDescription ?? "No description"}
                    </p>
                  </div>
                ),
              },
              {
                key: "isActive",
                header: "Status",
                className: "w-24",
                render: (row) => (
                  <Badge variant={row.isActive ? "success" : "secondary"}>
                    {row.isActive ? "Live" : "Inactive"}
                  </Badge>
                ),
              },
              {
                key: "position",
                header: "Position",
                className: "w-36 hidden sm:table-cell",
                render: (row) => (
                  <span className="text-slate-600">{row.position}</span>
                ),
              },
              {
                key: "createdAt",
                header: "Created",
                className: "w-44 hidden lg:table-cell",
                render: (row) => (
                  <span className="text-slate-500">
                    {formatDateTime(row.createdAt)}
                  </span>
                ),
              },
              {
                key: "id",
                header: "",
                className: "w-24 text-right",
                render: (row) => (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openStudio(row.id);
                    }}
                  >
                    Open
                  </Button>
                ),
              },
            ]}
            rows={configs}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => openStudio(row.id)}
            loading={loading}
            emptyState={
              <div className="py-4 text-center">
                <p className="font-medium text-slate-700">No chatbots yet</p>
                <p className="mt-1 text-sm text-slate-400">
                  Create your first embed chatbot to get started
                </p>
                <button
                  type="button"
                  onClick={() => openStudio(null)}
                  className="mt-3 rounded-lg bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Create chatbot
                </button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  // ── Studio view ───────────────────────────────────────────────────────────────
  return (
    <>
      {revealedKey && (
        <ApiKeyModal
          apiKey={revealedKey}
          title={
            keyModalKind === "rotated" ? "Your new API key" : "Your API key"
          }
          description={
            keyModalKind === "rotated"
              ? "The previous key has been revoked. Update your install snippet with this key — it will not be shown again."
              : "Copy this key now — for your security it will not be shown again."
          }
          onClose={() => setRevealedKey(null)}
        />
      )}
      <div className="flex h-[calc(100dvh-4rem)] overflow-hidden bg-white lg:h-screen">
        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Breadcrumb header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-3.5">
            <div className="flex items-center gap-1.5 min-w-0 text-sm">
              <button
                type="button"
                onClick={backToList}
                className="flex items-center gap-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 shrink-0"
                aria-label="Back to embed list"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={backToList}
                className="text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
              >
                Embed Studio
              </button>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-3.5 w-3.5 text-slate-300 shrink-0"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
              <span className="font-medium text-slate-950 truncate">
                {selected?.botName ?? "New chatbot"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selected && (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    selected.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {selected.isActive ? "Live" : "Inactive"}
                </span>
              )}
            </div>
          </div>

          {/* Vercel-style tabs */}
          <div className="shrink-0 border-b border-slate-100 bg-white px-6 pt-1">
            <VercelTabs
              tabs={EDITOR_TABS}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as EditorTab)}
            />
          </div>

          {/* Content area */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Form section */}
            <div className="min-w-0 flex-1 overflow-y-auto">
              <form key={selected?.id ?? "new"} onSubmit={saveConfig}>
                <div className="space-y-5 p-6">
                  {error ? (
                    <StatusBanner tone="error">{error}</StatusBanner>
                  ) : null}
                  {notice ? (
                    <StatusBanner tone="success">{notice}</StatusBanner>
                  ) : null}

                  {/* Brand */}
                  <div
                    className={activeTab === "brand" ? "space-y-5" : "hidden"}
                  >
                    <p className="text-xs text-slate-400">
                      Visual identity and behavior of the widget on your
                      website.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Bot name" id="botName">
                        <Input
                          id="botName"
                          name="botName"
                          defaultValue={selected?.botName ?? defaults.botName}
                        />
                      </Field>
                      <Field label="Bot description" id="botDescription">
                        <Input
                          id="botDescription"
                          name="botDescription"
                          placeholder="Answers from your documents"
                          defaultValue={
                            selected?.botDescription ?? defaults.botDescription
                          }
                        />
                      </Field>
                      <Field label="Launcher label" id="launcherLabel">
                        <Input
                          id="launcherLabel"
                          name="launcherLabel"
                          defaultValue={
                            selected?.launcherLabel ?? defaults.launcherLabel
                          }
                        />
                      </Field>
                      <Field label="Avatar initials" id="avatarInitials">
                        <Input
                          id="avatarInitials"
                          name="avatarInitials"
                          maxLength={2}
                          defaultValue={
                            selected?.avatarInitials ?? defaults.avatarInitials
                          }
                        />
                      </Field>
                      <Field label="Primary color" id="primaryColor">
                        <div className="flex items-center gap-2">
                          <Input
                            id="primaryColor"
                            name="primaryColor"
                            type="color"
                            defaultValue={
                              selected?.primaryColor ?? defaults.primaryColor
                            }
                            className="h-10 w-14 shrink-0 cursor-pointer p-1"
                          />
                          <Input
                            name="primaryColorText"
                            defaultValue={
                              selected?.primaryColor ?? defaults.primaryColor
                            }
                            disabled
                            className="flex-1"
                          />
                        </div>
                      </Field>
                      <Field label="Chat background" id="chatBackground">
                        <div className="flex items-center gap-2">
                          <Input
                            id="chatBackground"
                            name="chatBackground"
                            type="color"
                            defaultValue={
                              selected?.chatBackground ??
                              defaults.chatBackground
                            }
                            className="h-10 w-14 shrink-0 cursor-pointer p-1"
                          />
                          <Input
                            name="chatBackgroundText"
                            defaultValue={
                              selected?.chatBackground ??
                              defaults.chatBackground
                            }
                            disabled
                            className="flex-1"
                          />
                        </div>
                      </Field>
                      <Field label="Widget position" id="position">
                        <Select
                          id="position"
                          name="position"
                          defaultValue={selected?.position ?? defaults.position}
                        >
                          <option value="bottom-right">Bottom right</option>
                          <option value="bottom-left">Bottom left</option>
                        </Select>
                      </Field>
                      <Field label="Launcher style" id="launcherStyle">
                        <Select
                          id="launcherStyle"
                          name="launcherStyle"
                          defaultValue={
                            selected?.launcherStyle ?? defaults.launcherStyle
                          }
                        >
                          <option value="circle">Circle</option>
                          <option value="rounded">Rounded rectangle</option>
                          <option value="square">Square</option>
                        </Select>
                      </Field>
                      <Field label="Border radius" id="borderRadiusStyle">
                        <Select
                          id="borderRadiusStyle"
                          name="borderRadiusStyle"
                          defaultValue={
                            selected?.borderRadiusStyle ??
                            defaults.borderRadiusStyle
                          }
                        >
                          <option value="rounded">Rounded (default)</option>
                          <option value="very-rounded">Very rounded</option>
                          <option value="square">Square</option>
                        </Select>
                      </Field>
                      <Field label="Widget shadow" id="widgetShadow">
                        <Select
                          id="widgetShadow"
                          name="widgetShadow"
                          defaultValue={
                            selected?.widgetShadow ?? defaults.widgetShadow
                          }
                        >
                          <option value="soft">Soft</option>
                          <option value="strong">Strong</option>
                          <option value="none">None</option>
                        </Select>
                      </Field>
                      <Field label="Font family" id="fontFamily">
                        <Select
                          id="fontFamily"
                          name="fontFamily"
                          defaultValue={
                            selected?.fontFamily ?? defaults.fontFamily
                          }
                        >
                          <option value="system">System UI (default)</option>
                          <option value="inter">Inter</option>
                          <option value="roboto">Roboto</option>
                          <option value="geist">Geist</option>
                        </Select>
                      </Field>
                      <Field label="Model override" id="model">
                        <Input
                          id="model"
                          name="model"
                          placeholder="Optional"
                          defaultValue={selected?.model ?? defaults.model}
                        />
                      </Field>
                    </div>
                    <div className="flex flex-wrap gap-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          name="showPoweredBy"
                          type="checkbox"
                          defaultChecked={
                            selected?.showPoweredBy ?? defaults.showPoweredBy
                          }
                        />
                        Show "Powered by Datalk"
                      </label>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className={
                      activeTab === "messages" ? "space-y-5" : "hidden"
                    }
                  >
                    <p className="text-xs text-slate-400">
                      Guide visitors and prepare fallbacks for unanswered
                      questions.
                    </p>
                    <Field label="Welcome message" id="welcomeMessage">
                      <Textarea
                        id="welcomeMessage"
                        name="welcomeMessage"
                        defaultValue={
                          selected?.welcomeMessage ?? defaults.welcomeMessage
                        }
                      />
                    </Field>
                    <Field
                      label="Suggested questions — one per line"
                      id="suggestedQuestions"
                    >
                      <Textarea
                        id="suggestedQuestions"
                        name="suggestedQuestions"
                        rows={5}
                        defaultValue={(
                          selected?.suggestedQuestions ??
                          defaults.suggestedQuestions
                        ).join("\n")}
                      />
                    </Field>
                    <Field
                      label="Fallback / handoff message"
                      id="fallbackMessage"
                    >
                      <Textarea
                        id="fallbackMessage"
                        name="fallbackMessage"
                        defaultValue={
                          selected?.fallbackMessage ?? defaults.fallbackMessage
                        }
                      />
                    </Field>
                    <div className="space-y-1.5">
                      <Label htmlFor="contextPrompt">Context Prompt</Label>
                      <Textarea
                        id="contextPrompt"
                        name="contextPrompt"
                        rows={5}
                        placeholder="You are the support assistant for Acme Store. Help customers with product details, shipping, returns, refunds, and warranty questions. Use the knowledge base first. If information is missing, ask the customer to contact support@acme.com. Keep answers short, friendly, and accurate."
                        defaultValue={
                          selected?.contextPrompt ?? defaults.contextPrompt
                        }
                      />
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        Private business/customer context and behavior instructions for the chatbot.
                        This guides the bot&apos;s personality, scope, and how it handles questions.
                      </p>
                    </div>
                  </div>

                  {/* Sources */}
                  <div
                    className={activeTab === "sources" ? "space-y-5" : "hidden"}
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-950">
                        Knowledge sources
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Restrict this chatbot to specific documents, or leave
                        everything unchecked to search your full library.
                      </p>
                    </div>
                    {activeTab === "sources" && (
                      <SourcesPanel
                        botId={selectedId}
                        onError={setError}
                        onSaved={setNotice}
                      />
                    )}
                  </div>

                  {/* Security */}
                  <div
                    className={
                      activeTab === "security" ? "space-y-5" : "hidden"
                    }
                  >
                    <p className="text-xs text-slate-400">
                      Restrict the widget to trusted websites before going to
                      production.
                    </p>
                    <Field
                      label="Allowed origins — one per line"
                      id="allowedOrigins"
                    >
                      <Textarea
                        id="allowedOrigins"
                        name="allowedOrigins"
                        rows={5}
                        placeholder="https://example.com"
                        defaultValue={(
                          selected?.allowedOrigins ?? defaults.allowedOrigins
                        ).join("\n")}
                      />
                      <p className="mt-1.5 text-xs text-slate-400">
                        Leave empty only while testing locally.
                      </p>
                    </Field>
                    <div className="flex flex-wrap gap-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          name="collectVisitorEmail"
                          type="checkbox"
                          defaultChecked={
                            selected?.collectVisitorEmail ??
                            defaults.collectVisitorEmail
                          }
                        />
                        Collect optional visitor email
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          name="isActive"
                          type="checkbox"
                          defaultChecked={
                            selected?.isActive ?? defaults.isActive
                          }
                        />
                        Widget active
                      </label>
                    </div>
                  </div>

                  {/* API keys */}
                  <div
                    className={activeTab === "keys" ? "space-y-5" : "hidden"}
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-950">
                        API keys
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        The install snippet authenticates with this key instead
                        of the chatbot ID.
                      </p>
                    </div>
                    {activeTab === "keys" && (
                      <ApiKeysPanel
                        botId={selectedId}
                        issuedKey={issuedKey}
                        onError={setError}
                        onKeyRotated={(rawKey, key) => {
                          setKeyModalKind("rotated");
                          setRevealedKey(rawKey);
                          setIssuedKey(key);
                          setNotice(
                            "Key rotated. Update your install snippet.",
                          );
                        }}
                      />
                    )}
                  </div>

                  {/* Feedback */}
                  <div
                    className={
                      activeTab === "feedback" ? "space-y-5" : "hidden"
                    }
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-950">
                        Knowledge gap inbox
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Visitor feedback becomes a backlog of missing answers to
                        improve your documents.
                      </p>
                    </div>
                    {gaps.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center text-sm text-slate-400">
                        No feedback yet for this chatbot.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {gaps.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  item.reason === "needs_human"
                                    ? "warning"
                                    : "secondary"
                                }
                              >
                                {item.reason.replaceAll("_", " ")}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {formatDateTime(item.createdAt)}
                              </span>
                            </div>
                            <p className="font-medium text-sm text-slate-950">
                              {item.question}
                            </p>
                            {item.answer ? (
                              <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                                {item.answer}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save bar — hidden on tabs that own their save action */}
                {activeTab !== "feedback" &&
                  activeTab !== "sources" &&
                  activeTab !== "keys" && (
                    <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 px-6 py-3 backdrop-blur">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">
                          Save to update the preview.
                        </p>
                        <div className="flex gap-2">
                          {selectedId ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={deleteSelected}
                              size="sm"
                            >
                              Delete
                            </Button>
                          ) : null}
                          <Button type="submit" size="sm" disabled={saving}>
                            {saving ? "Saving…" : "Save chatbot"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
              </form>
            </div>

            {/* Preview panel — resizable via drag handle */}
            <aside
              className="hidden xl:flex flex-col border-l border-slate-100 relative shrink-0 overflow-hidden"
              style={{ width: `${previewWidth}px` }}
            >
              {/* Drag handle */}
              <div
                className="group absolute inset-y-0 left-0 z-10 flex w-3 cursor-col-resize items-center justify-center"
                onMouseDown={startResize}
              >
                <div className="h-12 w-0.5 rounded-full bg-slate-200 transition-colors group-hover:bg-slate-500 group-active:bg-slate-700" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col pl-3 overflow-hidden">
                <div className="min-h-0 flex-1 overflow-hidden">
                  <FullPreview config={preview} />
                </div>
                <div className="shrink-0 border-t border-slate-100 p-4">
                  <InstallSection
                    code={installCode}
                    disabled={!selected}
                    hasLiveKey={Boolean(revealedKey)}
                    onCopied={() => setNotice("Install code copied.")}
                    onShowKeys={() => setActiveTab("keys")}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function FullPreview({ config }: { config: EmbedConfig }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-slate-950">Live preview</p>
        <span className="select-none text-[11px] text-slate-400">
          &larr; drag to resize
        </span>
      </div>
      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
        <div
          className="flex shrink-0 items-center gap-3 px-4 py-4"
          style={{ backgroundColor: config.primaryColor }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white">
            {config.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">
              {config.botName}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/80">
                {config.botDescription ?? "Online · answers from documents"}
              </span>
            </div>
          </div>
        </div>
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          style={{ backgroundColor: config.chatBackground ?? "#f8fafc" }}
        >
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
            {config.welcomeMessage}
          </div>
          <div
            className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-6 text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            What can you help with?
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
            I can answer questions from your uploaded documents!
          </div>
        </div>
        {config.suggestedQuestions.length > 0 && (
          <div
            className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-3"
            style={{ backgroundColor: config.chatBackground ?? "#f8fafc" }}
          >
            {config.suggestedQuestions.map((q) => (
              <div
                key={q}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
              >
                {q}
              </div>
            ))}
          </div>
        )}
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
            <span className="flex-1 text-sm text-slate-300">
              Ask a question…
            </span>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: config.primaryColor }}
            >
              <svg
                viewBox="0 0 10 10"
                className="h-3 w-3"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 5h8M6 2l3 3-3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstallSection({
  code,
  disabled,
  hasLiveKey,
  onCopied,
  onShowKeys,
}: {
  code: string;
  disabled: boolean;
  /** True while the raw key is still in memory from a create/rotate. */
  hasLiveKey: boolean;
  onCopied: () => void;
  onShowKeys: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-950">Install code</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Paste before the closing &lt;/body&gt; tag.
        </p>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
      {!disabled && !hasLiveKey && (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Replace{" "}
            <code className="rounded bg-slate-200 px-1 font-mono text-[10px]">
              YOUR_API_KEY
            </code>{" "}
            with the key you saved.{" "}
            <button
              type="button"
              onClick={onShowKeys}
              className="underline underline-offset-2 transition-colors hover:text-slate-950"
            >
              Lost it? Rotate the key
            </button>
            .
          </p>
        </div>
      )}
      <Button
        className="w-full"
        disabled={disabled}
        size="sm"
        onClick={() => {
          void navigator.clipboard.writeText(code);
          onCopied();
        }}
      >
        Copy install code
      </Button>
    </div>
  );
}
