import { Editor } from '@tiptap/core'

export function createDocumentEditor() {
  return new Editor({
    extensions: [
      // TODO: Add the Tiptap extensions needed for a document editor.
    ],
    content: '<p>Hello Zurich JS</p>',
  })
}
