import type { JSONContent } from '@tiptap/core'
import type { Editor } from '@tiptap/react'

export function getEditorDocument(editor: Editor): JSONContent {
  return editor.getJSON()
}
