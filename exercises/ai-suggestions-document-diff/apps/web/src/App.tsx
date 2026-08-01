import type { Editor, JSONContent } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { requestSuggestions } from './aiApi'
import { getEditorDocument } from './solution/getEditorDocument.solution'

const initialReport = `
  <h1>Student progress report</h1>
  <p><strong>Student:</strong> Alex R. &nbsp; <strong>Term:</strong> Spring</p>
  <h2>Learning and participation</h2>
  <p>Alex participates enthusiastically in practical classroom activities and responds especially well to visual schedules, clear language, and tasks with a visible end point. This term, Alex has become more confident when choosing between two activities and can remain focused on an individual task for up to fifteen minutes with occasional verbal support. In familiar lessons, Alex now collects the materials shown on the task card and begins work without waiting for an adult prompt.</p>
  <p>During literacy sessions, Alex enjoys matching key words to photographs and contributing ideas for shared stories. When a text contains unfamiliar vocabulary, Alex benefits from seeing an example and having extra time to process the question. In mathematics, Alex is most engaged when concepts are connected to everyday activities such as shopping, cooking, or reading a timetable. Alex can count out the correct number of items reliably and is beginning to use a written checklist to check each stage of a problem.</p>
  <h2>Communication and social development</h2>
  <p>Alex uses short spoken phrases and a communication board to express needs, preferences, and feelings. Over the past term, Alex has started to ask for help before leaving a difficult task and is increasingly able to explain whether the room is too noisy or an instruction is unclear. Direct questions are answered confidently, while open questions still require thinking time and a prompt to identify the most important detail.</p>
  <p>During small-group activities, Alex is beginning to wait for a turn, greet classmates independently, and share materials with one familiar peer. Alex often notices when another student needs help and will bring this to an adult's attention. Changes to the agreed order of a game can still cause frustration, but a brief explanation and two clear options usually help Alex rejoin the activity. Continued modelling will support Alex in initiating conversations and working with less familiar classmates.</p>
  <h2>Independence and wellbeing</h2>
  <p>Alex follows the morning routine with growing independence, checking the visual timetable, putting personal belongings away, and preparing the first activity. At lunchtime, Alex manages hand-washing and clearing away without reminders. Packing at the end of the day is less consistent when the classroom is busy, although a simple checklist helps Alex notice missing items before leaving.</p>
  <p>Alex has developed useful strategies for managing periods of sensory overload. With a reminder, Alex can choose headphones, request a short movement break, or move to the quieter work table. On several occasions this term, Alex identified the need for a break independently and returned to the group when ready. Unexpected timetable changes remain difficult, particularly when a preferred activity is cancelled, so advance notice and a clear replacement plan continue to be important.</p>
  <h2>Next steps</h2>
  <ul>
    <li>Practise asking for clarification when an instruction has more than one step.</li>
    <li>Build independence by following a three-step visual routine in a less familiar setting.</li>
    <li>Rehearse language for joining a group and suggesting an idea to a classmate.</li>
    <li>Use positive, specific feedback to reinforce self-advocacy and peer interaction.</li>
  </ul>
  <p>Alex has made steady progress and should feel proud of the growing independence shown this term. The strongest gains have come when expectations are explicit and Alex has enough time to put familiar strategies into practice. Maintaining consistent visual supports while gradually reducing adult prompts will help Alex transfer these skills to new people, activities, and environments.</p>
`

