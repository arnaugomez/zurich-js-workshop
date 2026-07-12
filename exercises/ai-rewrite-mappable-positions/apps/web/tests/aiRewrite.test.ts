import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as exercise from '../src/exercise/aiRewrite'
import * as solution from '../src/solution/aiRewrite.solution'

vi.mock('../src/aiApi', () => ({
  requestAiRewrite: vi.fn(async (_task: string, text: string) =>
    `AI rewrite: ${text.trim().replace(/\s+/g, ' ')}`,
  ),
}))

type Implementation = typeof solution

let editor: Editor | undefined

afterEach(() => {
  editor?.destroy()
  editor = undefined
  vi.useRealTimers()
})

function createEditor(content = '<p>The first draft needs kinder wording.</p>') {
  editor = new Editor({
    extensions: [StarterKit],
    content,
  })

  return editor
}

describe.each([
  ['exercise', exercise],
  ['solution', solution],
] satisfies Array<[string, Implementation]>)(
  '%s AI rewrite helpers',
  (_name, implementation) => {
    it('extracts text from the requested range and creates mappable positions', async () => {
      const editor = createEditor()
      const from = 5
      const to = 16

      const request = implementation.requestAiRewrite(
        'rephrase',
        editor,
        { from, to },
      )

      expect(request.range.from.position).toBe(from)
      expect(request.range.to.position).toBe(to)

      await expect(request.text).resolves.toBe('AI rewrite: first draft')
    })

    it('maps both stored positions through a transaction', () => {
      const editor = createEditor()
      const request = implementation.requestAiRewrite(
        'rephrase',
        editor,
        { from: 5, to: 16 },
      )
      const transaction = editor.state.tr.insertText('careful ', 1)

      const updatedRange = implementation.updateRewriteRange(
        editor,
        request.range,
        transaction,
      )

      expect(updatedRange.from.position).toBe(13)
      expect(updatedRange.to.position).toBe(24)
    })

    it('inserts the AI rewrite into the mapped range after intervening edits', async () => {
      const editor = createEditor()
      const request = implementation.requestAiRewrite(
        'rephrase',
        editor,
        { from: 5, to: 16 },
      )

      let transaction = editor.state.tr.insertText('careful ', 1)
      request.range = implementation.updateRewriteRange(
        editor,
        request.range,
        transaction,
      )
      editor.view.dispatch(transaction)

      transaction = editor.state.tr.insertText(
        ' Please review.',
        editor.state.doc.content.size - 1,
      )
      request.range = implementation.updateRewriteRange(
        editor,
        request.range,
        transaction,
      )
      editor.view.dispatch(transaction)

      const insertion = implementation.insertAiRewrite(editor, request)
      await insertion

      expect(editor.getText()).toBe(
        'careful The AI rewrite: first draft needs kinder wording. Please review.',
      )
    })
  },
)
