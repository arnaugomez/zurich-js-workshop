import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleBold(): boolean {
  return editor.commands.toggleBold()
}
