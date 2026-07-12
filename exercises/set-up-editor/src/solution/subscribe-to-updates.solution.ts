import type { Editor } from '@tiptap/core'

export type UpdateListener = (html: string) => void

export function subscribeToUpdates(
  editor: Editor,
  listener: UpdateListener,
): () => void {
  const handleUpdate = () => listener(editor.getHTML())

  editor.on('update', handleUpdate)

  return () => editor.off('update', handleUpdate)
}
