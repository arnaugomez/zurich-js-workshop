import type { Content, Editor } from '@tiptap/core'

export function canReplaceDocument(editor: Editor, content: Content): boolean {
  return editor.can().chain().focus().clearContent().insertContent(content).run()
}
