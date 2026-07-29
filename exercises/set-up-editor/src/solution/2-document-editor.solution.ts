import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export function createDocumentEditor(): Editor {
  return new Editor({
    extensions: [StarterKit],
    content: '<p>Hello Zurich JS</p>',
  })
}
