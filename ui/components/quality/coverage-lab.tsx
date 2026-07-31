"use client";

import type { SearchResponse } from "@template/contracts";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@template/ui";
import { type FormEvent, useState } from "react";

interface CoverageResult {
  question: string;
  topScore: number;
  chunks: number;
  status: "covered" | "weak" | "missing";
  documentId?: string;
  results?: any[];
}

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;
  return data?.detail ?? data?.message ?? "Request failed.";
}

function statusFromScore(score: number) {
  if (score >= 0.78) {
    return "covered" as const;
  }
  if (score >= 0.55) {
    return "weak" as const;
  }
  return "missing" as const;
}

export function CoverageLab() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CoverageResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const questions = String(formData.get("questions") ?? "")
      .split("\n")
      .map((question) => question.trim())
      .filter(Boolean)
      .slice(0, 25);
    const topK = String(formData.get("topK") ?? "5");
    const userId = String(formData.get("userId") ?? "").trim();
    const documentIdsRaw = String(formData.get("documentIds") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!questions.length) {
      return;
    }

    setRunning(true);
    setError(null);
    setResults([]);

    const nextResults: CoverageResult[] = [];
    for (const question of questions) {
      const params = new URLSearchParams();
      params.set("query", question);
      params.set("top_k", topK);
      if (userId) params.set("user_id", userId);
      if (documentIdsRaw.length > 0) {
        for (const docId of documentIdsRaw) {
          params.append("document_ids", docId);
        }
      }

      const response = await fetch(
        `/api/search?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        setError(await readError(response));
        setRunning(false);
        return;
      }
      const data = (await response.json()) as SearchResponse;
      const topScore = data.results[0]?.score ?? 0;
      nextResults.push({
        question,
        topScore,
        chunks: data.results.length,
        status: statusFromScore(topScore),
        documentId: data.results[0]?.metadata.document_id,
        results: data.results ?? [],
      });
      setResults([...nextResults]);
    }

    setRunning(false);
  }

  const covered = results.filter(
    (result) => result.status === "covered",
  ).length;
  const weak = results.filter((result) => result.status === "weak").length;
  const missing = results.filter(
    (result) => result.status === "missing",
  ).length;
  const score = results.length
    ? Math.round((covered / results.length) * 100)
    : 0;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Coverage lab</h1>
          <p className="text-slate-400 text-xs">Test answer readiness before publishing</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Question set</CardTitle>
                <CardDescription>
                  Paste one expected customer question per line.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="questions">Questions</Label>
                    <Textarea
                      id="questions"
                      name="questions"
                      className="min-h-64"
                      defaultValue={`What is your refund policy?
How can I cancel my subscription?
What documents are required?
How do I contact support?`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topK">Top K chunks</Label>
                    <Input
                      id="topK"
                      name="topK"
                      type="number"
                      min="1"
                      max="20"
                      defaultValue="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID (optional)</Label>
                    <Input
                      id="userId"
                      name="userId"
                      placeholder="e.g. 8193fd1a-d0b1-7025-e0b6-56b6a26e1519"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentIds">
                      Document IDs (optional, comma-separated)
                    </Label>
                    <Input
                      id="documentIds"
                      name="documentIds"
                      placeholder="e.g. b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={running}>
                    {running ? "Testing..." : "Run coverage test"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Metric
                  label="Readiness"
                  value={results.length ? `${score}%` : "—"}
                />
                <Metric label="Covered" value={String(covered)} tone="success" />
                <Metric label="Weak" value={String(weak)} tone="warning" />
                <Metric label="Missing" value={String(missing)} tone="danger" />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                  {error}
                </div>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    Weak and missing questions are your next content tasks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {results.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 text-sm">
                      Run a coverage test to see whether your documents can answer
                      key questions.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.map((result) => (
                        <div
                          key={result.question}
                          className="rounded-2xl border border-slate-200 p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                            <div>
                              <p className="font-medium text-slate-950">
                                {result.question}
                              </p>
                              <p className="mt-1 text-slate-500 text-sm">
                                Top score {result.topScore.toFixed(4)} ·{" "}
                                {result.chunks} chunks{" "}
                                {result.documentId ? `· Document: ${result.documentId}` : ""}
                              </p>
                            </div>
                            <StatusBadge status={result.status} />
                          </div>
                          {result.status !== "covered" ? (
                            <div className="mt-3 rounded-2xl bg-amber-50/50 border border-amber-100 p-3 text-amber-800 text-sm">
                              <span className="font-semibold">Recommendation:</span> Upload or rewrite content that
                              directly answers this question, then re-run this test.
                            </div>
                          ) : null}

                          {result.results && result.results.length > 0 && (
                            <details className="mt-3 group">
                              <summary className="cursor-pointer select-none text-xs font-semibold text-slate-500 hover:text-slate-800 focus:outline-none flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-slate-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                View retrieved chunks ({result.results.length})
                              </summary>
                              
                              <div className="mt-3 pl-4 border-l-2 border-slate-100 space-y-3 pt-1">
                                {result.results.map((chunk: any, chunkIdx: number) => (
                                  <div key={chunk.id || chunkIdx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                      <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md font-semibold">
                                        Chunk {chunkIdx + 1} (Score: {chunk.score.toFixed(4)})
                                      </span>
                                      {chunk.metadata?.page_number && (
                                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                          Page {chunk.metadata.page_number}
                                        </span>
                                      )}
                                      {chunk.metadata?.chunk_index !== undefined && (
                                        <span className="text-slate-400">
                                          Index: {chunk.metadata.chunk_index}
                                        </span>
                                      )}
                                    </div>
                                    {chunk.metadata?.text ? (
                                      <pre className="whitespace-pre-wrap font-mono text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-150 max-h-40 overflow-y-auto">
                                        {chunk.metadata.text}
                                      </pre>
                                    ) : (
                                      <p className="text-slate-400 italic">No text content available.</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  const color =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50"
        : tone === "danger"
          ? "border-red-200 bg-red-50"
          : "bg-white";
  return (
    <Card className={color}>
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function StatusBadge({ status }: { status: CoverageResult["status"] }) {
  if (status === "covered") {
    return <Badge variant="success">Covered</Badge>;
  }
  if (status === "weak") {
    return <Badge variant="warning">Weak</Badge>;
  }
  return <Badge variant="destructive">Missing</Badge>;
}