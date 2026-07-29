import { afterEach, describe, expect, it } from 'vitest'
import { editor, toggleItalic } from '../src/exercise/6-clear-content'

afterEach(() => editor.destroy())

describe('toggleItalic', () => {
  it('toggles italic formatting on the current selection', () => {
    editor.commands.setContent('<p>Hello</p>')
    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(toggleItalic()).toBe(true)
    expect(editor.getHTML()).toBe('<p><em>Hello</em></p>')
  })
})
