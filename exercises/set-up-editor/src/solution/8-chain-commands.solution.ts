import type { Content, Editor } from '@tiptap/core'

export function replaceDocumentWithChain(
  editor: Editor,
  content: Content,
): boolean {
  return editor.chain().focus().clearContent().insertContent(content).run()
}
