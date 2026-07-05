# Configure the Mention extension

This exercise is about configuring Tiptap's Mention extension with:

- A custom trigger character.
- An async classroom-note search function.
- Mentions that store a unique id and display name.
- Mention styling through CSS classes.

The app uses the solution so you can see the intended behavior:

```sh
pnpm install
pnpm dev
```

The exercise file is `src/exercise/createMentionExtension.ts`. The tests in `tests/createMentionEditor.test.ts` target its `createMentionExtension` function and start failing until you complete it.

The complete reference implementation is in `src/solution/createMentionExtension.solution.ts`.
