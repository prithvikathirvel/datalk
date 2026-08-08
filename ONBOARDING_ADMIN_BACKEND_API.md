# Onboarding & Admin Backend API Specification

This document is the contract for the **backend services you will build later** to back
two frontend features that currently run on local JSON stores:

1. **First-time onboarding** — questions asked to a user right after their first signup
   (country, how they heard about Datalk, role, team size, notes).
2. **Admin panel** (`/admin`) — an internal operations console that lists onboarding
   submissions, registered users, chatbot configs, and the knowledge-gap feedback inbox.

The Next.js frontend already calls these through BFF (backend-for-frontend) routes.
When you build the real backend, you implement the endpoints below and the BFF routes
swap from the local stores to your HTTP API.

> Current frontend state: onboarding + users + admin credentials are persisted in
> `ui/.data/*.json` (dev only). Embed configs and feedback are proxied to the existing
> chat/embed backend. This document defines the production endpoints for all of it.

---

## 1. API families

| Family | Base path | Audience | Auth |
|---|---|---|---|
| Onboarding API | `/api/v1/onboarding` | Signed-in app users | Bearer JWT (customer) |
| Admin API | `/api/v1/admin/*` | Admin panel only | Bearer JWT (admin) |

The frontend BFF adds a layer (`/api/onboarding`, `/api/admin/*`) so the browser never
talks to your backend directly. **You only need to implement the backend endpoints in
this document; the BFF routes already exist.**

---

## 2. Conventions

- **Base URL**: `https://api.datalk.co.in` (or your API gateway domain).
- **Content type**: `application/json` everywhere.
- **Timestamps**: ISO 8601 UTC strings, e.g. `2026-08-08T10:15:30.000Z`.
- **IDs**: UUID v4 strings (users, submissions). Bot IDs and API keys keep their
  existing formats.
- **Errors**: FastAPI-style envelope.

```json
// 400 / 401 / 404 / 422
{ "detail": "Human readable error message." }

// 422 validation errors may also return the array form:
{
  "detail": [
    { "loc": ["body", "country"], "msg": "Field required", "type": "missing" }
  ]
}
```

- **List responses** wrap the array in a named key (e.g. `{ "submissions": [...] }`)
  so the shape can grow without breaking clients.

---

## 3. Onboarding API (customer-facing)

### 3.1 `POST /api/v1/onboarding`

Creates or updates the onboarding submission for the authenticated user
(one row per user — the frontend upserts).

**Auth**: Bearer JWT with `sub` = user UUID (same JWT the app already issues).

**Request body (payload schema):**

| Field | Type | Required | Allowed values / notes |
|---|---|---|---|
| `country` | string | ✅ | ISO 3166-1 alpha-2 code, e.g. `"IN"`, `"US"`, `"DE"`. Validate against the country list. |
| `heard_from` | string | ✅ | One of: `Google search`, `LinkedIn`, `Twitter / X`, `YouTube`, `Friend or colleague`, `Blog or article`, `Event / webinar`, `Other`. |
| `role` | string | ❌ | One of: `Founder / Executive`, `Developer / Engineer`, `Product manager`, `Marketing`, `Customer support`, `Student / Researcher`, `Other`. |
| `company_size` | string | ❌ | One of: `Just me`, `2–10`, `11–50`, `51–200`, `201–1000`, `1000+`. |
| `notes` | string | ❌ | Free text, max 1000 chars. |

**Example request:**

```http
POST /api/v1/onboarding
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "country": "IN",
  "heard_from": "LinkedIn",
  "role": "Founder / Executive",
  "company_size": "2–10",
  "notes": "Building a support bot for our SaaS onboarding flow."
}
```

**Example response — `200 OK` (update) / `201 Created` (first submission):**

```json
{
  "submission": {
    "user_id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
    "country": "IN",
    "heard_from": "LinkedIn",
    "role": "Founder / Executive",
    "company_size": "2–10",
    "notes": "Building a support bot for our SaaS onboarding flow.",
    "created_at": "2026-08-08T10:15:30.000Z",
    "updated_at": "2026-08-08T10:15:30.000Z"
  },
  "user": {
    "id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
    "email": "priya@example.com",
    "name": "Priya Sharma",
    "created_at": "2026-08-08T10:12:01.000Z",
    "onboarding_completed": true,
    "auth_provider": "cognito"
  }
}
```

**Validation rules:**

