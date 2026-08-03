"use client";

import type { SearchResponse } from "@template/contracts";
import { Badge, Button, Input, Label, Textarea } from "@template/ui";
import { type FormEvent, useRef, useState } from "react";
import { readApiError } from "@/lib/api-error";

// --- Types --------------------------------------------------------------------

/** One line of ground truth: `question | expectedDocId1,expectedDocId2` */
interface EvalQuery {
  question: string;
  expectedDocIds: string[];
  /** Line number in the source textarea, for error messages. */
  line: number;
}

interface EvalRow {
  question: string;
  expectedDocIds: string[];
  retrievedDocIds: string[];
  hits: number;
  precision: number;
  recall: number;
  f1: number;
  reciprocalRank: number;
  topScore: number | null;
  status: "pass" | "partial" | "fail";
  error?: string;
}

interface EvalAggregate {
  evaluated: number;
  precision: number;
  recall: number;
  f1: number;
  /** % of queries where at least one expected document was retrieved. */
  hitRate: number;
  mrr: number;
}

// --- Helpers ------------------------------------------------------------------

async function readError(response: Response) {
  return readApiError(response);
}

/**
 * Parses the ground-truth textarea. Every non-empty line must look like:
 *
 *   What are the government holidays? | b9e7819d-…, 7c2a41e0-…
 *
 * Lines starting with `#` are treated as comments. The document-id part is
 * optional in the parser (validated later) so users get a precise error.
 */
function parseGroundTruth(raw: string): {
  queries: EvalQuery[];
  errors: string[];
} {
  const queries: EvalQuery[] = [];
  const errors: string[] = [];

  raw.split("\n").forEach((lineText, index) => {
    const line = lineText.trim();
    if (!line || line.startsWith("#")) return;

    const [questionPart, docsPart] = line.split("|");
    const question = questionPart?.trim() ?? "";
    const expectedDocIds = (docsPart ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!question) {
      errors.push(`Line ${index + 1}: question is empty.`);
      return;
    }
    if (expectedDocIds.length === 0) {
      errors.push(
        `Line ${index + 1}: add at least one expected document ID after "|".`,
      );
      return;
    }
    queries.push({ question, expectedDocIds, line: index + 1 });
  });

  return { queries, errors };
}

function statusOf(recall: number): EvalRow["status"] {
  if (recall >= 1) return "pass";
  if (recall > 0) return "partial";
  return "fail";
}

function aggregate(rows: EvalRow[]): EvalAggregate {
  const scored = rows.filter((row) => !row.error);
  if (!scored.length) {
    return { evaluated: 0, precision: 0, recall: 0, f1: 0, hitRate: 0, mrr: 0 };
  }
  const sum = (pick: (row: EvalRow) => number) =>
    scored.reduce((total, row) => total + pick(row), 0);
  const hitRate = scored.filter((row) => row.recall > 0).length / scored.length;
  return {
    evaluated: scored.length,
    precision: sum((r) => r.precision) / scored.length,
    recall: sum((r) => r.recall) / scored.length,
    f1: sum((r) => r.f1) / scored.length,
    hitRate,
    mrr: sum((r) => r.reciprocalRank) / scored.length,
  };
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

/** Builds the downloadable CSV report (per-query rows + aggregate block). */
function buildCsv(rows: EvalRow[], agg: EvalAggregate, topK: string) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const lines: string[] = [
    "question,expected_doc_ids,retrieved_doc_ids,precision_at_k,recall_at_k,f1_at_k,reciprocal_rank,top_score,status",
    ...rows.map((row) =>
      [
        escape(row.question),
        escape(row.expectedDocIds.join(";")),
        escape(row.retrievedDocIds.join(";")),
        row.error ? "" : row.precision.toFixed(3),
        row.error ? "" : row.recall.toFixed(3),
        row.error ? "" : row.f1.toFixed(3),
        row.error ? "" : row.reciprocalRank.toFixed(3),
        row.topScore != null ? row.topScore.toFixed(4) : "",
        row.error ? `error: ${row.error}` : row.status,
      ].join(","),
    ),
    "",
    "aggregate,,,,,,,,",
    `top_k,${topK},,,,,,,,`,
    `queries_evaluated,${agg.evaluated},,,,,,,,`,
    `avg_precision_at_k,${agg.precision.toFixed(3)},,,,,,,,`,
    `avg_recall_at_k,${agg.recall.toFixed(3)},,,,,,,,`,
    `avg_f1_at_k,${agg.f1.toFixed(3)},,,,,,,,`,
    `hit_rate,${agg.hitRate.toFixed(3)},,,,,,,,`,
    `mrr,${agg.mrr.toFixed(3)},,,,,,,,`,
  ];
  return lines.join("\n");
}

