"use client";

import type {
  DocumentFile,
  SearchResponse,
  UploadResponse,
  UploadType,
} from "@template/contracts";
import { Badge, Button, Label, Select } from "@template/ui";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { formatBytes, formatDateTime } from "@/lib/format";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import { TextInput } from "@/components/ui/text-input";

type DocTab = "library" | "retrieval";

const DOC_TABS: Array<{ id: DocTab; label: string; icon: React.ReactNode }> = [
  {
    id: "library",
    label: "Library",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "retrieval",
    label: "Retrieval test",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
];

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;
  return data?.detail ?? data?.message ?? "Request failed.";
}

export function DocumentManager() {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [activeTab, setActiveTab] = useState<DocTab>("library");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/ingest/files", { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setFiles((await response.json()) as DocumentFile[]);
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [refreshToken, loadFiles]);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Documents</h1>
          <p className="text-slate-400 text-xs">Manage your knowledge base</p>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
            {files.length} files
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
            {formatBytes(totalSize)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 border-b border-slate-100 bg-white px-6 pt-1">
        <VercelTabs
          tabs={DOC_TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as DocTab)}
        />
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {error && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Library tab */}
        <div className={activeTab === "library" ? "block" : "hidden"}>
          <div className="grid gap-6 p-6 xl:grid-cols-[400px_1fr]">
            <UploadCard onUploaded={() => setRefreshToken((v) => v + 1)} />
            <LibraryCard
              files={files}
              loading={loading}
              onRefresh={() => setRefreshToken((v) => v + 1)}
            />
          </div>
        </div>

        {/* Retrieval test tab */}
        <div className={activeTab === "retrieval" ? "block" : "hidden"}>
          <div className="p-6">
            <SearchCard />
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Upload Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UploadCard({ onUploaded }: { onUploaded: () => void }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileSelect(file: File) {
    setSelectedFile(file);
    setMessage(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const uploadType = String(formData.get("uploadType") ?? "both") as UploadType;

    if (!selectedFile) {
      setMessage({ type: "error", text: "Choose a document first." });
      return;
    }

    const requestData = new FormData();
    requestData.append("file", selectedFile);
    setUploading(true);
    setMessage(null);

    const response = await fetch(
      `/api/ingest/upload?upload_type=${uploadType}`,
      { method: "POST", body: requestData },
    );

    setUploading(false);
    const data = (await response.json().catch(() => null)) as UploadResponse | { detail?: string } | null;

    if (!response.ok) {
      setMessage({ type: "error", text: (data as { detail?: string } | null)?.detail ?? "Upload failed." });
      return;
    }

    const uploadResponse = data as UploadResponse | null;
    setMessage({
      type: "success",
      text: uploadResponse?.status === 409
        ? `Duplicate: ${uploadResponse.message}`
        : (uploadResponse?.message ?? "Upload complete."),
    });
    setSelectedFile(null);
    form.reset();
    onUploaded();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">Upload document</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Add files to your Datalk knowledge base
        </p>
      </div>
      <form ref={formRef} className="p-5 space-y-4" onSubmit={onSubmit}>
        {/* Drop zone */}
        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-slate-950 bg-slate-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload file drop zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
          {selectedFile ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="font-medium text-sm text-slate-950">{selectedFile.name}</p>
              <p className="mt-1 text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
              <button
                type="button"
                className="mt-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-slate-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="font-medium text-sm text-slate-700">Drop a file here</p>
              <p className="mt-1 text-xs text-slate-400">or click to browse</p>
            </>
          )}
        </div>

        {/* Processing mode */}
        <div className="space-y-1.5">
          <Label htmlFor="uploadType" className="text-sm font-medium text-slate-700">
            Processing mode
          </Label>
          <Select id="uploadType" name="uploadType" defaultValue="both">
            <option value="both">Raw + processed (recommended)</option>
            <option value="processed">Processed only</option>
            <option value="raw">Raw only</option>
          </Select>
        </div>

        <Button className="w-full" type="submit" disabled={uploading || !selectedFile}>
          {uploading ? "Uploading..." : "Upload document"}
        </Button>

        {message && (
          <div
            className={`rounded-xl p-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}

// â”€â”€â”€ Library Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LibraryCard({
  files,
  loading,
  onRefresh,
}: {
  files: DocumentFile[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deleteFile(file: DocumentFile) {
    if (!confirm(`Delete ${file.filename}?`)) return;
    setDeletingPath(file.file_path);
    setError(null);
    const response = await fetch(
      `/api/ingest/delete?file_path=${encodeURIComponent(file.file_path)}`,
      { method: "DELETE" },
    );
    setDeletingPath(null);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    onRefresh();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-950">Uploaded files</h2>
          <p className="mt-0.5 text-xs text-slate-400">All files in your knowledge base</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          Refresh
        </Button>
      </div>
      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <p className="font-medium text-slate-700">No documents yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Upload files using the panel on the left
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {files.map((file) => (
              <div
                key={file.file_path}
                className="flex items-center gap-3 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-950 text-sm">{file.filename}</p>
                  <p className="truncate text-slate-400 text-xs">{formatDateTime(file.last_modified)}</p>
                </div>
                <Badge variant="secondary">{formatBytes(file.size)}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void deleteFile(file)}
                  disabled={deletingPath === file.file_path}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Search Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SearchCard() {
  const [searching, setSearching] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("query") ?? "").trim();
    const topK = String(formData.get("topK") ?? "5");
    if (!query) return;

    setSearching(true);
    setError(null);
    setResponse(null);
    const searchResponse = await fetch(
      `/api/search?query=${encodeURIComponent(query)}&top_k=${encodeURIComponent(topK)}`,
      { cache: "no-store" },
    );
    setSearching(false);
    if (!searchResponse.ok) {
      setError(await readError(searchResponse));
      return;
    }
    setResponse((await searchResponse.json()) as SearchResponse);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">Retrieval test</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Verify your indexed documents return relevant chunks for a given query
        </p>
      </div>
      <div className="p-5">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end"
          onSubmit={onSubmit}
        >
          <TextInput
            id="query"
            name="query"
            label="Question"
            placeholder="What does the contract say about termination?"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
          />
          <TextInput
            id="topK"
            name="topK"
            label="Top K"
            type="number"
            min="1"
            max="20"
            defaultValue="5"
          />
          <Button type="submit" disabled={searching} className="sm:mb-0">
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {response && (
          <div className="mt-5 space-y-3">
            {response.results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <p className="font-medium text-slate-700">No matching chunks</p>
                <p className="mt-1 text-sm text-slate-400">
                  Try uploading this content as processed or both.
                </p>
              </div>
            ) : (
              response.results.map((result) => (
                <div key={result.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Score {result.score.toFixed(2)}</Badge>
                    {result.metadata.title && (
                      <Badge variant="outline">{String(result.metadata.title)}</Badge>
                    )}
                    {result.metadata.page_number && (
                      <Badge variant="outline">Page {String(result.metadata.page_number)}</Badge>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 text-slate-500 text-sm sm:grid-cols-2">
                    <p className="truncate">
                      Document: {String(result.metadata.document_id ?? "Unknown")}
                    </p>
                    <p>Chunk: {String(result.metadata.chunk_index ?? result.id)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

