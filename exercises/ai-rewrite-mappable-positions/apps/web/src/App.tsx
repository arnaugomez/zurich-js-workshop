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
import { rewriteTasks } from './aiApi'
import type { RewriteTask } from './aiApi'

export function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <header>
          <p className="eyebrow">Tiptap async rewrite exercise</p>
          <h1>Rewrite selected text without losing the range</h1>
        </header>

        <RewriteEditor />
      </section>
    </main>
  )
}

function RewriteEditor() {
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRequest = useRef<RewriteRequest | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content:
      '<p>Select part of this paragraph and choose an AI task. Then keep typing while it generates a response.</p>',
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

  async function handleRewrite(task: RewriteTask) {
    if (!editor || editor.state.selection.empty) {
      return
    }

    const { from, to } = editor.state.selection
    const request = requestAiRewrite(task, editor, { from, to })
    pendingRequest.current = request
    setIsThinking(true)

    try {
      await insertAiRewrite(editor, request)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not rewrite the selected text.',
      )
    } finally {
      if (pendingRequest.current === request) {
        pendingRequest.current = null
        setIsThinking(false)
      }
    }
  }

  return (
    <>
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
          <details className="rewrite-menu">
            <summary className="rewrite-button">
              {isThinking ? (
                <>
                  <span className="loading-spinner" aria-hidden="true" />
                  Working...
                </>
              ) : (
                'AI task'
              )}
            </summary>
            <div className="rewrite-menu-options">
              {rewriteTasks.map(task => (
                <button
                  key={task}
                  type="button"
                  disabled={isThinking}
                  onClick={() => {
                    setError(null)
                    void handleRewrite(task)
                  }}
                >
                  {task}
                </button>
              ))}
            </div>
          </details>
        </BubbleMenu>
      ) : null}

      <EditorContent editor={editor} className="editor-frame" />
      {error ? <p className="request-error" role="alert">{error}</p> : null}
    </>
  )
}
