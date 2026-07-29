import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleItalic(): boolean {
  return editor.commands.toggleItalic()
}
