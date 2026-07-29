import type { Editor } from '@tiptap/core'

export function clearEditorContent(editor: Editor): boolean {
  return editor.commands.clearContent()
}
