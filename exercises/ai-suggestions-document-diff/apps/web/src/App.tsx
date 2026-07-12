import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { JSONContent } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import { requestSuggestions } from './aiApi'
import { getEditorDocument } from './solution/getEditorDocument.solution'

const initialReport = `
<h2>End-of-course report: Laia</h2>
<p>Throughout this school year, Laia has made steady progress in joining classroom routines and taking part in small-group activities. She arrives calmly on most mornings and increasingly checks the visual timetable before asking an adult what will happen next. When an activity is familiar and its steps are clearly presented, she begins with less prompting than she needed at the start of the year.</p>
<p>In communication, Laia expresses her basic needs verbally and uses the pictogram board when she finds it difficult to explain how she feels. During the second term, she began to request a break before becoming overwhelmed. At first she needed an adult reminder; in recent weeks she has done this independently on several occasions. She answers direct questions confidently, although she still needs time and support to share an experience with the whole group.</p>
<p>Laia enjoys practical activities, particularly cooking, work in the school garden, and visits to the sports centre. In the garden she can now collect the required materials, follow a three-step visual sequence, and put tools away when the activity finishes. She remains engaged for longer when she works alongside one familiar classmate. In larger groups, noise and waiting can make participation more difficult.</p>
<p>Her relationships with classmates have also developed. Laia often looks for Júlia when choosing a partner and has begun to accept working with other students when the pairing is explained in advance. She notices when a classmate is upset and sometimes offers them an object or calls an adult. She can become frustrated when another student changes the agreed order of a game, but responds well when an adult names what has happened and gives her two clear options.</p>
<p>Regarding personal autonomy, Laia follows the hand-washing and snack routines independently. She prepares her bag at the end of the day using a checklist, although she may miss an item when the classroom is busy. On community outings she stays with the group and recognizes the pedestrian crossing near school. She continues to need close adult support in unfamiliar streets and when plans change unexpectedly.</p>
<p>Next year, it will be helpful to continue practising how to ask for clarification, cope with short periods of waiting, and transfer familiar routines to new settings. Visual preparation, concise language, and opportunities to rehearse changes remain effective supports. Laia's growing ability to communicate discomfort and complete practical sequences gives her a strong basis for continuing to develop confidence and independence.</p>
`

const initialSuggestions = [
  'Which observation best shows how much prompting Laia needs now?',
  'Could you add an example of Laia working with a less familiar classmate?',
  'What support helps Laia recover when a plan changes unexpectedly?',
]

export function App() {
  const [suggestions, setSuggestions] = useState(initialSuggestions)
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
          const nextSuggestions = await requestSuggestions(
            baselineDocument,
            nextDocument,
          )
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Student progress report</p>
          <h1>Laia Ferrer</h1>
        </div>
        <span className="status">Draft</span>
      </header>

      <div className="workspace">
        <section className="document-panel" aria-label="Student report editor">
          <EditorContent editor={editor} className="editor-frame" />
        </section>

        <aside className="suggestions-panel" aria-labelledby="suggestions-title">
          <div className="suggestions-heading">
            <div>
              <p className="eyebrow">Writing support</p>
              <h2 id="suggestions-title">AI Suggestions</h2>
            </div>
            {isLoading ? <span className="loading-spinner" aria-label="Loading suggestions" /> : null}
          </div>

          {error ? <p className="request-error" role="alert">{error}</p> : null}
          <ol className={isLoading ? 'suggestion-list is-refreshing' : 'suggestion-list'}>
            {suggestions.map(suggestion => <li key={suggestion}>{suggestion}</li>)}
          </ol>
        </aside>
      </div>
    </main>
  )
}
