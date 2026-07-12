# Set up a Tiptap editor

This exercise package contains standalone Tiptap exercises. The editor setup
exercises are verified by Vitest; the command and event exercises are small
functions intended for discussion and experimentation.

## Run the exercises

```sh
pnpm install
pnpm test
```

## Exercises

- `src/document-editor.ts`: configure a document editor that supports text, paragraphs, basic formatting, lists, headings, and horizontal separators.
- `src/chatbot-editor.ts`: configure a plain chatbot editor that supports only text and paragraphs.
- `src/exercise/set-content.ts`: replace the complete document with content.
- `src/exercise/insert-content.ts`: insert content at the current selection.
- `src/exercise/replace-selection.ts`: replace the selected content with text.
- `src/exercise/clear-content.ts`: clear the editor while keeping a valid empty document.
- `src/exercise/set-selection.ts`: move the text selection to a document position.
- `src/exercise/chain-commands.ts`: focus, clear, and insert content in one command chain.
- `src/exercise/can-insert-content.ts`: check whether content can be inserted without changing the editor.
- `src/exercise/can-run-chain.ts`: tentatively check a complete command chain with `.can()`.
- `src/exercise/subscribe-to-updates.ts`: subscribe to content updates and return an unsubscribe function.
- `src/exercise/subscribe-to-selection-updates.ts`: subscribe to selection changes and return an unsubscribe function.
- `src/exercise/subscribe-to-transactions.ts`: observe transactions and return an unsubscribe function.
- `src/exercise/subscribe-to-destroy.ts`: observe editor destruction and return an unsubscribe function.

Completed versions live in the matching `src/solution/` files.

The tests in `tests/` describe the expected behavior.
