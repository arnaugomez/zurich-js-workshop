# Agentic editor app

A collaborative Next.js and Tiptap document editor with AI Toolkit agent edits,
tracked changes, comments, inline rewrites, improvement suggestions, and
read-only supporting documents.

## Run locally

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The server creates a readable two-word document
slug and redirects to `/?document=<adjective>-<animal>`. Sharing that complete
URL opens the same collaborative document.

The app expects the Tiptap Cloud credentials and `OPENAI_API_KEY` in `.env`.

## Quality checks

```sh
pnpm check
```

This runs oxfmt, oxlint, TypeScript, Vitest, Playwright, and the production
Next.js build. Install the Playwright browser once with:

```sh
pnpm exec playwright install chromium
```
