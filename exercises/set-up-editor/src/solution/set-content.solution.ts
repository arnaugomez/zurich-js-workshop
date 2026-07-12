import type { Content, Editor } from '@tiptap/core'

export function setEditorContent(editor: Editor, content: Content): boolean {
  return editor.commands.setContent(content)
}