- Missing/blank `country` → `400 { "detail": "Please select your country." }`
- Missing/blank `heard_from` → `400 { "detail": "Please tell us how you heard about Datalk." }`
- `heard_from` not in the enum → `400`
- `role` / `company_size` present but not in enum → `400`
- Unauthenticated → `401 { "detail": "Unauthorized" }`

**Side effect:** the backend should set `onboarding_completed = true` on the user record
(the frontend uses this flag to decide whether to redirect new signups to `/onboarding`).

### 3.2 `GET /api/v1/onboarding`

Returns the authenticated user's submission, or `null`.

**Auth**: Bearer JWT (customer).

```http
GET /api/v1/onboarding
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Example response — `200 OK`:**

```json
{
  "submission": {
    "user_id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
    "country": "IN",
    "heard_from": "LinkedIn",
    "role": "Founder / Executive",
    "company_size": "2–10",
    "notes": null,
    "created_at": "2026-08-08T10:15:30.000Z",
    "updated_at": "2026-08-08T10:15:30.000Z"
  }
}
```

No submission yet → `200 { "submission": null }` (not 404 — it is a valid state).

### 3.3 Where the frontend calls this

| Frontend action | Next.js BFF route | Backend endpoint |
|---|---|---|
| Show/save onboarding form | `POST /api/onboarding` | `POST /api/v1/onboarding` |
| Load current answers (Settings → About you) | `GET /api/onboarding` | `GET /api/v1/onboarding` |

---

## 4. Admin API (admin-panel-facing)

All admin endpoints require an **admin JWT**. The frontend stores it in an httpOnly
cookie named `datalk_admin_session` (signed HS256, `sub: "admin"`, `role: "admin"`,
12 h expiry) and sends it as `Authorization: Bearer <token>`.

### 4.1 `POST /api/v1/admin/login`

Verifies admin credentials and returns a JWT.

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | ✅ | Case-insensitive compare. |
| `password` | string | ✅ | Compared against the stored PBKDF2 hash. |

**Example request:**

```http
POST /api/v1/admin/login
Content-Type: application/json

{ "username": "admin", "password": "admin" }
```

**Example response — `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 43200,
  "user": { "username": "admin", "role": "admin" }
}
```

**Errors:**

- `400` — missing username/password
- `401` — `{ "detail": "Invalid admin credentials." }`

**Admin credential precedence (implement in the backend config):**

1. Persisted overrides written by the admin Settings tab (DB row / `admin.json`).
2. Environment variables `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
3. Development default: `admin` / `admin`.

> ⚠️ **Never ship the default `admin/admin` to production.** Set `ADMIN_PASSWORD` or
> change it from the panel Settings tab.

### 4.2 `POST /api/v1/admin/logout`

Invalidates the admin session. **Auth**: admin JWT. Returns `{ "ok": true }`.

### 4.3 `PUT /api/v1/admin/credentials`

Changes the admin username/password. **Auth**: admin JWT.

**Request body:**

```json
{
  "current_password": "admin",
  "new_username": "ops",
  "new_password": "a-strong-password"
}
```

**Rules:**

- `current_password` must verify against the stored hash → else `401`.
- `new_username` ≥ 3 chars, `new_password` ≥ 6 chars → else `400`.
- Response `200 { "ok": true }`. The admin stays signed in (existing tokens remain
  valid until expiry; document that in production you may want to rotate).

### 4.4 `GET /api/v1/admin/onboarding`

All onboarding submissions, newest first. **Auth**: admin JWT.

```http
GET /api/v1/admin/onboarding
Authorization: Bearer <admin-jwt>
```

**Example response — `200 OK`:**

```json
{
  "submissions": [
    {
      "user_id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
      "country": "IN",
      "country_name": "India",
      "heard_from": "LinkedIn",
      "role": "Founder / Executive",
      "company_size": "2–10",
      "notes": "Building a support bot for our SaaS onboarding flow.",
      "created_at": "2026-08-08T10:15:30.000Z",
      "updated_at": "2026-08-08T10:15:30.000Z",
      "user": {
        "id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "created_at": "2026-08-08T10:12:01.000Z"
      }
    }
  ]
}
```

Optional query params (recommended): `?country=IN&heard_from=LinkedIn&limit=50&offset=0`.

### 4.5 `GET /api/v1/admin/users`

All registered accounts (Google OAuth + email/password), newest first.
**Never return password hashes.** **Auth**: admin JWT.

