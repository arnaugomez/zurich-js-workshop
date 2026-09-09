import type { MappablePosition, Range } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { requestAiRewrite as requestAiRewriteFromServer } from "../aiApi";
import type { RewriteTask } from "../aiApi";

export type MappableRewriteRange = {
  from: MappablePosition;
  to: MappablePosition;
};

export type RewriteRequest = {
  text: Promise<string>;
  range: MappableRewriteRange;
};

export function requestAiRewrite(
  task: RewriteTask,
  editor: Editor,
  range: Range,
): RewriteRequest {
  // TODO:
  // 1. Extract the selected text from editor.state.doc using range.from
  //    and range.to.
  // 2. Call requestAiRewriteFromServer with the task and extracted text. This will return a promise.
  // 3. Create mappable positions for both range endpoints with
  //    editor.utils.createMappablePosition, then.
  // 4. Return the mappable range and the promise that returns the text.
  throw new Error("Not implemented");
}

export function updateRewriteRange(
  editor: Editor,
  range: MappableRewriteRange,
  transaction: Transaction,
): MappableRewriteRange {
  // TODO: Use editor.utils.getUpdatedPosition for both endpoints.
  throw new Error("Not implemented");
}

export async function insertAiRewrite(
  editor: Editor,
  request: RewriteRequest,
): Promise<void> {
  // TODO:
  // 1. Await request.text.
  // 2. Read the latest numeric positions from request.range.
  // 3. Replace that equivalent range with the generated text.
  // 4. In the same chain of commands that replaces the text,
  // set the editor selection to cover the replaced text.
  throw new Error("Not implemented");
}
