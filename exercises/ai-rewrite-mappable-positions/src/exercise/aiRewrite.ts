import type { MappablePosition } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/react'
import { fakeAiRewrite } from '../fakeAi'

export type MappableRewriteRange = {
  from: MappablePosition
  to: MappablePosition
}

export type RewriteRequest = {
  text: Promise<string>
  range: MappableRewriteRange
}

export function requestAiRewrite(
  editor: Editor,
  range: MappableRewriteRange,
): RewriteRequest {
  // TODO:
  // 1. Extract the selected text from editor.state.doc using range.from.position
  //    and range.to.position.
  // 2. Call fakeAiRewrite with the extracted text.
  // 3. Return the promise and the mappable range.
  throw new Error('Not implemented')
}

export function updateRewriteRange(
  editor: Editor,
  range: MappableRewriteRange,
  transaction: Transaction,
): MappableRewriteRange {
  // TODO: Use editor.utils.getUpdatedPosition for both endpoints.
  throw new Error('Not implemented')
}

export async function insertAiRewrite(
  editor: Editor,
  request: RewriteRequest,
): Promise<void> {
  // TODO:
  // 1. Await request.text.
  // 2. Read the latest numeric positions from request.range.
  // 3. Replace that equivalent range with the generated text.
  throw new Error('Not implemented')
}
