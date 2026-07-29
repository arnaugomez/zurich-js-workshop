import { Editor } from '@tiptap/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createDocumentEditor } from '../src/exercise/2-document-editor'

let editor: Editor | undefined

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

describe('document editor', () => {
  it('supports paragraphs and text', () => {
    editor = createDocumentEditor()

    expect(editor.schema.nodes.doc).toBeDefined()
    expect(editor.schema.nodes.paragraph).toBeDefined()
    expect(editor.schema.nodes.text).toBeDefined()
    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello Zurich JS' }],
        },
      ],
    })
  })

  it('supports basic text formatting', () => {
    editor = createDocumentEditor()

    expect(editor.schema.marks.bold).toBeDefined()
    expect(editor.schema.marks.italic).toBeDefined()
    expect(editor.schema.marks.strike).toBeDefined()
  })

  it('supports headings, lists, and horizontal separators', () => {
    editor = createDocumentEditor()

    expect(editor.schema.nodes.heading).toBeDefined()
    expect(editor.schema.nodes.bulletList).toBeDefined()
    expect(editor.schema.nodes.orderedList).toBeDefined()
    expect(editor.schema.nodes.listItem).toBeDefined()
    expect(editor.schema.nodes.horizontalRule).toBeDefined()
  })
})
