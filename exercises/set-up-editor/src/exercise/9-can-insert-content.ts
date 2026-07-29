import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const editor = new Editor({ extensions: [StarterKit] })

export function canToggleBulletList(): boolean {
  // TODO: Check whether the BulletList extension can toggle a bullet list.
  throw new Error('Not implemented')
}
