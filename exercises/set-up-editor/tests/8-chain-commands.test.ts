import { afterEach, describe, expect, it } from 'vitest'
import { editor, toggleHeading } from '../src/exercise/8-chain-commands'

afterEach(() => editor.destroy())

describe('toggleHeading', () => {
  it('toggles a level 2 heading for the current block', () => {
    editor.commands.setContent('<p>Heading</p>')

    expect(toggleHeading()).toBe(true)
    expect(editor.getHTML()).toBe('<h2>Heading</h2>')
  })
})
