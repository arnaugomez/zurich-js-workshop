import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { subscribeToTransactions } from '../src/exercise/13-subscribe-to-transactions'

let editor: Editor

afterEach(() => editor?.destroy())

describe('subscribeToTransactions', () => {
  it('reports transactions and stops after unsubscribe', () => {
    editor = new Editor({ extensions: [StarterKit], content: '<p>Before</p>' })
    const listener = vi.fn()
    const unsubscribe = subscribeToTransactions(editor, listener)

    editor.commands.setContent('<p>After</p>')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].doc.textContent).toBe('After')

    unsubscribe()
    editor.commands.setContent('<p>Ignored</p>')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
