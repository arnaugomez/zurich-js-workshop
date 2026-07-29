import type { Editor } from '@tiptap/core'

export function subscribeToDestroy(editor: Editor, listener: () => void): () => void {
  const handleDestroy = () => listener()

  editor.on('destroy', handleDestroy)

  return () => editor.off('destroy', handleDestroy)
}
