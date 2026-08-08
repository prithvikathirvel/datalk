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
import { readApiError } from "@/lib/api-error";
import { toast } from "@/stores/toast-store";

interface CoverageResult {
  question: string;
  topScore: number;
  chunks: number;
  status: "covered" | "weak" | "missing";
  documentId?: string;
}

async function readError(response: Response) {
  return readApiError(response);
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
      toast.error("Paste at least one question to test.");
      return;
    }

    setRunning(true);
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

      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        toast.error(await readError(response), "Coverage test failed");
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
          <p className="text-slate-400 text-xs">
            Test answer readiness before publishing
          </p>
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
                <Metric
                  label="Covered"
                  value={String(covered)}
                  tone="success"
                />
                <Metric label="Weak" value={String(weak)} tone="warning" />
                <Metric label="Missing" value={String(missing)} tone="danger" />
              </div>

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
                      Run a coverage test to see whether your documents can
                      answer key questions.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.map((result) => (
                        <div
                          key={result.question}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                            <div>
                              <p className="font-medium text-slate-950">
                                {result.question}
                              </p>
                              <p className="mt-1 text-slate-500 text-sm">
                                Top score {result.topScore.toFixed(2)} ·{" "}
                                {result.chunks} chunks{" "}
                                {result.documentId
                                  ? `· ${result.documentId}`
                                  : ""}
                              </p>
                            </div>
                            <StatusBadge status={result.status} />
                          </div>
                          {result.status !== "covered" ? (
                            <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-slate-600 text-sm">
                              Recommendation: upload or rewrite content that
                              directly answers this question, then re-run this
                              test.
                            </div>
                          ) : null}
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
