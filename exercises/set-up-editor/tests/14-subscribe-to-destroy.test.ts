import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it, vi } from 'vitest'
import { subscribeToDestroy } from '../src/exercise/14-subscribe-to-destroy'

function createEditor() {
  return new Editor({ extensions: [StarterKit], content: '<p>Content</p>' })
}

describe('subscribeToDestroy', () => {
  it('reports when the editor is destroyed', () => {
    const editor = createEditor()
    const listener = vi.fn()
    subscribeToDestroy(editor, listener)

    editor.destroy()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does not report destruction after unsubscribe', () => {
    const editor = createEditor()
    const listener = vi.fn()
    const unsubscribe = subscribeToDestroy(editor, listener)

    unsubscribe()
    editor.destroy()
    expect(listener).not.toHaveBeenCalled()
  })
})
