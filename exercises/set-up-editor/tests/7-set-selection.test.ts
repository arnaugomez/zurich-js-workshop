import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { moveCursor } from '../src/exercise/7-set-selection'

let editor: Editor

afterEach(() => editor?.destroy())

describe('moveCursor', () => {
  it('moves the text selection to the requested position', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Hello world</p>' })

    expect(moveCursor(editor, 7)).toBe(true)
    expect(editor.state.selection.from).toBe(7)
    expect(editor.state.selection.to).toBe(7)
  })
})
