# RAG Evaluation Backend — Python (FastAPI) Implementation Guide

This document specifies the backend support for the **Test & Evaluate** tab on the
Documents page. Customers use it to measure how well their ingested documents
answer a set of questions, with metrics such as **Precision@K, Recall@K, F1,
Hit Rate and MRR**, and to download the result as a report.

The Next.js UI **already works fully client-side** (it loops over
`GET /search/search` per question and scores the results in the browser).
This document describes the **optional, recommended batch endpoint** that moves
the work server-side for speed, consistency and future reporting features.

---

## 1. Overview

| Decision | Value | Why |
|---|---|---|
| Service | **Ingestion service** (the one that already hosts `GET /search/search`) | It owns the vector store / retriever |
| HTTP shape | `POST` with JSON body | Ground truth can be large; keeps URLs clean |
| Concurrency | `asyncio` + `Semaphore(5)` | 10–25× faster than the browser's sequential loop |
| Per-question isolation | one failure != failed run | matches the UI's per-row `error` state |
| Auth | Same JWT bearer used by `/search/search` | no new credential surface |

### What the UI sends

Each ground-truth line entered by the user is:

```
<question text> | <expected_document_id_1>,<expected_document_id_2>
```

The UI will call the batch endpoint like this (when it exists — today it calls
`GET /search/search` in a loop instead, so **the frontend needs no change for V1**):

---

## 2. Endpoint Specification

### 2.1 Batch evaluate

- **URL:** `/search/api/v1/evaluate`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Rate limits (suggested):** 10 requests/min/user, `queries ≤ 25`, `top_k ≤ 20`
- **Timeout (suggested):** 120 s overall, 30 s per retrieval

#### Request body

