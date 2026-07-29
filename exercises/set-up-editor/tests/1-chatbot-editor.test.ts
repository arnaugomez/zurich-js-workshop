import { Editor } from '@tiptap/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createChatbotEditor } from '../src/exercise/1-chatbot-editor'

let editor: Editor | undefined

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

describe('chatbot editor', () => {
  it('supports only the plain text document structure needed for chat messages', () => {
    editor = createChatbotEditor()

    expect(editor.schema.nodes.doc).toBeDefined()
    expect(editor.schema.nodes.paragraph).toBeDefined()
    expect(editor.schema.nodes.text).toBeDefined()
    expect(editor.getText()).toBe('Hello chatbot')
  })

  it('does not include rich document features', () => {
    editor = createChatbotEditor()

    expect(editor.schema.marks.bold).toBeUndefined()
    expect(editor.schema.marks.italic).toBeUndefined()
    expect(editor.schema.marks.strike).toBeUndefined()
    expect(editor.schema.nodes.heading).toBeUndefined()
    expect(editor.schema.nodes.bulletList).toBeUndefined()
    expect(editor.schema.nodes.orderedList).toBeUndefined()
    expect(editor.schema.nodes.horizontalRule).toBeUndefined()
  })
})
