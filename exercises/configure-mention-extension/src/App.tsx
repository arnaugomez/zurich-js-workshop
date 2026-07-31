import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { classroomNotes } from './data/classroom-notes'
import { createMentionExtension } from './solution/createMentionExtension.solution'

export function App() {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit, createMentionExtension()],
    content:
      '<p>Draft evidence for the autonomy section. Type @marc, @garden, @break, or @sports.</p>',
  })

  return (
    <main className="app-shell">
      <section className="workspace">
        <header>
          <h1>Provide AI context with the Tiptap Mention extension</h1>
        </header>
        <EditorContent editor={editor} className="editor-frame" />
      </section>

      <aside className="notes-panel" aria-label="Example classroom notes">
        <h2>Example notes</h2>
        {classroomNotes.map(note => (
          <article key={note.id} className="note-card">
            <div>
              <strong>{note.student}</strong>
              <span>{note.date}</span>
            </div>
            <p>{note.summary}</p>
          </article>
        ))}
      </aside>
    </main>
  )
}
