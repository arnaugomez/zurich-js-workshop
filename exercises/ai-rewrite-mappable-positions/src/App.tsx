import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { useRef, useState } from 'react'
import {
  insertAiRewrite,
  requestAiRewrite,
  updateRewriteRange,
} from './solution/aiRewrite.solution'
import type { RewriteRequest } from './solution/aiRewrite.solution'

export function App() {
  const [isThinking, setIsThinking] = useState(false)
  const pendingRequest = useRef<RewriteRequest | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content:
      '<p>Select part of this paragraph and ask the fake AI endpoint to rewrite it. Then keep typing before the rewrite finishes.</p>',
    onTransaction: ({ editor: currentEditor, transaction }) => {
      if (pendingRequest.current) {
        pendingRequest.current.range = updateRewriteRange(
          currentEditor,
          pendingRequest.current.range,
          transaction,
        )
      }
    },
  })

  async function handleRewrite() {
    if (!editor || editor.state.selection.empty) {
      return
    }

    const { from, to } = editor.state.selection
    const request = requestAiRewrite(editor, {
      from: editor.utils.createMappablePosition(from),
      to: editor.utils.createMappablePosition(to),
    })
    pendingRequest.current = request
    setIsThinking(true)

    await insertAiRewrite(editor, request)

    if (pendingRequest.current === request) {
      pendingRequest.current = null
      setIsThinking(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header>
          <p className="eyebrow">Tiptap async rewrite exercise</p>
          <h1>Rewrite selected text without losing the range</h1>
        </header>

        {editor ? (
          <BubbleMenu
            editor={editor}
            updateDelay={0}
            shouldShow={({ state }) => !state.selection.empty}
            options={{
              placement: 'top',
              offset: 8,
              flip: true,
              shift: true,
              inline: true,
            }}
          >
            <button
              className="rewrite-button"
              type="button"
              onClick={handleRewrite}
              disabled={isThinking}
            >
              {isThinking ? 'Rewriting...' : 'Rewrite with AI'}
            </button>
          </BubbleMenu>
        ) : null}

        <EditorContent editor={editor} className="editor-frame" />
      </section>
    </main>
  )
}
