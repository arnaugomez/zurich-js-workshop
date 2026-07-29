import type { Editor } from '@tiptap/core'

export type SelectionListener = (selection: { from: number; to: number }) => void

export function subscribeToSelectionUpdates(
  editor: Editor,
  listener: SelectionListener,
): () => void {
  // TODO: Listen for selectionUpdate events and return an unsubscribe function.
  throw new Error('Not implemented')
}
