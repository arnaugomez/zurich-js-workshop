import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { ClassroomNote } from '../data/classroom-notes'

type NoteMentionListProps = {
  items: ClassroomNote[]
  command: (note: ClassroomNote) => void
}

export type NoteMentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const NoteMentionList = forwardRef<NoteMentionListRef, NoteMentionListProps>(
  function NoteMentionList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    const selectItem = (index: number) => {
      const item = items[index]

      if (item) {
        command(item)
      }
    }

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (items.length === 0) {
          return false
        }

        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }

        return false
      },
    }))

    if (items.length === 0) {
      return <div className="suggestion-empty">No matching notes</div>
    }

    return (
      <div className="suggestion-list">
        {items.map((note, index) => (
          <button
            type="button"
            className={`suggestion-item ${
              index === selectedIndex ? 'is-selected' : ''
            }`}
            key={note.id}
            onMouseDown={event => {
              event.preventDefault()
              selectItem(index)
            }}
          >
            <strong>{note.student}</strong>
            <span>{note.activity}</span>
          </button>
        ))}
      </div>
    )
  },
)
