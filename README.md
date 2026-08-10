# History Chatter

Chat with historical figures — scientists, explorers, philosophers, leaders, and more. Built with React, Vite, Supabase, and AI-powered edge functions (chat + text-to-speech).

## Features

- Character profiles with era, bio, and personality-driven replies
- One-on-one and group chat
- Auth, favorites, and conversation history
- Optional text-to-speech via Supabase edge functions

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase (Auth, DB, Edge Functions)
- **AI / TTS:** Lovable AI gateway + ElevenLabs (configured as Supabase secrets)

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project

### Setup

```sh
git clone <YOUR_GIT_URL>
cd historychatter
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase URL and publishable (anon) key from **Project Settings → API**.

```sh
npm run dev
```

App runs at `http://localhost:5173` by default.

### Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
| `npm test`        | Run Vitest               |

## Environment variables

### Frontend (`.env`)

| Variable                         | Description                          |
| -------------------------------- | ------------------------------------ |
| `VITE_SUPABASE_URL`              | Supabase project URL                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY`  | Supabase anon / publishable key      |
| `VITE_SUPABASE_PROJECT_ID`       | Supabase project ref                 |

Never commit `.env`. Use `.env.example` as a template.

### Edge function secrets (Supabase dashboard / CLI)

Set these in Supabase — they are **not** stored in this repo:

| Secret               | Used by              |
| -------------------- | -------------------- |
| `LOVABLE_API_KEY`    | `chat` function      |
| `ELEVENLABS_API_KEY` | `text-to-speech`     |

## Project structure

```
src/
  components/     # UI and chat components
  data/           # Historical character definitions
  hooks/          # Auth, chat, favorites, TTS
  integrations/   # Supabase client
  pages/          # Routes (home, chat, auth, favorites, history)
supabase/
  functions/      # Edge functions: chat, text-to-speech
  migrations/     # SQL migrations
```

## Security notes

- API keys for Lovable and ElevenLabs are read from Deno env in edge functions only.
- The Vite `VITE_*` Supabase values are public client config (anon key). Protect data with Supabase RLS policies.
- Keep service-role keys and third-party API keys out of the frontend and out of git.
