import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { clearEditorContent } from '../src/exercise/6-clear-content'

let editor: Editor

afterEach(() => editor?.destroy())

describe('clearEditorContent', () => {
  it('clears the document while preserving an empty paragraph', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Content to remove</p>' })

    expect(clearEditorContent(editor)).toBe(true)
    expect(editor.getJSON()).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
  })
})
