import { afterEach, describe, expect, it } from 'vitest'
import { canToggleBulletList, editor } from '../src/exercise/9-can-insert-content'

afterEach(() => editor.destroy())

describe('canToggleBulletList', () => {
  it('checks whether a bullet list can be toggled without changing the document', () => {
    editor.commands.setContent('<p>Item</p>')

    expect(canToggleBulletList()).toBe(true)
    expect(editor.getHTML()).toBe('<p>Item</p>')
  })
})