export function App() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestNumber = useRef(0)
  const previousDocument = useRef<JSONContent | null>(null)
  const pendingBaseline = useRef<JSONContent | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: initialReport,
    editorProps: {
      attributes: {
        'aria-label': 'Student progress report editor',
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      const document = getEditorDocument(currentEditor)
      previousDocument.current = document
      const currentRequest = ++requestNumber.current
      setIsLoading(true)

      void requestSuggestions(document, document)
        .then(nextSuggestions => {
          if (currentRequest === requestNumber.current) setSuggestions(nextSuggestions)
        })
        .catch(requestError => {
          if (currentRequest === requestNumber.current) {
            setError(requestError instanceof Error ? requestError.message : 'Could not generate suggestions.')
          }
        })
        .finally(() => {
          if (currentRequest === requestNumber.current) setIsLoading(false)
        })
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      setIsLoading(true)
      setError(null)
      const currentRequest = ++requestNumber.current
      const nextDocument = getEditorDocument(currentEditor)
      const baselineDocument = pendingBaseline.current ?? previousDocument.current ?? nextDocument
      pendingBaseline.current = baselineDocument
      previousDocument.current = nextDocument

      debounceTimer.current = setTimeout(async () => {
        pendingBaseline.current = null
        try {
          const nextSuggestions = await requestSuggestions(baselineDocument, nextDocument)
          if (currentRequest === requestNumber.current) setSuggestions(nextSuggestions)
        } catch (requestError) {
          if (currentRequest === requestNumber.current) {
            setError(requestError instanceof Error ? requestError.message : 'Could not generate suggestions.')
          }
        } finally {
          if (currentRequest === requestNumber.current) setIsLoading(false)
        }
      }, 2_000)
    },
  })

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
  }, [])

  const isInitialLoading = isLoading && suggestions.length === 0

  return (
    <div className="app-shell">
      <main className="document-workspace">
        <header className="topbar">
          <h1 className="app-title">AI-generated improvement suggestions</h1>
          {editor ? <EditorToolbar editor={editor} /> : null}
        </header>

        <div className="editor-scroll-area">
          <EditorContent editor={editor} className="editor-content" />
        </div>
      </main>

      <aside className="suggestions-panel" aria-labelledby="suggestions-title" aria-busy={isLoading}>
        <div className="suggestions-heading">
          <div>
            <p className="eyebrow">Writing support</p>
            <h2 id="suggestions-title">Improvement suggestions</h2>
          </div>
          {isLoading && suggestions.length > 0 ? (
            <span className="loading-spinner loading-spinner-small" aria-label="Refreshing suggestions" />
          ) : null}
        </div>

        <div className="suggestions-content">
          {error ? <p className="request-error" role="alert">{error}</p> : null}

          {isInitialLoading ? (
            <div className="initial-loading" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              <p>Reviewing the report…</p>
              <span>Suggestions will appear here shortly.</span>
            </div>
          ) : (
            <ul className="suggestion-list">
              {suggestions.map(suggestion => (
                <li key={suggestion}>
                  <LightBulbIcon />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}

function LightBulbIcon() {
  return (
    <svg className="suggestion-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18h6M10 22h4M8.7 15.3A7 7 0 1 1 15.3 15.3c-.8.6-1.3 1.4-1.3 2.2h-4c0-.8-.5-1.6-1.3-2.2Z" />
    </svg>
  )
}

type ToolbarButtonProps = {
  active?: boolean
  children: ReactNode
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
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canRedo: currentEditor.can().redo(),
      canUndo: currentEditor.can().undo(),
      isBold: currentEditor.isActive('bold'),
      isBulletList: currentEditor.isActive('bulletList'),
      isItalic: currentEditor.isActive('italic'),
      isOrderedList: currentEditor.isActive('orderedList'),
      isParagraph: currentEditor.isActive('paragraph'),
      heading: {
        1: currentEditor.isActive('heading', { level: 1 }),
        2: currentEditor.isActive('heading', { level: 2 }),
      },
    }),
  })
  const run = () => editor.chain().focus()

  return (
    <nav className="editor-toolbar" aria-label="Text formatting">
      <div className="toolbar-group">
        <ToolbarButton
          active={toolbarState.isParagraph}
          onClick={() => run().setParagraph().run()}
        >
          Paragraph
        </ToolbarButton>
        {([1, 2] as const).map(level => (
          <ToolbarButton
            active={toolbarState.heading[level]}
            key={level}
            label={`Heading ${level}`}
            onClick={() => run().toggleHeading({ level }).run()}
          >
            H{level}
          </ToolbarButton>
        ))}
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-group">
        <ToolbarButton active={toolbarState.isBold} onClick={() => run().toggleBold().run()}>
          Bold
        </ToolbarButton>
        <ToolbarButton active={toolbarState.isItalic} onClick={() => run().toggleItalic().run()}>
          Italic
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-group">
        <ToolbarButton active={toolbarState.isBulletList} onClick={() => run().toggleBulletList().run()}>
          Bullets
        </ToolbarButton>
        <ToolbarButton active={toolbarState.isOrderedList} onClick={() => run().toggleOrderedList().run()}>
          Numbered
        </ToolbarButton>
      </div>

      <div className="toolbar-divider" aria-hidden="true" />

      <div className="toolbar-group">
        <ToolbarButton disabled={!toolbarState.canUndo} onClick={() => run().undo().run()}>
          Undo
        </ToolbarButton>
        <ToolbarButton disabled={!toolbarState.canRedo} onClick={() => run().redo().run()}>
          Redo
        </ToolbarButton>
      </div>
    </nav>
  )
}
