import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleBlockquote(): boolean {
  return editor.commands.toggleBlockquote()
}
