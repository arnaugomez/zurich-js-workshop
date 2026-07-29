import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

export function createChatbotEditor(): Editor {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content: '<p>Hello chatbot</p>',
  })
}
