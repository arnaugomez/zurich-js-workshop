import { afterEach, describe, expect, it } from 'vitest'
import { editor, toggleBlockquote } from '../src/exercise/10-can-run-chain'

afterEach(() => editor.destroy())

describe('toggleBlockquote', () => {
  it('toggles a blockquote for the current block', () => {
    editor.commands.setContent('<p>Quote</p>')

    expect(toggleBlockquote()).toBe(true)
    expect(editor.getHTML()).toBe('<blockquote><p>Quote</p></blockquote>')
  })
})
