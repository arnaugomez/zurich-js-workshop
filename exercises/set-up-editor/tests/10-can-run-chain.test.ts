import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { canReplaceDocument } from '../src/exercise/10-can-run-chain'

let editor: Editor

afterEach(() => editor?.destroy())

describe('canReplaceDocument', () => {
  it('checks the complete replacement chain without changing the document', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Unchanged</p>' })

    expect(canReplaceDocument(editor, '<h2>Replacement</h2>')).toBe(true)
    expect(editor.getHTML()).toBe('<p>Unchanged</p>')
  })
})
