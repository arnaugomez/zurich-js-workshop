import type { Content, Editor } from '@tiptap/core'
import { describe, expect, it, vi } from 'vitest'
import { replaceDocumentWithChain } from '../src/exercise/8-chain-commands'

describe('replaceDocumentWithChain', () => {
  it('focuses, clears, inserts the replacement, and runs the chain', () => {
    const content: Content = '<p>Replacement</p>'
    const run = vi.fn(() => true)
    const insertContent = vi.fn(() => ({ run }))
    const clearContent = vi.fn(() => ({ insertContent }))
    const focus = vi.fn(() => ({ clearContent }))
    const editor = { chain: vi.fn(() => ({ focus })) } as unknown as Editor

    expect(replaceDocumentWithChain(editor, content)).toBe(true)
    expect(editor.chain).toHaveBeenCalledOnce()
    expect(focus).toHaveBeenCalledOnce()
    expect(clearContent).toHaveBeenCalledOnce()
    expect(insertContent).toHaveBeenCalledWith(content)
    expect(run).toHaveBeenCalledOnce()
  })
})
