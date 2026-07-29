"use client";

import type {
  DocumentFile,
  IngestRequest,
  PresignedUrlResponse,
  SearchResponse,
  UploadConfig,
  WebsiteIngestRequest,
} from "@template/contracts";
import { Badge, Button, Label } from "@template/ui";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { formatBytes, formatDateTime } from "@/lib/format";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import { TextInput } from "@/components/ui/text-input";

// --- Types --------------------------------------------------------------------

type DocTab = "upload" | "files" | "retrieval";
type UploadSource = "file" | "website";
type UploadMode = "upload" | "url";
type UploadStep = "idle" | "presigned" | "s3" | "registering";

// --- Tab config --------------------------------------------------------------

const DOC_TABS: Array<{ id: DocTab; label: string; icon: React.ReactNode }> = [
  {
    id: "upload",
    label: "Upload",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: "files",
    label: "Uploaded Files",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "retrieval",
    label: "Retrieval Test",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
];

// --- Helpers ------------------------------------------------------------------

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;
  return data?.detail ?? data?.message ?? "Request failed.";
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

async function calculateChecksum(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

const STEP_LABEL: Record<UploadStep, string> = {
  idle: "Upload document",
  presigned: "Getting upload URL",
  s3: "Uploading to storage",
  registering: "Registering document",
};

// --- Root Component -----------------------------------------------------------

export function DocumentManager() {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [activeTab, setActiveTab] = useState<DocTab>("upload");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const response = await fetch("/api/ingest/files", { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      setFetchError(await readError(response));
      return;
    }
    setFiles((await response.json()) as DocumentFile[]);
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [refreshToken, loadFiles]);

  const totalSize = files.reduce((sum, f) => sum + (f?.size ?? 0), 0);

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-2.5">
        <div>
          <h1 className="text-sm font-semibold text-slate-950">Documents</h1>
          <p className="text-[11px] text-slate-400">Manage your knowledge base</p>
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
      <div className="shrink-0 border-b border-slate-100 bg-white px-6 pt-1" style={{ fontSize: "14px" }}>
        <VercelTabs
          tabs={DOC_TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as DocTab)}
        />
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Upload tab */}
        <div className={activeTab === "upload" ? "block" : "hidden"}>
          <div className="flex flex-col gap-4 p-6">
            <UploadTab
              onUploaded={() => {
                setRefreshToken((v) => v + 1);
                setActiveTab("files");
              }}
            />
            <RecentUploadsPreview
              files={files}
              loading={loading}
              onShowAll={() => setActiveTab("files")}
            />
          </div>
        </div>

        {/* Uploaded Files tab */}
        <div className={activeTab === "files" ? "block" : "hidden"}>
          <div className="p-6">
            <FilesTab
              files={files}
              loading={loading}
              error={fetchError}
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

// --- Upload Tab ---------------------------------------------------------------

function UploadTab({ onUploaded }: { onUploaded: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [source, setSource] = useState<UploadSource>("file");
  const [mode, setMode] = useState<UploadMode>("upload");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [pageRange, setPageRange] = useState("");
  const [extract, setExtract] = useState({ text: true, tables: true, images: true });

  // Website crawl config
  const [crawlMode, setCrawlMode] = useState<"deep" | "single">("deep");
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(20);
  const [includeSubdomains, setIncludeSubdomains] = useState(false);
  const [includePathsInput, setIncludePathsInput] = useState("");
  const [excludePathsInput, setExcludePathsInput] = useState("");
  const [onlyMainContent, setOnlyMainContent] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [includeTables, setIncludeTables] = useState(true);
  const [waitFor, setWaitFor] = useState(0);

  const [step, setStep] = useState<UploadStep>("idle");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const uploading = step !== "idle";

  function resetForm() {
    setSelectedFile(null);
    setUrlInput("");
    setPageRange("");
    setExtract({ text: true, tables: true, images: true });
    setCrawlMode("deep");
    setMaxDepth(2);
    setMaxPages(20);
    setIncludeSubdomains(false);
    setIncludePathsInput("");
    setExcludePathsInput("");
    setOnlyMainContent(true);
    setIncludeImages(false);
    setIncludeTables(true);
    setWaitFor(0);
    setStep("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSourceChange(next: UploadSource) {
    setSource(next);
    setMode("url");
    setMessage(null);
    setSelectedFile(null);
    setUrlInput("");
  }

  function handleModeChange(next: UploadMode) {
    setMode(next);
    setMessage(null);
    setSelectedFile(null);
    setUrlInput("");
  }

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

  function buildConfig(): UploadConfig {
    return { extract, pageRange: pageRange.trim() };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (source === "file" && mode === "upload" && !selectedFile) {
      setMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }
    if ((source === "file" && mode === "url") || source === "website") {
      if (!urlInput.trim()) {
        setMessage({ type: "error", text: "Please enter a valid URL." });
        return;
      }
    }

    const config = buildConfig();

    try {
      if (source === "file" && mode === "upload" && selectedFile) {
        // Step 1 � Get presigned URL
        setStep("presigned");
        const ext = getFileExtension(selectedFile.name);
        const documentId = crypto.randomUUID();
        const newFilename = ext ? `${documentId}.${ext}` : documentId;
        const contentType = selectedFile.type || "application/octet-stream";
        const checksum = await calculateChecksum(selectedFile);

        const metaData = {
          filename: selectedFile.name,
          size: String(selectedFile.size),
          type: selectedFile.type,
          lastModified: String(selectedFile.lastModified)
        };

        const presignedRes = await fetch("/api/ingest/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            key: newFilename,
            checksum,
            contentType,
            meta_data: metaData
          }),
        });

        if (!presignedRes.ok) {
          setMessage({ type: "error", text: await readError(presignedRes) });
          setStep("idle");
          return;
        }

        const { presignedUrl } = (await presignedRes.json()) as PresignedUrlResponse;

        // Create headers object and append x-amz-meta-* headers for S3
        const s3Headers: Record<string, string> = { "Content-Type": contentType };
        for (const [key, value] of Object.entries(metaData)) {
          // AWS S3 expects metadata headers to prefix with x-amz-meta- and be lowercase
          s3Headers[`x-amz-meta-${key.toLowerCase()}`] = value;
        }

        // Step 2 � PUT directly to S3 (no Authorization header � URL is pre-signed)
        setStep("s3");
        const s3Res = await fetch(presignedUrl, {
          method: "PUT",
          headers: s3Headers,
          body: selectedFile,
        });

        if (!s3Res.ok) {
          setMessage({
            type: "error",
            text: `Storage upload failed (HTTP ${s3Res.status}). Please try again.`,
          });
          setStep("idle");
          return;
        }

        // Step 3 � Register the document
        setStep("registering");
        const payload: IngestRequest = {
          source: "file",
          mode: "upload",
          file: newFilename,
          config,
          meta_data: metaData,
          document_id: documentId,
        };

        const uploadRes = await fetch("/api/ingest/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!uploadRes.ok) {
          setMessage({ type: "error", text: await readError(uploadRes) });
          setStep("idle");
          return;
        }

        setStep("idle");
        setMessage({ type: "success", text: "Document uploaded and registered successfully." });
        resetForm();
        onUploaded();
      } else if (source === "website") {
        // Website crawl — build WebsiteIngestRequest
        setStep("registering");

        const parsePaths = (raw: string) =>
          raw.split(",").map((p) => p.trim()).filter(Boolean);

        const websitePayload: WebsiteIngestRequest = {
          source: "website",
          mode: "url",
          url: urlInput.trim(),
          config: {
            mode: crawlMode,
            maxDepth,
            maxPages,
            includeSubdomains,
            includePaths: parsePaths(includePathsInput),
            excludePaths: parsePaths(excludePathsInput),
            onlyMainContent,
            includeImages,
            includeTables,
            waitFor,
          },
        };

        const uploadRes = await fetch("/api/ingest/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(websitePayload),
        });

        if (!uploadRes.ok) {
          setMessage({ type: "error", text: await readError(uploadRes) });
          setStep("idle");
          return;
        }

        setStep("idle");
        setMessage({ type: "success", text: "Website submitted for crawling." });
        resetForm();
        onUploaded();
      } else {
        // file + url mode — single POST, no S3 step
        setStep("registering");

        const payload: IngestRequest = {
          source,
          mode: "url",
          file: urlInput.trim(),
          config,
        };

        const uploadRes = await fetch("/api/ingest/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!uploadRes.ok) {
          setMessage({ type: "error", text: await readError(uploadRes) });
          setStep("idle");
          return;
        }

        setStep("idle");
        setMessage({ type: "success", text: "Document submitted for processing." });
        resetForm();
        onUploaded();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
      setStep("idle");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Source type selector ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSourceChange("file")}
          className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all ${
            source === "file"
              ? "border-slate-950 bg-slate-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            source === "file" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Upload File</p>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Drag & drop or browse PDFs, DOCX, TXT, and more
            </p>
          </div>
          {source === "file" && (
            <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleSourceChange("website")}
          className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all ${
            source === "website"
              ? "border-slate-950 bg-slate-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            source === "website" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Import Website</p>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Crawl and index web pages automatically
            </p>
          </div>
          {source === "website" && (
            <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          )}
        </button>
      </div>

      {/* ── Main upload form card ── */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="font-semibold text-slate-950">
              {source === "file" ? "File upload" : "Website import"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {source === "file"
                ? "Upload documents to build your knowledge base"
                : "Enter a URL to crawl and index web content"}
            </p>
          </div>

          <div className="space-y-5 p-6">

            {/* Upload method toggle for File source */}
            {source === "file" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Upload method</Label>
                <div className="flex gap-2">
                  {(["upload", "url"] as UploadMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleModeChange(m)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                        mode === m
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      {m === "upload" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                      )}
                      {m === "upload" ? "Browse files" : "From URL"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Drop zone / File picker ── */}
            {source === "file" && mode === "upload" && (
              <div
                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver
                    ? "border-slate-950 bg-slate-50"
                    : selectedFile
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50/30 hover:border-slate-300"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                  accept=".pdf,.docx,.txt,.md,.csv,.json,.html,.xml"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{selectedFile.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-slate-400">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">
                        Drop your file here, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-slate-950 underline underline-offset-2 hover:text-slate-700"
                        >
                          browse
                        </button>
                      </p>
                      <p className="mt-1.5 text-xs text-slate-400">
                        PDF, DOCX, TXT, Markdown, CSV, JSON, HTML — up to 50 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── URL input for file or website mode ── */}
            {(source === "website" || (source === "file" && mode === "url")) && (
              <div className="space-y-2">
                <Label htmlFor="urlInput" className="text-xs font-medium text-slate-700">
                  {source === "website" ? "Website URL" : "Document URL"}
                </Label>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="-translate-y-1/2 absolute top-1/2 left-3.5 h-4 w-4 text-slate-400">
                    {source === "website" ? (
                      <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>
                    ) : (
                      <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>
                    )}
                  </svg>
                  <input
                    id="urlInput"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={source === "website" ? "https://example.com/docs" : "https://example.com/document.pdf"}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                  />
                </div>
                {source === "website" && (
                  <p className="text-xs text-slate-400">We'll crawl this URL and index all linked pages.</p>
                )}
              </div>
            )}

            {/* ── Processing config (file source) ── */}
            {source === "file" && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Processing options</p>
                </div>

                <TextInput
                  label="Page range"
                  placeholder="e.g. 1-5, 8, 10-12  (leave blank for all pages)"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                />

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700">Extract content</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["text", "tables", "images"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setExtract((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          extract[key]
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {extract[key] && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Crawl config (website source) ── */}
            {source === "website" && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Crawl settings</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700">Crawl mode</Label>
                  <div className="flex gap-2">
                    {(["deep", "single"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCrawlMode(m)}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                          crawlMode === m
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {m === "deep" ? "Deep crawl" : "Single page"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Max depth</Label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Max pages</Label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={maxPages}
                      onChange={(e) => setMaxPages(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700">Options</Label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: "includeSubdomains", label: "Include subdomains", value: includeSubdomains, set: setIncludeSubdomains },
                      { key: "onlyMainContent", label: "Main content only", value: onlyMainContent, set: setOnlyMainContent },
                      { key: "includeImages", label: "Include images", value: includeImages, set: setIncludeImages },
                      { key: "includeTables", label: "Include tables", value: includeTables, set: setIncludeTables },
                    ] as const).map(({ key, label, value, set }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set(!value)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          value
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {value && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <TextInput
                  label="Include paths (comma-separated)"
                  placeholder="/docs/*, /blog/*"
                  value={includePathsInput}
                  onChange={(e) => setIncludePathsInput(e.target.value)}
                />
                <TextInput
                  label="Exclude paths (comma-separated)"
                  placeholder="/privacy, /terms"
                  value={excludePathsInput}
                  onChange={(e) => setExcludePathsInput(e.target.value)}
                />

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Wait for (ms)</Label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={waitFor}
                    onChange={(e) => setWaitFor(Number(e.target.value))}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                  />
                  <p className="text-[11px] text-slate-400">Milliseconds to wait for JS rendering before scraping</p>
                </div>
              </div>
            )}

            {/* ── Submit button ── */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                className="flex-1"
                type="submit"
                disabled={
                  uploading ||
                  (source === "file" && mode === "upload" && !selectedFile) ||
                  ((source === "website" || (source === "file" && mode === "url")) && !urlInput.trim())
                }
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    {STEP_LABEL[step]}
                  </span>
                ) : source === "file" ? "Upload document" : "Start crawling"}
              </Button>
              {(selectedFile || urlInput) && !uploading && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* ── Status message ── */}
            {message && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0">
                  {message.type === "success" ? (
                    <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                  ) : (
                    <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                  )}
                </svg>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// --- Status Badge -------------------------------------------------------------

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toUpperCase() ?? "";
  if (s === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (s === "PROCESSING" || s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {status ?? "Pending"}
      </span>
    );
  }
  if (s === "FAILED" || s === "ERROR") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Failed
      </span>
    );
  }
  if (!status) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {status}
    </span>
  );
}

// --- Recent Uploads Preview (shown in Upload tab) ----------------------------

function RecentUploadsPreview({
  files,
  loading,
  onShowAll,
}: {
  files: DocumentFile[];
  loading: boolean;
  onShowAll: () => void;
}) {
  const sorted = [...files].sort(
    (a, b) => new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime(),
  );
  const preview = sorted.slice(0, 3);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold text-slate-700">Recent uploads</p>
        {files.length > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-slate-900"
          >
            Show all {files.length}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">No files uploaded yet.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Filename</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500"> Indexing Status</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">Size</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.map((file) => (
                    <tr key={file.id}>
                      <td className="max-w-0 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100">
                            {file.type === "url" ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-slate-500">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-slate-500">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            )}
                          </div>
                          <span className="truncate font-medium text-slate-950">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={file.status} />
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-400">{formatBytes(file.size)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-400 whitespace-nowrap">{formatDateTime(file.last_modified)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {files.length > 3 && (
              <button
                type="button"
                onClick={onShowAll}
                className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                Show all {files.length} files →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// --- Files Tab ----------------------------------------------------------------

function FilesTab({
  files,
  loading,
  error,
  onRefresh,
}: {
  files: DocumentFile[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmFile, setConfirmFile] = useState<DocumentFile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function confirmDelete() {
    if (!confirmFile) return;
    setDeletingId(confirmFile.id);
    setConfirmFile(null);
    setDeleteError(null);
    setSuccessMessage(null);
    const fileType = confirmFile.type ?? `application/${confirmFile.filename.split(".").pop() ?? "octet-stream"}`;
    const response = await fetch(
      `/api/ingest/delete?filename=${encodeURIComponent(confirmFile.id)}&type=${encodeURIComponent(fileType)}`,
      { method: "DELETE" },
    );
    setDeletingId(null);
    if (!response.ok) {
      setDeleteError(await readError(response));
      return;
    }
    setSuccessMessage(`"${confirmFile.filename}" was deleted successfully.`);
    onRefresh();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Delete confirmation dialog */}
      {confirmFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-950">Delete document?</h3>
            <p className="mt-1.5 text-[13px] text-slate-500">
              <span className="font-medium text-slate-700">{confirmFile.filename}</span> will be permanently removed from your knowledge base. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmFile(null)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Uploaded files</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">All files in your knowledge base</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div>
        {successMessage && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {successMessage}
          </div>
        )}
        {(error ?? deleteError) && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error ?? deleteError}
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
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-400">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-700">No documents yet</p>
            <p className="mt-1 text-xs text-slate-400">Upload files using the Upload tab</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Filename</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500"> Indexing Status</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Size</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Time</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...files]
                  .sort((a, b) => new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime())
                  .map((file) => (
                    <tr key={file.id} className="group">
                      <td className="max-w-0 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            {file.type === "url" ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            )}
                          </div>
                          <span className="truncate font-medium text-slate-950">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={file.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">{formatBytes(file.size)}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400 whitespace-nowrap">{formatDateTime(file.last_modified)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => { setConfirmFile(file); setDeleteError(null); setSuccessMessage(null); }}
                          disabled={deletingId === file.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          title="Delete file"
                        >
                          {deletingId === file.id ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Search Card --------------------------------------------------------------

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
      <div className="border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-slate-950">Retrieval test</h2>
        <p className="mt-0.5 text-[11px] text-slate-400">
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

