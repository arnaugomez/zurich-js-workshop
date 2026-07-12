import type { Editor } from '@tiptap/core'

export function replaceSelection(editor: Editor, text: string): boolean {
  return editor.commands.insertContent(text)
}
