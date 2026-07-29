import type { Content, Editor } from '@tiptap/core'

export function canReplaceDocument(editor: Editor, content: Content): boolean {
  // TODO: Use .can().chain() to check the complete replacement chain.
  throw new Error('Not implemented')
}
