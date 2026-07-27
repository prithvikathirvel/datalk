"use client";

import type { DocumentFile } from "@template/contracts";
import { Button, cn } from "@template/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmbedApiError, fetchSources, saveSources } from "@/lib/embed-client";
import { formatDateTime } from "@/lib/format";

function documentType(file: DocumentFile) {
  if (file.type === "url") return "URL";
  const extension = file.filename.split(".").pop();
  return extension ? extension.toUpperCase() : "FILE";
}

export function SourcesPanel({
  botId,
  onError,
  onSaved,
}: {
  botId: string | null;
  onError: (message: string) => void;
  onSaved: (message: string) => void;
}) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initial, setInitial] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    if (!botId) return;
    setLoading(true);

    // The document library is independent of the sources endpoint, so load it
    // even when source scoping is not deployed yet.
    try {
      const response = await fetch("/api/ingest/files", { cache: "no-store" });
      if (response.ok) {
        setFiles((await response.json()) as DocumentFile[]);
      }
    } catch {
      // Non-fatal: the checklist simply renders empty.
    }

    try {
      const sources = await fetchSources(botId);
      const ids = new Set(sources.map((source) => source.documentId));
      setSelected(ids);
      setInitial(ids);
      setPending(false);
    } catch (caught) {
      if (caught instanceof EmbedApiError && caught.pending) {
        setPending(true);
      } else {
        onError(
          caught instanceof Error ? caught.message : "Unable to load sources.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [botId, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return files;
    return files.filter((file) => file.filename.toLowerCase().includes(term));
  }, [files, query]);

  const dirty = useMemo(() => {
    if (selected.size !== initial.size) return true;
    for (const id of selected) {
      if (!initial.has(id)) return true;
    }
    return false;
  }, [selected, initial]);

  function toggle(documentId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(documentId)) {
        next.delete(documentId);
      } else {
        next.add(documentId);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!botId) return;
    setSaving(true);
    try {
      const documents = files
        .filter((file) => selected.has(file.id))
        .map((file) => ({
          documentId: file.id,
          documentFilename: file.filename,
        }));
      await saveSources(botId, documents);
      setInitial(new Set(selected));
      onSaved(
        documents.length === 0
          ? "Sources cleared — this chatbot searches all documents."
          : `Saved. This chatbot now searches ${documents.length} document${documents.length === 1 ? "" : "s"}.`,
      );
    } catch (caught) {
      onError(
        caught instanceof Error ? caught.message : "Unable to save sources.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!botId) {
    return (
      <div className="rounded-xl border border-slate-200 border-dashed px-5 py-12 text-center">
        <p className="font-medium text-slate-700 text-sm">
          Save the chatbot first
        </p>
        <p className="mt-1 text-slate-400 text-xs">
          Once created, you can choose which documents this chatbot can search.
        </p>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="rounded-xl border border-slate-200 border-dashed px-5 py-10 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-slate-400"
            aria-hidden="true"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="font-medium text-slate-700 text-sm">
          Source scoping is not available yet
        </p>
        <p className="mx-auto mt-1 max-w-sm text-slate-400 text-xs leading-relaxed">
          This chatbot currently searches your entire document library. Once
          source scoping is live you can restrict it to specific documents.
        </p>
      </div>
    );
  }

  const selectedCount = selected.size;
  const restricted = selectedCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-slate-400 text-xs">
          {restricted
            ? `${selectedCount} of ${files.length} documents selected`
            : "Searching all documents"}
        </p>
        {restricted && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-slate-500 text-xs underline-offset-2 transition-colors hover:text-slate-950 hover:underline"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Scope banner */}
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl border p-3",
          restricted
            ? "border-slate-200 bg-slate-50"
            : "border-amber-200 bg-amber-50",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            restricted ? "text-slate-500" : "text-amber-600",
          )}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p
          className={cn(
            "text-[13px] leading-relaxed",
            restricted ? "text-slate-600" : "text-amber-800",
          )}
        >
          {restricted
            ? "This chatbot answers only from the selected documents."
            : "This chatbot searches all your documents. Select specific documents to restrict its knowledge."}
        </p>
      </div>

      {/* Search */}
      {files.length > 5 && (
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-slate-950 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          />
        </div>
      )}

      {/* Document checklist */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 border-dashed py-12 text-center">
          <p className="font-medium text-slate-700 text-sm">
            {query ? "No matching documents" : "No documents yet"}
          </p>
          <p className="mt-1 text-slate-400 text-xs">
            {query
              ? "Try a different search term."
              : "Upload documents from the Documents page first."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="divide-y divide-slate-100">
            {filtered.map((file) => {
              const checked = selected.has(file.id);
              return (
                <label
                  key={file.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                    checked ? "bg-slate-50" : "bg-white hover:bg-slate-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(file.id)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-slate-950"
                  />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-950 text-sm">
                      {file.filename}
                    </span>
                  </span>
                  <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-[10px] text-slate-500 sm:inline">
                    {documentType(file)}
                  </span>
                  <span className="hidden shrink-0 whitespace-nowrap text-slate-400 text-xs lg:inline">
                    {formatDateTime(file.last_modified)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center justify-between gap-3 border-slate-100 border-t pt-4">
        <p className="text-slate-400 text-xs">
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <Button
          type="button"
          size="sm"
          disabled={!dirty || saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving…" : "Save sources"}
        </Button>
      </div>
    </div>
  );
}