```json
{
  "queries": [
    {
      "question": "What are the government holidays?",
      "expected_document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"]
    },
    {
      "question": "How do I apply for earned leave?",
      "expected_document_ids": [
        "b9e7819d-a5d1-4b3b-ba86-cd9ce233633e",
        "7c2a41e0-1a2b-4c3d-8e9f-a1b2c3d4e5f6"
      ]
    }
  ],
  "top_k": 5,
  "document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"]
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `queries` | `array[EvalQuery]` | ✅ | — | 1–25 question objects |
| `queries[].question` | `string` (1–500 chars) | ✅ | — | The natural-language question |
| `queries[].expected_document_ids` | `array[string]` | ✅ | — | 1–10 document IDs a correct answer **must** come from |
| `top_k` | `integer` 1–20 | ❌ | `5` | Chunks retrieved per question |
| `document_ids` | `array[string]` | ❌ | `null` | Restrict retrieval to this corpus subset (identical semantics to the existing `document_ids` filter on `/search/search`) |

#### Response body — `200 OK`

```json
{
  "top_k": 5,
  "evaluated_at": "2026-07-31T15:02:11.482Z",
  "duration_ms": 2381,
  "aggregate": {
    "queries": 2,
    "avg_precision": 0.5,
    "avg_recall": 0.75,
    "avg_f1": 0.6,
    "hit_rate": 1.0,
    "mrr": 0.75
  },
  "results": [
    {
      "question": "What are the government holidays?",
      "expected_document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"],
      "retrieved_document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e", "a1b2c3d4-..."],
      "hits": 1,
      "precision": 0.5,
      "recall": 1.0,
      "f1": 0.6667,
      "reciprocal_rank": 1.0,
      "top_score": 0.83,
      "status": "pass",
      "error": null
    },
    {
      "question": "How do I apply for earned leave?",
      "expected_document_ids": ["b9e7819d-...", "7c2a41e0-..."],
      "retrieved_document_ids": ["7c2a41e0-...", "a1b2c3d4-..."],
      "hits": 1,
      "precision": 0.5,
      "recall": 0.5,
      "f1": 0.5,
      "reciprocal_rank": 1.0,
      "top_score": 0.74,
      "status": "partial",
      "error": null
    }
  ]
}
```

#### Error responses

**`422 Unprocessable Entity`** — validation failure (Pydantic default format):

```json
{
  "detail": [
    {
      "loc": ["body", "queries", 1, "expected_document_ids"],
      "msg": "ensure this list has at least 1 items",
      "type": "value_error.list.any_items.min_items"
    }
  ]
}
```

**`401 Unauthorized`**

```json
{ "detail": "Unauthorized" }
```

**`504 Gateway Timeout`** — overall run exceeded the time budget; partial results are *not* returned, clients retry with fewer queries.

---

## 3. Metric Definitions (keep exactly in sync with the UI)

Let `R_i` = the **ordered, de-duplicated list of document IDs** in the top-`K`
retrieved chunks for question `i`, and `E_i` = the set of expected document IDs.

| Metric | Formula | Intuition |
|---|---|---|
| `precision_i` | `\|R_i ∩ E_i\| / \|R_i\|` (0 if `R_i` empty) | Of what you showed, how much was relevant |
| `recall_i` | `\|R_i ∩ E_i\| / \|E_i\|` | Of what mattered, how much you found |
| `f1_i` | `2·P·R / (P+R)` (0 when `P+R = 0`) | Harmonic balance |
| `reciprocal_rank_i` | `1 / rank_of_first(relevant)` in `R_i`, 0 if none | How high the first correct answer appears |
| `avg_*` | mean over all successful queries | Headline numbers |
| `hit_rate` | `count(recall_i > 0) / N` | % of questions answerable at all |
| `mrr` | mean of `reciprocal_rank_i` | Ranking quality summary |

**Status per question:** `pass` (recall = 1) · `partial` (0 < recall < 1) ·
`fail` (recall = 0) · `error` (retrieval errored; excluded from aggregates).

> ⚠️ **De-duplication matters:** multiple chunks can come from one document.
> Metrics operate on the *unique documents* within `R_i`, preserving rank order
> (first occurrence keeps the rank).

---

## 4. Pydantic Schemas (`schemas/evaluation.py`)

```python
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class EvalQueryInput(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    expected_document_ids: List[str] = Field(..., min_length=1, max_length=10)

    @field_validator("question")
    @classmethod
    def strip_question(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("question must not be blank")
        return value


class EvaluationRequest(BaseModel):
    queries: List[EvalQueryInput] = Field(..., min_length=1, max_length=25)
    top_k: int = Field(default=5, ge=1, le=20)
    document_ids: Optional[List[str]] = Field(default=None, max_length=50)


class EvalResultRow(BaseModel):
    question: str
    expected_document_ids: List[str]
    retrieved_document_ids: List[str] = []
    hits: int = 0
    precision: float = 0.0
    recall: float = 0.0
    f1: float = 0.0
    reciprocal_rank: float = 0.0
    top_score: Optional[float] = None
    status: Literal["pass", "partial", "fail", "error"] = "fail"
    error: Optional[str] = None


class EvalAggregate(BaseModel):
    queries: int
    avg_precision: float
    avg_recall: float
    avg_f1: float
    hit_rate: float
    mrr: float


class EvaluationResponse(BaseModel):
    top_k: int
    evaluated_at: datetime
    duration_ms: float
    aggregate: EvalAggregate
    results: List[EvalResultRow]
```

---

## 5. Metrics Module (`services/eval_metrics.py`)

```python
from __future__ import annotations

from typing import Iterable, List, Sequence, Set


def ordered_unique(values: Iterable[str]) -> List[str]:
    """First-seen order, dropping duplicates and blanks."""
    seen: Set[str] = set()
    out: List[str] = []
    for value in values:
        v = (value or "").strip()
        if v and v not in seen:
            seen.add(v)
            out.append(v)
    return out


def precision_recall_f1(retrieved: Sequence[str], expected: Set[str]) -> tuple[int, float, float, float]:
    hits = sum(1 for doc_id in retrieved if doc_id in expected)
    precision = hits / len(retrieved) if retrieved else 0.0
    recall = hits / len(expected) if expected else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    return hits, precision, recall, f1


def reciprocal_rank(retrieved: Sequence[str], expected: Set[str]) -> float:
    for index, doc_id in enumerate(retrieved):
        if doc_id in expected:
            return 1.0 / (index + 1)
    return 0.0


def row_status(recall: float) -> str:
    if recall >= 1.0:
        return "pass"
    if recall > 0.0:
        return "partial"
    return "fail"


def aggregate(rows) -> dict:
    scored = [row for row in rows if row.status != "error"]
    if not scored:
        return {"queries": 0, "avg_precision": 0.0, "avg_recall": 0.0,
                "avg_f1": 0.0, "hit_rate": 0.0, "mrr": 0.0}
    n = len(scored)
    return {
        "queries": n,
        "avg_precision": round(sum(r.precision for r in scored) / n, 4),
        "avg_recall": round(sum(r.recall for r in scored) / n, 4),
        "avg_f1": round(sum(r.f1 for r in scored) / n, 4),
        "hit_rate": round(sum(1 for r in scored if r.recall > 0) / n, 4),
        "mrr": round(sum(r.reciprocal_rank for r in scored) / n, 4),
    }
```

---

## 6. Evaluation Service (`services/evaluation_service.py`)

```python
from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone

from schemas.evaluation import (
    EvalQueryInput,
    EvalResultRow,
    EvaluationRequest,
    EvaluationResponse,
)
from services.eval_metrics import (
    aggregate,
    ordered_unique,
    precision_recall_f1,
    reciprocal_rank,
    row_status,
)

# Reuse the *same* retrieval call the existing GET /search/search handler uses,
# so evaluation always measures production behaviour.
from services.search_service import vector_search  # <- existing function

MAX_CONCURRENT_RETRIEVALS = 5
PER_QUERY_TIMEOUT_SECONDS = 30


async def _evaluate_one(
    query: EvalQueryInput,
    *,
    top_k: int,
    document_ids: list[str] | None,
    user_id: str,
    semaphore: asyncio.Semaphore,
) -> EvalResultRow:
    expected = set(query.expected_document_ids)
    row = EvalResultRow(question=query.question, expected_document_ids=query.expected_document_ids)

    try:
        async with semaphore:
            chunks = await asyncio.wait_for(
                vector_search(                       # existing retriever
                    query=query.question,
                    top_k=top_k,
                    user_id=user_id,
                    document_ids=document_ids,
                ),
                timeout=PER_QUERY_TIMEOUT_SECONDS,
            )
        retrieved = ordered_unique(
            str(chunk.metadata.get("document_id") or "") for chunk in chunks
        )
        hits, precision, recall, f1 = precision_recall_f1(retrieved, expected)

        row.retrieved_document_ids = retrieved
        row.hits = hits
        row.precision = round(precision, 4)
        row.recall = round(recall, 4)
        row.f1 = round(f1, 4)
        row.reciprocal_rank = round(reciprocal_rank(retrieved, expected), 4)
        row.top_score = chunks[0].score if chunks else None
        row.status = row_status(recall)            # "pass" | "partial" | "fail"
    except Exception as exc:                        # noqa: BLE001 — isolate per query
        row.status = "error"
        row.error = str(exc)[:300]
    return row


async def run_evaluation(
    payload: EvaluationRequest,
    *,
    user_id: str,
) -> EvaluationResponse:
    started = time.perf_counter()
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_RETRIEVALS)

    tasks = [
        _evaluate_one(
            q,
            top_k=payload.top_k,
            document_ids=payload.document_ids,
            user_id=user_id,
            semaphore=semaphore,
        )
        for q in payload.queries
    ]
    # asyncio.gather preserves input order — results line up with the textarea.
    rows = list(await asyncio.gather(*tasks))

    return EvaluationResponse(
        top_k=payload.top_k,
        evaluated_at=datetime.now(timezone.utc),
        duration_ms=round((time.perf_counter() - started) * 1000, 1),
        aggregate=aggregate(rows),
        results=rows,
    )
```

---

## 7. Router (`routers/evaluation.py`)

```python
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from schemas.evaluation import EvaluationRequest, EvaluationResponse
from services.evaluation_service import run_evaluation
from .deps import get_current_user_id  # existing auth dependency (JWT)

router = APIRouter(prefix="/search/api/v1", tags=["evaluation"])


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(
    payload: EvaluationRequest,
    user_id: str = Depends(get_current_user_id),
) -> EvaluationResponse:
    return await run_evaluation(payload, user_id=user_id)
```

### Optional: CSV report endpoint

Returns the same analysis as a downloadable file so the UI's *Download report*
button can be a single link instead of client-side CSV assembly.

```python
import io, csv

@router.post("/evaluate/report")
async def evaluate_report(
    payload: EvaluationRequest,
    user_id: str = Depends(get_current_user_id),
):
    result = await run_evaluation(payload, user_id=user_id)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["question", "expected_doc_ids", "retrieved_doc_ids",
                     "precision_at_k", "recall_at_k", "f1_at_k",
                     "reciprocal_rank", "top_score", "status"])
    for row in result.results:
        writer.writerow([
            row.question,
            ";".join(row.expected_document_ids),
            ";".join(row.retrieved_document_ids),
            "" if row.status == "error" else row.precision,
            "" if row.status == "error" else row.recall,
            "" if row.status == "error" else row.f1,
            "" if row.status == "error" else row.reciprocal_rank,
            row.top_score if row.top_score is not None else "",
            f"error: {row.error}" if row.status == "error" else row.status,
        ])
    writer.writerow([])
    writer.writerow(["aggregate"])
    writer.writerow(["top_k", result.top_k])
    for key, value in result.aggregate.model_dump().items():
        writer.writerow([key, value])

    buffer.seek(0)
    filename = f"rag-evaluation-{result.evaluated_at:%Y%m%dT%H%M%S}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
