import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { subscribeToUpdates } from '../src/exercise/11-subscribe-to-updates'

let editor: Editor

afterEach(() => editor?.destroy())

describe('subscribeToUpdates', () => {
  it('reports updated HTML and stops after unsubscribe', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Before</p>' })
    const listener = vi.fn()
    const unsubscribe = subscribeToUpdates(editor, listener)

    editor.commands.setContent('<p>After</p>')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenLastCalledWith('<p>After</p>')

    unsubscribe()
    editor.commands.setContent('<p>Ignored</p>')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
