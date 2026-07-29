import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { canInsertEditorContent } from '../src/exercise/9-can-insert-content'

let editor: Editor

afterEach(() => editor?.destroy())

describe('canInsertEditorContent', () => {
  it('checks insertability without changing the document', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Unchanged</p>' })

    expect(canInsertEditorContent(editor, '<strong>content</strong>')).toBe(true)
    expect(editor.getHTML()).toBe('<p>Unchanged</p>')
  })
})
