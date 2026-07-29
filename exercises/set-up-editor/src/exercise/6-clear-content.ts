import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleItalic(): boolean {
  // TODO: Toggle italic formatting with the Italic extension.
  throw new Error('Not implemented')
}
