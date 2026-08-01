Architecture and technology

- Next.js full-stack app with Next.js API routes for the backend.
- Vercel AI SDK as AI agent framework.
- Similar architecture as the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo
- Tiptap collaboration. In contrast to the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo, it always operates on the same collaborative document.

UI:

- The design of the app is the same as /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx, with overall the same colors, styles and design. The design should be clear, simple and modern. Use the same styles of buttons and sidebar as /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx
- The main area of the app is taken by a Tiptap editor like the one in /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx, this Tiptap editor is not inside a box, instead it occupies the entire page. There is also a right-side sidebar and the top menu. The editor has the StarterKit extension with all the typical Tiptap elements. Likewise, the top menu buttons let you set all these elements and styles supported by the Starterkit extension. The initial content of the editor is the same as in the /Users/arnaugomez/dev2/zurich-js-workshop/exercises/ai-suggestions-document-diff demo. There is a button on the top menu to reset the chat content. The right sidebar contains the chat (exact same UI as the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo), the tracked changes/comments, and the improvement suggestions functionality from the /Users/arnaugomez/dev2/zurich-js-workshop/exercises/ai-suggestions-document-diff demo, and the supporting documents from the /Users/arnaugomez/dev2/zurich-js-workshop/exercises/configure-mention-extension demo. Each of these is a different tab (copy the toggle menu button from the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo)

Features:

- Agentic editing like the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo, with tracked changes. Same features as the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo.
  - The AI agent is a Tiptap editor, this means it can mention supporting documents like in the /Users/arnaugomez/dev2/zurich-js-workshop/exercises/configure-mention-extension demo, these supporting documents are added to the prompt like. The AI also has extra custom tools to list and read the supporting documents, but it cannot edit them.
  - The AI model used for the agent is gpt-5.6-luna
- Tiptap collaboration like the /Users/arnaugomez/work/projects/ai-toolkit-demos/src/app/server-ai-tracked-changes/page.tsx demo but it is always the same collaborative document, not a different one every time you open the page
- Inline edits (AI rewrite), same UI and functionality as /Users/arnaugomez/dev2/zurich-js-workshop/exercises/ai-rewrite-mappable-positions. Model is gpt-5.4-nano
- Improvement suggestions, same UI and functionality as the /Users/arnaugomez/dev2/zurich-js-workshop/exercises/ai-suggestions-document-diff demo. Model is gpt-5.4-nano
- You can copy the .env variables file from /Users/arnaugomez/work/projects/ai-toolkit-demos file but do not read the .env files, never
- Do not add a title to the app yet. The app is just the editor, the right sidebar, and the top menu.

Build the app in /Users/arnaugomez/dev2/zurich-js-workshop/exercises/agentic-editor-app, this should be the root folder of the app, inside it there should be its own package.json.
