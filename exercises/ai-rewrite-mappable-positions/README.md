# AI rewrite with mappable positions

This exercise is about keeping a selected Tiptap range valid while async work is running.

The app has a Tiptap editor, a Bubble Menu, and a fake AI endpoint. Select text and click **Rewrite with AI** to request a rewrite. While the fake endpoint is waiting, the document may still change, so the original selection positions need to be mapped through later transactions before inserting the AI result.

Implement the three functions in `src/exercise/aiRewrite.ts`:

- `requestAiRewrite`: extract text from a range, create a pair of mappable positions, call the fake AI endpoint, and return both.
- `updateRewriteRange`: map the stored positions through a transaction.
- `insertAiRewrite`: resolve the mapped positions into the current equivalent range and replace that range with the AI result.

Run the exercise:

```sh
pnpm install
pnpm dev
```

Run the tests:

```sh
pnpm test
```

The app imports the complete reference implementation from `src/solution/aiRewrite.solution.ts`. The tests run against both the exercise and solution implementations.
