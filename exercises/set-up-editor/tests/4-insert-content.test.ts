import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { insertEditorContent } from '../src/exercise/4-insert-content'

let editor: Editor

afterEach(() => editor?.destroy())

describe('insertEditorContent', () => {
  it('inserts content at the current selection', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Hello world</p>' })
    editor.commands.setTextSelection(7)

    expect(insertEditorContent(editor, 'Tiptap ')).toBe(true)
    expect(editor.getHTML()).toBe('<p>Hello Tiptap world</p>')
  })
})
