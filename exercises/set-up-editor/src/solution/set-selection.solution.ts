import type { Editor } from '@tiptap/core'

export function moveCursor(editor: Editor, position: number): boolean {
  return editor.commands.setTextSelection(position)
}
