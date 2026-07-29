import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleHeading(): boolean {
  return editor.commands.toggleHeading({ level: 2 })
}
