import type { Editor } from '@tiptap/core'

export type SelectionListener = (selection: { from: number; to: number }) => void

export function subscribeToSelectionUpdates(
  editor: Editor,
  listener: SelectionListener,
): () => void {
  const handleSelectionUpdate = () => {
    const { from, to } = editor.state.selection
    listener({ from, to })
  }

  editor.on('selectionUpdate', handleSelectionUpdate)

  return () => editor.off('selectionUpdate', handleSelectionUpdate)
}