```json
{
  "users": [
    {
      "id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "auth_provider": "cognito",
      "onboarding_completed": true,
      "created_at": "2026-08-08T10:12:01.000Z"
    }
  ]
}
```

`auth_provider` ∈ `local` (email/password) | `cognito` (Google OAuth).

### 4.6 `GET /api/v1/admin/embed-configs`

Every chatbot config across all workspaces. **Auth**: admin JWT.
Same shape as the existing embed config contract (bot name, owner user id, active
status, allowed origins, created/updated timestamps).

```json
{
  "configs": [
    {
      "id": "wk_28f4c1",
      "user_id": "8f1d3c2a-9b5e-4f7a-8c1d-2e3f4a5b6c7d",
      "bot_name": "Acme Support",
      "is_active": true,
      "allowed_origins": ["https://acme.com"],
      "created_at": "2026-07-01T09:00:00.000Z",
      "updated_at": "2026-08-01T12:00:00.000Z"
    }
  ]
}
```

### 4.7 `GET /api/v1/admin/feedback`

The knowledge-gap inbox: questions visitors flagged as *Not helpful* / requested
human help on your embed chatbots. **Auth**: admin JWT.

```json
{
  "feedback": [
    {
      "id": "fb_9f2a1c",
      "bot_id": "wk_28f4c1",
      "question": "How do I migrate from the free plan?",
      "answer": "…",
      "reason": "not_helpful",
      "visitor_email": null,
      "page_url": "https://acme.com/pricing",
      "created_at": "2026-08-07T14:22:10.000Z"
    }
  ]
}
```

`reason` ∈ `not_helpful` | `needs_human`.

### 4.8 `GET /api/v1/admin/overview` (optional convenience)

Aggregates the above for a single dashboard call. **Auth**: admin JWT.

```json
{
  "onboarding": [],
  "users": [],
  "embed_configs": [],
  "feedback": [],
  "admin_username": "admin",
  "generated_at": "2026-08-08T10:15:30.000Z"
}
```

### 4.9 Where the frontend calls this

| Admin panel action | Next.js BFF route | Backend endpoint |
|---|---|---|
| Sign in | `POST /api/admin/login` | `POST /api/v1/admin/login` |
| Sign out | `POST /api/admin/logout` | `POST /api/v1/admin/logout` |
| Change credentials (Settings tab) | `POST /api/admin/credentials` | `PUT /api/v1/admin/credentials` |
| Dashboard payload (all tabs + refresh) | `GET /api/admin/overview` | `GET /api/v1/admin/overview` |

---

## 5. Suggested database model

```sql
-- users (extends whatever auth table you already have)
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'local'; -- local | cognito

CREATE TABLE onboarding_submissions (
    user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    country      TEXT NOT NULL,            -- ISO 3166-1 alpha-2
    heard_from   TEXT NOT NULL,            -- enum, see §3.1
    role         TEXT,                     -- enum, nullable
    company_size TEXT,                     -- enum, nullable
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_credentials (
    id            INTEGER PRIMARY KEY CHECK (id = 1),  -- singleton row
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,           -- PBKDF2/argon2
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Feedback and embed configs already live in the chat/embed service — the admin API
queries them there (or replicates them).

---

## 6. Security notes

- Admin login must be rate-limited (e.g. 5 attempts per 15 min per IP).
- Admin JWT lifetime: 12 hours; rotate on credential change.
- Never log or return password hashes.
- `GET /api/v1/admin/*` must 401 for non-admin JWTs — check `role == "admin"` server-side.
- Keep the customer onboarding endpoint scoped to the caller's own `sub` — a user must
  never read or write another user's submission.
- The frontend BFF (`ui/app/api/onboarding/route.ts`) already enforces the session
  check; keep the same enforcement in the backend.
- In production, replace `ui/.data/*.json` with the database and delete the local
  stores.

---

## 7. Suggested implementation order

1. `users.onboarding_completed` + `POST/GET /api/v1/onboarding`.
2. Admin auth (`POST /api/v1/admin/login` + role check middleware).
3. `GET /api/v1/admin/onboarding` + `GET /api/v1/admin/users`.
4. `PUT /api/v1/admin/credentials`.
5. `GET /api/v1/admin/embed-configs` + `GET /api/v1/admin/feedback` (read from the
   chat/embed service).
6. Switch each BFF route from the local store to `fetch` against these endpoints
   (each BFF route is a single small file — see `ui/app/api/onboarding/route.ts`).
