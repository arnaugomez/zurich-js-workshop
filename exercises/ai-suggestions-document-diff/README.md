# AI suggestions from document changes

This workshop demo helps a special-needs education teacher improve an end-of-course student report. A Tiptap editor sends its previous and current structured JSON to the server two seconds after editing stops. The server compares top-level blocks with a paragraph-granularity Myers diff and asks AI for short, evidence-grounded questions.

The initial request has no changes, so AI receives the complete current document with an initial-review prompt. Once the teacher edits, AI receives the current document and a compact list of recent changes; it never receives full before-and-after copies of the report.

## Run the demo

```sh
pnpm install
MOCK_RESPONSE=true pnpm dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3001`; Vite proxies `/api` to it. To use OpenAI, copy `apps/server/.env.example` to `apps/server/.env`, set `OPENAI_API_KEY`, and run `pnpm dev` without `MOCK_RESPONSE=true`.

## Exercises

1. Implement `apps/web/src/exercise/getEditorDocument.ts` to extract Tiptap JSON.
2. Implement the four helpers in `apps/server/src/exercise/documentDiff.ts`: direct-child extraction, deep node comparison, Myers diff, and adjacent-change joining.
3. Implement `apps/server/src/exercise/buildSuggestionsPrompt.ts`.

Completed references are in each app's `src/solution` directory. The runnable demo imports the solutions so it works before workshop participants complete the exercises.

Run all exercise and solution tests:

```sh
pnpm test
```
