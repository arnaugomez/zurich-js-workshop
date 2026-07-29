import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { replaceSelection } from '../src/exercise/5-replace-selection'

let editor: Editor

afterEach(() => editor?.destroy())

describe('replaceSelection', () => {
  it('replaces the selected text and reports success', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Hello world</p>' })
    editor.commands.setTextSelection({ from: 7, to: 12 })

    expect(replaceSelection(editor, 'Tiptap')).toBe(true)
    expect(editor.getHTML()).toBe('<p>Hello Tiptap</p>')
  })
})
