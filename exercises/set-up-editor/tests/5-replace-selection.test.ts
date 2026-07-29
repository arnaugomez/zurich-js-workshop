import { afterEach, describe, expect, it } from 'vitest'
import { editor, toggleBold } from '../src/exercise/5-replace-selection'

afterEach(() => editor.destroy())

describe('toggleBold', () => {
  it('toggles bold formatting on the current selection', () => {
    editor.commands.setContent('<p>Hello</p>')
    editor.commands.setTextSelection({ from: 1, to: 6 })

    expect(toggleBold()).toBe(true)
    expect(editor.getHTML()).toBe('<p><strong>Hello</strong></p>')
  })
})
