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
