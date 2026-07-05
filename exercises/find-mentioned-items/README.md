# Find mentioned items in a Tiptap document

This exercise is about reading a Tiptap JSON document and finding every node created by Tiptap's Mention extension.

Your task is to implement a function that:

- Receives a Tiptap JSON document.
- Walks through all nested `content` arrays.
- Finds nodes with `type: 'mention'`.
- Matches each mention id to the item with the same id in `src/data/classroom-notes.ts`.
- Returns the full classroom-note objects.
- Removes duplicate mentions by `id`.

## Run the exercises

```sh
pnpm install
pnpm test
```

The exercise file is `src/exercise/findMentionedItems.ts`. The tests in `tests/findMentionedItems.test.ts` describe the expected behavior.

The complete reference implementation is in `src/solution/findMentionedItems.solution.ts`.
