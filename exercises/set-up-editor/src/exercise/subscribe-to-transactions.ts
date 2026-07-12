import type { Editor, EditorEvents } from '@tiptap/core'

export type TransactionListener = (
  transaction: EditorEvents['transaction']['transaction'],
) => void

export function subscribeToTransactions(
  editor: Editor,
  listener: TransactionListener,
): () => void {
  // TODO: Listen for transaction events and return an unsubscribe function.
  throw new Error('Not implemented')
}
