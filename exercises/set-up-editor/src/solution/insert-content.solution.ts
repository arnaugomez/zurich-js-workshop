import type { Content, Editor } from '@tiptap/core'

export function insertEditorContent(editor: Editor, content: Content): boolean {
  return editor.commands.insertContent(content)
}
