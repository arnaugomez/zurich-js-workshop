import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import * as exercise from '../src/exercise/getEditorDocument'
import * as solution from '../src/solution/getEditorDocument.solution'

let editor: Editor | undefined

afterEach(() => editor?.destroy())

describe.each([
  ['exercise', exercise],
  ['solution', solution],
])('%s getEditorDocument', (_name, implementation) => {
  it('returns structured Tiptap JSON for the current editor content', () => {
    editor = new Editor({
      extensions: [StarterKit],
      content: '<h2>Communication</h2><p>Laia asks for a break.</p>',
    })

    expect(implementation.getEditorDocument(editor)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Communication' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Laia asks for a break.' }],
        },
      ],
    })
  })
})
