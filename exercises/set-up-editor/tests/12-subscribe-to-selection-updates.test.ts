import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { subscribeToSelectionUpdates } from '../src/exercise/12-subscribe-to-selection-updates'

let editor: Editor

afterEach(() => editor?.destroy())

describe('subscribeToSelectionUpdates', () => {
  it('reports the current selection and stops after unsubscribe', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Hello world</p>' })
    const listener = vi.fn()
    const unsubscribe = subscribeToSelectionUpdates(editor, listener)

    editor.commands.setTextSelection({ from: 3, to: 7 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenLastCalledWith({ from: 3, to: 7 })

    unsubscribe()
    editor.commands.setTextSelection(9)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
