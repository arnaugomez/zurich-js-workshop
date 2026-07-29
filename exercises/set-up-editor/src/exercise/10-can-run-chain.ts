import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleBlockquote(): boolean {
  // TODO: Toggle a blockquote with the Blockquote extension.
  throw new Error('Not implemented')
}
