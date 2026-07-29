import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function toggleHeading(): boolean {
  // TODO: Toggle a level 2 heading with the Heading extension.
  throw new Error('Not implemented')
}
