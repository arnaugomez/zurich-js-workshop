import type { Content, Editor } from '@tiptap/core'

export function canInsertEditorContent(editor: Editor, content: Content): boolean {
  // TODO: Check whether insertContent can run without changing the editor.
  throw new Error('Not implemented')
}
