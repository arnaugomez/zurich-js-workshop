import type { ClassroomNote } from '../data/classroom-notes'

type NoteMentionListProps = {
  items: ClassroomNote[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function NoteMentionList({
  items,
  selectedIndex,
  onSelect,
}: NoteMentionListProps) {
  if (items.length === 0) {
    return <div className="suggestion-empty">No matching notes</div>
  }

  return (
    <div className="suggestion-list">
      {items.map((note, index) => (
        <button
          type="button"
          className={`suggestion-item ${
            index === selectedIndex ? "is-selected" : ""
          }`}
          key={note.id}
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect(index)
          }}
        >
          <strong>{note.student}</strong>
          <span>{note.activity}</span>
        </button>
      ))}
    </div>
  )
}
