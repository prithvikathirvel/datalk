# RAG SaaS Product

A polished npm-compatible SaaS web app for your existing **RAG Ingestion Service** and **RAG Chat Service**.

Users can sign up, upload documents, search processed knowledge, chat with documents, and publish a customizable chatbot widget to their own websites.

## Features

### Core SaaS app

- Next.js 15, React 19, TypeScript
- npm workspaces
- Clean SaaS dashboard UI
- Credential signup/login/logout
- HTTP-only JWT cookie
- Server-side BFF/proxy API routes
- JWT payload includes `sub` user UUID for your backends
- Protected dashboard, documents, chat, embed, coverage lab, and settings pages

### Documents

- Upload documents as `raw`, `processed`, or `both`
- List uploaded S3 raw files
- Delete files using backend `file_path`
- Semantic search UI for processed chunks

### Chatbot

- Document-aware chat UI
- Thread persistence using returned `thread_id`
- Conversation reload from backend history

### Embed chatbot

- Create embeddable website chatbots
- Customize:
  - bot name
  - welcome message
  - primary color
  - launcher label
  - avatar initials
  - widget position
  - suggested questions
  - fallback/handoff message
  - optional visitor email capture
  - allowed website origins
- One-line script install code:

```html
<script async src="https://your-saas-domain.com/api/embed/script?botId=BOT_ID"></script>
```

The script injects a floating launcher and iframe widget that fits into any website.

### Unique feature 1: Knowledge Gap Inbox

Embedded visitors can click **Not helpful** or **Human help**. The app stores those questions as a knowledge-gap backlog so the admin can see what content is missing and improve uploaded documents.

This is stored locally in development at:

```txt
ui/.data/embed-configs.json
```

### Unique feature 2: Coverage Lab

The **Coverage Lab** page lets admins paste real customer questions and test whether processed documents retrieve strong chunks before the chatbot is published. It classifies each question as **Covered**, **Weak**, or **Missing**, turning weak answers into content improvement tasks.

## Project structure

```txt
.
├── package.json
├── README.md
├── packages/
│   ├── contracts/
│   └── ui/
└── ui/
    ├── app/
    │   ├── (auth)/
    │   ├── (app)/
    │   │   ├── dashboard/
    │   │   ├── documents/
    │   │   ├── chat/
    │   │   ├── embed/
    │   │   └── settings/
    │   ├── api/
    │   └── widget/[botId]/
    ├── components/
    ├── lib/
    ├── stores/
    └── middleware.ts
```

## Requirements

- Node.js 20.11+
- npm 10+
- Running ingestion backend
- Running chat backend

## Install

```bash
npm install
```

## Environment setup

```bash
cp ui/.env.example ui/.env.local
```

Edit `ui/.env.local`:

```bash
JWT_SECRET="change-me-to-the-same-secret-used-by-your-backends"
INGESTION_API_BASE_URL="http://localhost:8000/api/v1"
CHAT_API_BASE_URL="http://localhost:8001/api/v1"
NEXT_PUBLIC_APP_NAME="DocuMind RAG"
```

