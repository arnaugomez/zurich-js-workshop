# Implementation checklist

- [x] Scaffold the standalone Next.js app and copy the environment file without
      reading it.
- [x] Configure pnpm, TypeScript, oxlint, oxfmt, Vitest, Playwright, and the
      production build pipeline.
- [x] Generate two-word document slugs on the server and canonicalize the
      `document` query parameter.
- [x] Sign collaboration tokens and mount the cloud document at
      `zurich-js-workshop/agentic-editor-app/<slug>`.
- [x] Build the collaborative StarterKit editor, toolbar, initial report, and
      full-page reference-inspired layout.
- [x] Implement tracked changes, linked comments, panels, and inline review
      controls.
- [x] Build the minimal Document/Paragraph/Text/Mention Tiptap chat composer.
- [x] Reuse the six static classroom notes for mentions, prompt context, the
      sidebar, and read-only agent tools.
- [x] Connect the agent to Tiptap AI Toolkit discovery/execution endpoints and
      the OpenAI provider with `gpt-5.6-luna`.
- [x] Port mappable-position inline rewrite and use the OpenAI provider with
      `gpt-5.4-nano`.
- [x] Port document-diff improvement suggestions with debounce, stale-request
      protection, structured output, and `gpt-5.4-nano`.
- [x] Implement Reset app by clearing local chat and replacing the URL with a
      fresh server-generated collaborative document slug.
- [x] Add unit tests for identity, evidence lookup, mentions, rewrites, and
      document diffs.
- [x] Add Playwright tests for routing, panels, mentions, reset, and two-browser
      collaboration.
- [x] Pass formatting, linting, type-checking, unit tests, Playwright tests, and
      a production Next.js build.
