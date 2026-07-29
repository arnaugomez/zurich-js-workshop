import type { Editor } from '@tiptap/core'

export function subscribeToDestroy(editor: Editor, listener: () => void): () => void {
  // TODO: Listen for the destroy event and return an unsubscribe function.
  throw new Error('Not implemented')
}
