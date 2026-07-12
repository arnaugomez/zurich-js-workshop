import type { Editor } from '@tiptap/core'

export type UpdateListener = (html: string) => void

export function subscribeToUpdates(
  editor: Editor,
  listener: UpdateListener,
): () => void {
  // TODO: Listen for update events and return a function that removes the listener.
  throw new Error('Not implemented')
}
