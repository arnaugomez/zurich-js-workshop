import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleBold(): boolean {
  // TODO: Toggle bold formatting with the Bold extension.
  throw new Error('Not implemented')
}
