# Agentic editor app development plan

## Goal

Build a standalone Next.js collaborative document editor that combines Tiptap
AI Toolkit agent editing, tracked changes and comments, inline AI rewrites,
continuous improvement suggestions, and read-only supporting documents.

## Architecture

- Next.js full-stack TypeScript application rooted in this directory.
- Tiptap Collaboration and Yjs backed by Tiptap Cloud.
- Vercel AI SDK with the OpenAI provider for every model request.
- Tiptap AI Toolkit discovery and execution endpoints for agent document reads
  and edits.
- A server-generated, two-word document slug stored in the `document` query
  parameter. The cloud document name is
  `zurich-js-workshop/agentic-editor-app/<slug>`.
- Static classroom notes shared by mention lookup, prompt enrichment, the
  supporting-documents panel, and read-only agent tools.

## User experience

- A full-page document editor with a top formatting toolbar and no visible app
  title.
- A right sidebar with five tabs: Chat, Tracked changes, Comments,
  Suggestions, and Supporting documents.
- The document editor supports the normal StarterKit content and controls,
  links, collaborative editing, comments, tracked changes, inline rewrite, and
  AI Toolkit context.
- The chat composer is a separate minimal Tiptap editor containing only
  Document, Paragraph, Text, and Mention extensions.
- Chat mentions attach the referenced static document contents to the agent
  request. The agent can also list and read those documents through custom
  read-only tools.
- Agent edits use `gpt-5.6-luna`, Tiptap AI Toolkit tools, tracked-change
  review mode, and linked justification comments.
- Inline rewrite and improvement suggestions use `gpt-5.4-nano` through the
  OpenAI provider.
- Reset app obtains a fresh server-generated slug, clears local chat state, and
  replaces the URL, thereby mounting a fresh collaborative document without
  deleting the previous document.

## Delivery phases

1. Scaffold the application, dependencies, configuration, environment file,
   and oxlint/oxfmt/type-check/build/test scripts.
2. Implement server-only slug generation, URL canonicalization, collaboration
   authentication, and provider lifecycle.
3. Port the reference editor layout, formatting toolbar, tracked changes,
   comments, and initial student report.
4. Implement the minimal mention-aware chat composer and static supporting
   documents.
5. Implement the AI Toolkit agent route plus read-only supporting-document
   tools using the OpenAI provider.
6. Port inline rewrite with mappable positions and its OpenAI route.
7. Port debounced document-diff suggestions and their structured-output route.
8. Implement reset behavior and all loading, empty, and error states.
9. Add unit/integration tests and Playwright end-to-end coverage.
10. Run formatting, linting, type-checking, tests, browser tests, and a
    production build; resolve every failure.

## Verification

- Unit-test slug validation, supporting-document lookup and mention
  serialization, rewrite range behavior and punctuation, and document diffs.
- Exercise API validation and deterministic mock paths without requiring paid
  model calls.
- Use Playwright to verify URL generation, the editor and five tabs, mentions,
  formatting, reset behavior, and collaboration across browser contexts where
  credentials are available.
- Run `oxfmt --check`, `oxlint`, `tsc --noEmit`, the unit suite, Playwright, and
  `next build` as the final pipeline.
