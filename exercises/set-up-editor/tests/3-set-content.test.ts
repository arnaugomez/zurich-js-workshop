import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { setEditorContent } from '../src/exercise/3-set-content'

let editor: Editor

afterEach(() => editor?.destroy())

describe('setEditorContent', () => {
  it('replaces the entire document and reports success', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Old content</p>' })

    expect(setEditorContent(editor, '<p>New content</p>')).toBe(true)
    expect(editor.getHTML()).toBe('<p>New content</p>')
  })
})
