import type { JSONContent } from '@tiptap/core'
import type { Editor } from '@tiptap/react'

export function getEditorDocument(editor: Editor): JSONContent {
  // TODO: Return the editor's current content as Tiptap JSON.
  // Do not use getHTML() or getText(): the server needs the document structure
  // so that it can compare top-level paragraphs.
  throw new Error('Not implemented')
}
