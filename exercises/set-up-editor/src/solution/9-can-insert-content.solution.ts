import type { Content, Editor } from '@tiptap/core'

export function canInsertEditorContent(editor: Editor, content: Content): boolean {
  return editor.can().insertContent(content)
}