// --- Component ----------------------------------------------------------------

export function RagEvaluation() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [rows, setRows] = useState<EvalRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [topKUsed, setTopKUsed] = useState("5");
  const abortRef = useRef<AbortController | null>(null);

  async function runEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const groundTruth = String(formData.get("groundTruth") ?? "");
    const topK = String(formData.get("evalTopK") ?? "5");
    const documentIds = String(formData.get("evalDocumentIds") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const { queries, errors } = parseGroundTruth(groundTruth);
    if (errors.length) {
      setFormError(errors.slice(0, 4).join(" "));
      return;
    }
    if (!queries.length) {
      setFormError("Add at least one question in the ground truth box.");
      return;
    }

    setFormError(null);
    setRows([]);
    setTopKUsed(topK);
    setRunning(true);
    setProgress({ done: 0, total: queries.length });
    abortRef.current = new AbortController();

    const nextRows: EvalRow[] = [];
    for (const [index, query] of queries.entries()) {
      if (abortRef.current.signal.aborted) break;

      const params = new URLSearchParams();
      params.set("query", query.question);
      params.set("top_k", topK);
      for (const docId of documentIds) params.append("document_ids", docId);

      try {
        const response = await fetch(`/api/search?${params.toString()}`, {
          cache: "no-store",
          signal: abortRef.current.signal,
        });
        if (!response.ok) {
          throw new Error(await readError(response));
        }
        const data = (await response.json()) as SearchResponse;

        // First-seen order of document ids across the ranked chunks.
        const retrievedDocIds: string[] = [];
        for (const result of data.results) {
          const docId = String(result.metadata.document_id ?? "");
          if (docId && !retrievedDocIds.includes(docId)) {
            retrievedDocIds.push(docId);
          }
        }

        const expected = new Set(query.expectedDocIds);
        const hits = retrievedDocIds.filter((id) => expected.has(id)).length;
        const precision =
          retrievedDocIds.length > 0 ? hits / retrievedDocIds.length : 0;
        const recall = hits / expected.size;
        const f1 =
          precision + recall > 0
            ? (2 * precision * recall) / (precision + recall)
            : 0;
        const firstRelevant = retrievedDocIds.findIndex((id) =>
          expected.has(id),
        );
        const reciprocalRank =
          firstRelevant === -1 ? 0 : 1 / (firstRelevant + 1);

        nextRows.push({
          question: query.question,
          expectedDocIds: query.expectedDocIds,
          retrievedDocIds,
          hits,
          precision,
          recall,
          f1,
          reciprocalRank,
          topScore: data.results[0]?.score ?? null,
          status: statusOf(recall),
        });
      } catch (error) {
        if (abortRef.current.signal.aborted) break;
        nextRows.push({
          question: query.question,
          expectedDocIds: query.expectedDocIds,
          retrievedDocIds: [],
          hits: 0,
          precision: 0,
          recall: 0,
          f1: 0,
          reciprocalRank: 0,
          topScore: null,
          status: "fail",
          error:
            error instanceof Error ? error.message : "Search request failed.",
        });
      }

      setRows([...nextRows]);
      setProgress({ done: index + 1, total: queries.length });
    }

    setRunning(false);
  }

  function stopEvaluation() {
    abortRef.current?.abort();
    setRunning(false);
  }

  function downloadReport() {
    const csv = buildCsv(rows, agg, topKUsed);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rag-evaluation-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const agg = aggregate(rows);

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-px h-4 w-4 shrink-0 text-slate-400"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="text-xs leading-relaxed text-slate-500">
          <p className="font-medium text-slate-700">How RAG evaluation works</p>
          <p className="mt-0.5">
            Each line is a question plus the document IDs a correct answer{" "}
            <em>must</em> come from (copy them from the Uploaded files tab). For
            every question the retriever runs and the results are scored:
          </p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
            <li>
              <strong>Precision@K</strong> — of the documents retrieved, how
              many were actually relevant.
            </li>
            <li>
              <strong>Recall@K</strong> — of the relevant documents, how many
              were actually found.
            </li>
            <li>
              <strong>F1</strong> — the balance of the two;{" "}
              <strong>Hit rate</strong> — % of questions answered at all.
            </li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={runEvaluation} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groundTruth">
            Ground truth — one question per line
          </Label>
          <Textarea
            id="groundTruth"
            name="groundTruth"
            className="min-h-44 font-mono text-xs leading-relaxed"
            placeholder={
              "# question | expected document IDs\nWhat are the government holidays? | b9e7819d-a5d1-4b3b-ba86-cd9ce233633e\nHow do I apply for leave? | b9e7819d-a5d1-4b3b-ba86-cd9ce233633e, 7c2a41e0-1a2b-4c3d-8e9f-a1b2c3d4e5f6"
            }
          />
          <p className="text-[11px] text-slate-400">
            Format:{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-600">
              question | docId1,docId2
            </code>{" "}
            — separate multiple expected document IDs with commas. Lines
            starting with # are ignored.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="evalTopK">Top K</Label>
            <Input
              id="evalTopK"
              name="evalTopK"
              type="number"
              min="1"
              max="20"
              defaultValue="5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evalDocumentIds">
              Restrict to documents (optional, comma-separated)
            </Label>
            <Input
              id="evalDocumentIds"
              name="evalDocumentIds"
              placeholder="Leave empty to search the whole knowledge base"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={running}>
              {running
                ? `Evaluating ${progress.done}/${progress.total}…`
                : "Run evaluation"}
            </Button>
            {running ? (
              <Button type="button" variant="outline" onClick={stopEvaluation}>
                Stop
              </Button>
            ) : null}
          </div>
        </div>

        {running && progress.total > 0 ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-300"
              style={{
                width: `${Math.round((progress.done / progress.total) * 100)}%`,
              }}
            />
          </div>
        ) : null}

        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {formError}
          </div>
        ) : null}
      </form>

      {/* Aggregates */}
      {rows.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              label="Hit rate"
              value={pct(agg.hitRate)}
              hint="Questions with ≥1 relevant doc found"
              tone={
                agg.hitRate >= 0.8
                  ? "success"
                  : agg.hitRate >= 0.5
                    ? "warning"
                    : "danger"
              }
            />
            <MetricCard
              label="Avg precision@K"
              value={pct(agg.precision)}
              hint="Retrieved docs that were relevant"
            />
            <MetricCard
              label="Avg recall@K"
              value={pct(agg.recall)}
              hint="Relevant docs that were found"
            />
            <MetricCard
              label="Avg F1"
              value={pct(agg.f1)}
              hint="Precision–recall balance"
            />
            <MetricCard
              label="MRR"
              value={agg.mrr.toFixed(2)}
              hint="How high the first hit ranks"
            />
          </div>

          {/* Per-query results */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <p className="text-xs font-semibold text-slate-700">
                Per-query results ({agg.evaluated} evaluated)
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadReport}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5 h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download report (CSV)
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Question</th>
                    <th className="px-3 py-2.5 font-medium">Found</th>
                    <th className="px-3 py-2.5 font-medium">Precision</th>
                    <th className="px-3 py-2.5 font-medium">Recall</th>
                    <th className="px-3 py-2.5 font-medium">F1</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, idx) => (
                    <tr key={`${row.question}-${idx}`} className="align-top">
                      <td className="max-w-0 px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {row.question}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {row.error ? (
                            <span className="text-red-600">{row.error}</span>
                          ) : (
                            <>
                              Expected {row.expectedDocIds.length} doc
                              {row.expectedDocIds.length === 1 ? "" : "s"}
                              {row.topScore != null
                                ? ` · top score ${row.topScore.toFixed(2)}`
                                : ""}
                            </>
                          )}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                        {row.error
                          ? "—"
                          : `${row.hits}/${row.expectedDocIds.length}`}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {row.error ? "—" : pct(row.precision)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {row.error ? "—" : pct(row.recall)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {row.error ? "—" : pct(row.f1)}
                      </td>
                      <td className="px-3 py-3">
                        {row.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : row.status === "pass" ? (
                          <Badge variant="success">Pass</Badge>
                        ) : row.status === "partial" ? (
                          <Badge variant="warning">Partial</Badge>
                        ) : (
                          <Badge variant="destructive">Miss</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50/60"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/60"
        : tone === "danger"
          ? "border-red-200 bg-red-50/60"
          : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</p>
    </div>
  );
}
