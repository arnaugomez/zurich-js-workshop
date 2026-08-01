# AI rewrite with mappable positions

This workshop keeps a selected Tiptap range valid while an async AI request is running. The browser app stores mappable positions, sends the selected text and a selected task to the Node.js server, and replaces the corresponding current range when the response arrives.

## Projects

- `apps/web`: Vite and React editor.
- `apps/server`: Node.js API that calls OpenAI Responses with `gpt-5.4-nano`.

Run both projects from this directory:

```sh
pnpm install
pnpm dev
```

The editor is available at `http://localhost:5173`. The Vite development server proxies `/api` to the API at `http://localhost:3001`.

Set `OPENAI_API_KEY` before starting the server. For a workshop run without an API key, start both projects with:

```sh
MOCK_RESPONSE=true pnpm dev
```

The mock API returns `MOCK RESPONSE`, adjusted to match whether the selected text ends in punctuation.

## Exercises

Implement the client-side mappable-range helpers in [apps/web/src/exercise/aiRewrite.ts](apps/web/src/exercise/aiRewrite.ts). `requestAiRewrite` now receives the chosen task, editor, and range, and passes the task and selected text to the API.

Implement the prompt builder in [apps/server/src/exercise/buildRewritePrompt.ts](apps/server/src/exercise/buildRewritePrompt.ts). The complete references live alongside them in their respective `solution` directories.

Implement the punctuation helper in [apps/server/src/exercise/preserveTrailingPunctuation.ts](apps/server/src/exercise/preserveTrailingPunctuation.ts). It makes the generated rewrite match whether the original selection ended in punctuation. A complete reference implementation lives in the `solution` directory.

Run all tests:

```sh
pnpm test
```