```

---

## 8. Example Calls

### cURL

```bash
curl -X POST "https://<INGESTION_HOST>/search/api/v1/evaluate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {
        "question": "What are the government holidays?",
        "expected_document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"]
      }
    ],
    "top_k": 5
  }'
```

### Success response (single query, clean corpus)

```json
{
  "top_k": 5,
  "evaluated_at": "2026-07-31T15:02:11.482Z",
  "duration_ms": 1214.7,
  "aggregate": {
    "queries": 1,
    "avg_precision": 1.0,
    "avg_recall": 1.0,
    "avg_f1": 1.0,
    "hit_rate": 1.0,
    "mrr": 1.0
  },
  "results": [
    {
      "question": "What are the government holidays?",
      "expected_document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"],
      "retrieved_document_ids": ["b9e7819d-a5d1-4b3b-ba86-cd9ce233633e"],
      "hits": 1,
      "precision": 1.0,
      "recall": 1.0,
      "f1": 1.0,
      "reciprocal_rank": 1.0,
      "top_score": 0.91,
      "status": "pass",
      "error": null
    }
  ]
}
```

### Response with one failing question (retriever error isolated)

```json
{
  "aggregate": { "queries": 1, "avg_precision": 1.0, "avg_recall": 1.0, "avg_f1": 1.0, "hit_rate": 1.0, "mrr": 1.0 },
  "results": [
    { "question": "…", "status": "pass", "recall": 1.0 },
    { "question": "…", "status": "error", "error": "vector store timeout after 30s",
      "hits": 0, "precision": 0.0, "recall": 0.0, "f1": 0.0,
      "reciprocal_rank": 0.0, "top_score": null }
  ]
}
```

---

## 9. Guardrails & Operations Checklist

- [ ] Reject `queries.length > 25` → `422` (schema-level, already enforced)
- [ ] Bound concurrency with the semaphore (5) — a 25-query run issues max 5 parallel vector searches
- [ ] Per-query timeout (30 s); overall endpoint budget 120 s (reverse proxy should allow ≥ 130 s)
- [ ] Never log full questions if your vector store logs contain PII-adjacent data; log counts and durations instead
- [ ] Metrics are computed on **unique documents**, not chunks — do not change this or the UI numbers diverge
- [ ] `run_evaluation` must tolerate the existing retriever throwing (network, OpenSearch errors) → row-level `error`, never a 500 for the whole run

---

## 10. Migration Path

1. **V0 (already live):** Next.js loops over `GET /search/search` in the browser and computes metrics client-side. No backend work needed.
2. **V1 (this document):** add `POST /search/api/v1/evaluate`. The Next.js BFF then adds a thin proxy (`app/api/search/evaluate/route.ts`) mirroring the existing `app/api/search/route.ts` pattern (Bearer forward → `proxyJson`). The UI swaps its loop for one POST; the on-screen metrics stay identical.
3. **V2 (optional):** persist runs (`evaluation_runs` table: id, user_id, created_at, aggregate jsonb, rows jsonb) to show *score over time* after every ingestion, and scheduled re-evaluations per document set.
