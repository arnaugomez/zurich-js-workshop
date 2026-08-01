import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Selection } from '@tiptap/extensions'
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

const initialContent = `
  <h1>Student progress report</h1>
  <p><strong>Student:</strong> Alex R. &nbsp; <strong>Term:</strong> Spring</p>
  <h2>Learning and participation</h2>
  <p>Alex participates enthusiastically in practical classroom activities and responds especially well to visual schedules and clear, one-step instructions. This term, Alex has become more confident when choosing between two activities and can remain focused on an individual task for up to fifteen minutes with occasional verbal support.</p>
  <h2>Communication and social development</h2>
  <p>Alex uses short spoken phrases and a communication board to express needs, preferences, and feelings. During small-group activities, Alex is beginning to wait for a turn and greet classmates independently. Continued modelling will help Alex initiate conversations in less familiar situations.</p>
  <h2>Next steps</h2>
  <ul>
    <li>Practise asking for help before leaving a task.</li>
    <li>Build independence by following a three-step visual routine.</li>
    <li>Use positive, specific feedback to reinforce peer interaction.</li>
  </ul>
  <p>Alex has made steady progress and should feel proud of the growing independence shown this term.</p>
`

export function App() {
  return (
    <main className="app-shell">
      <RewriteEditor />
    </main>
  )
}

function RewriteEditor() {
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRequest = useRef<RewriteRequest | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Selection],
    content: initialContent,
    editorProps: {
      attributes: {
        'aria-label': 'Student report editor',
      },
    },
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
    <section className="editor-workspace">
      <header className="app-header">
        <h1>AI Rewrite</h1>
      </header>

      {editor ? <EditorToolbar editor={editor} /> : null}

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
            <summary className="editor-button rewrite-button">
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
                  className="editor-button"
                  key={task}
                  type="button"
                  disabled={isThinking}
                  onClick={event => {
                    event.currentTarget.closest('details')?.removeAttribute('open')
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

      <div className="editor-scroll-area">
        <EditorContent editor={editor} className="editor-content" />
        {error ? <p className="request-error" role="alert">{error}</p> : null}
      </div>
    </section>
  )
}

type ToolbarButtonProps = {
  active?: boolean
  children: React.ReactNode
  disabled?: boolean
  label?: string
  onClick: () => void
}

function ToolbarButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`editor-button${active ? ' is-active' : ''}`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const run = () => editor.chain().focus()

  return (
    <nav className="editor-toolbar" aria-label="Text formatting">
      <div className="toolbar-group">
        <ToolbarButton
          active={editor.isActive('paragraph')}
          onClick={() => run().setParagraph().run()}
        >
          Paragraph
        </ToolbarButton>
        {[1, 2, 3].map(level => (
          <ToolbarButton
            active={editor.isActive('heading', { level })}
            key={level}
            label={`Heading ${level}`}
            onClick={() => run().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
          >
            H{level}
          </ToolbarButton>
        ))}
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-group">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => run().toggleBold().run()}>
          Bold
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => run().toggleItalic().run()}>
          Italic
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('strike')} onClick={() => run().toggleStrike().run()}>
          Strike
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('code')} onClick={() => run().toggleCode().run()}>
          Code
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-group">
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => run().toggleBulletList().run()}>
          Bullets
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => run().toggleOrderedList().run()}>
          Numbered
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('blockquote')} onClick={() => run().toggleBlockquote().run()}>
          Quote
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('codeBlock')} onClick={() => run().toggleCodeBlock().run()}>
          Code block
        </ToolbarButton>
        <ToolbarButton onClick={() => run().setHorizontalRule().run()}>
          Divider
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-group">
        <ToolbarButton disabled={!editor.can().undo()} onClick={() => run().undo().run()}>
          Undo
        </ToolbarButton>
        <ToolbarButton disabled={!editor.can().redo()} onClick={() => run().redo().run()}>
          Redo
        </ToolbarButton>
      </div>
    </nav>
  )
}