`JWT_SECRET` must match the secret used by your ingestion and chat services. The app signs HS256 JWTs with this payload shape:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234567890
}
```

If your backend uses another JWT algorithm, update `ui/lib/jwt.ts`.

## Run development

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Build production

```bash
npm run build
npm run start
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run format
```

## Backend routes used

### Ingestion service

| UI action | Next.js route | Backend route |
|---|---|---|
| Upload file | `POST /api/ingest/upload?upload_type=both` | `POST /ingest/upload?upload_type=both` |
| List files | `GET /api/ingest/files` | `GET /ingest/get-files` |
| Delete file | `DELETE /api/ingest/delete?file_path=...` | `DELETE /ingest/delete-file?file_path=...` |
| Semantic search | `GET /api/search?query=...&top_k=5` | `GET /search/search?query=...&top_k=5` |

### Chat service

| UI action | Next.js route | Backend route |
|---|---|---|
| App chat | `POST /api/chat` | `POST /chat/chat` |
| App conversation history | `GET /api/chat/conversation?thread_id=...` | `GET /chat/get-conversation?thread_id=...` |
| Public embed chat | `POST /api/embed/[botId]/chat` | `POST /chat/chat` |

For embed chat, Next.js loads the bot config, signs a JWT for the bot owner, and calls your chat backend server-side.

## Embed install flow

1. Login
2. Go to **Embed**
3. Customize the chatbot
4. Add allowed website origins, for example:

```txt
https://example.com
https://www.example.com
```

5. Save
6. Copy the generated script
7. Paste it before `</body>` on the website

## Local auth/storage note

Because you have not created the auth backend yet, this implementation uses local JSON files:

```txt
ui/.data/users.json
ui/.data/embed-configs.json
```

Passwords are hashed using PBKDF2. This is good for local development and demos. For production, replace these files with a database-backed implementation.

Recommended production replacements:

- Postgres + Prisma
- Supabase Auth + Postgres
- Clerk/Auth.js for auth
- Redis/Postgres for embed analytics and feedback

## Common issues

### `401 Unauthorized` from ingestion/chat backend

Check:

1. `JWT_SECRET` matches backend services.
2. Your backend expects HS256 JWTs.
3. The token includes `sub` — this app includes it.

### Search/chat does not find uploaded files

Upload documents with:

- `both`, or
- `processed`

`raw` uploads only will not appear in semantic search.

### Embed chatbot does not appear

Check:

1. The chatbot is active.
2. The website origin is allowed.
3. The script uses the correct SaaS domain.
4. Your chat backend is running and accepts the frontend JWT.

## SEO indexing & crawl budget setup

This app ships with Google Search Console-friendly defaults out of the box. No design, styling, or app behavior was changed to add this — it's all metadata, `robots.ts`, and `sitemap.ts` config.

### What was added/fixed

| Area | What it does |
|---|---|
| `ui/app/layout.tsx` | Sitewide `robots: { index: true, follow: true }` (site stays indexable by default); `metadataBase` derived from `NEXT_PUBLIC_SITE_URL`. |
| `ui/app/page.tsx`, `.../login`, `.../signup`, `.../privacy`, `.../terms` | Explicit absolute `alternates.canonical` on every public page, so query-string variants (`/login?next=...&error=...`) don't get flagged as duplicate content without a canonical. |
| `ui/app/(app)/layout.tsx` | `robots: { index: false, follow: false }` on the authenticated app shell (`/dashboard`, `/documents`, `/chat`, `/analytics`, `/quality`, `/settings`, `/embed`). These pages redirect anonymous visitors (including Googlebot) to `/login`, so they were previously showing up in Search Console as **Page with redirect** / **Crawled – not indexed** noise. |
| `ui/app/widget/page.tsx` | Page-level `noindex` — it's a real, crawlable URL (an `<iframe>` payload embedded on customer sites, gated by an API key, not a login) so it isn't blocked in `robots.txt`; it's just told not to appear in search results. |
| `ui/app/robots.ts` (new) | Generates `/robots.txt`. Allows all public marketing/legal content; disallows `/api/*` and the authenticated app routes (crawl-budget savings, since those routes 30x-redirect to `/login` for every crawl anyway). Points to `/sitemap.xml`. |
| `ui/app/sitemap.ts` (new) | Generates `/sitemap.xml` listing only public, indexable URLs (`/`, `/login`, `/signup`, `/privacy`, `/terms`). Authenticated/noindexed routes are intentionally left out so they don't create "blocked by robots.txt" / "excluded by noindex" warnings. |
| `ui/.env.example`, `ui/.env.local.example` | Document `NEXT_PUBLIC_SITE_URL` — previously only *read* in code with a silent fallback, never documented for whoever configures a deployment. |

None of these touch component code, styling, routing behavior, or the app's actual functionality — a logged-out user or search engine crawler sees the exact same rendered pages as before; only the `<head>` metadata, `/robots.txt`, and `/sitemap.xml` responses changed.

### Required environment variable

Set this in every deployment environment (staging and production), pointing at the real public domain of that environment:

```bash
NEXT_PUBLIC_SITE_URL=https://datalk.co.in
```

If unset, the app falls back to `https://datalk.co.in` (hardcoded default) — so a preview/staging deployment that doesn't set this will emit canonical tags and sitemap URLs pointing at production. **Always set `NEXT_PUBLIC_SITE_URL` explicitly per environment** to avoid canonicalizing a staging build to the production domain (or vice versa).

### What you must do on your deployment platform (AWS Amplify, per `amplify.yml`)

1. **Set `NEXT_PUBLIC_SITE_URL` as a build-time environment variable** in the Amplify Console for each branch/environment (Amplify Console → App settings → Environment variables). Because it's a `NEXT_PUBLIC_*` variable, it's baked in at build time — changing it requires a rebuild, not just a redeploy.
   - Production branch → `https://datalk.co.in`
   - Any preview/staging branch → its own staging URL (not the production domain), or omit the sitemap/robots submission step for that environment.
2. **Verify `/robots.txt` and `/sitemap.xml` are reachable after deploy** (Next.js serves these dynamically via `app/robots.ts` / `app/sitemap.ts`, not as static files — Amplify's SSR/hosting compute must be serving app routes, not just static assets):
   ```bash
   curl -sI https://datalk.co.in/robots.txt
   curl -sI https://datalk.co.in/sitemap.xml
   ```
   Both should return `200` with `content-type: text/plain` (robots.txt) and `application/xml` (sitemap.xml).
3. **Submit the sitemap in Google Search Console**: Search Console → Sitemaps → add `https://datalk.co.in/sitemap.xml`. Do this once after the domain is verified.
4. **Confirm only one canonical domain is used everywhere** — pick either `datalk.co.in` or `www.datalk.co.in` and make sure `NEXT_PUBLIC_SITE_URL`, DNS, and any Amplify domain redirects all agree. Mixed www/non-www or http/https serving without a redirect will split indexing signals.
5. **Do not put a blanket `Disallow: /` or a sitewide `noindex` in front of Amplify** (e.g. in a CDN/WAF rule, or a "maintenance mode" header) once you go live — that would override everything above and deindex the entire site regardless of what the app emits.
6. **Re-run this checklist after any domain change** (e.g. adding a custom domain in Amplify, moving off the default `*.amplifyapp.com` URL) — canonical URLs, sitemap entries, and the Search Console property must all be updated to match the new domain, or you'll get "Duplicate, Google chose different canonical" warnings between the old and new hosts.

### Indexing checklist (already satisfied by this change set)

- [x] All public pages have absolute canonical URLs
- [x] Authenticated app pages are `noindex`ed (they redirect to `/login` for anonymous visitors, including Googlebot)
- [x] `/widget` (crawlable iframe payload) is `noindex`ed without being blocked in `robots.txt`
- [x] `robots.ts` allows public content, disallows `/api/*` and the authenticated app routes, and references the sitemap
- [x] `sitemap.ts` returns only indexable URLs with valid XML
- [x] No sitewide `noindex` in the root layout
- [ ] **You still need to**: set `NEXT_PUBLIC_SITE_URL` per environment in Amplify, verify the domain in Google Search Console, and submit the sitemap URL (see steps above — these are platform/account actions, not code changes)
