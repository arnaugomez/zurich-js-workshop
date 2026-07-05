import type { JSONContent } from '@tiptap/core'
import { classroomNotes, type ClassroomNote } from '../data/classroom-notes'

export function findMentionedItems(document: JSONContent): ClassroomNote[] {
  const seenIds = new Set<string>()

  function visit(node: JSONContent) {
    if (node.type === 'mention') {
      const id = node.attrs?.id

      if (typeof id === 'string') {
        seenIds.add(id)
      }
    }

    for (const child of node.content ?? []) {
      visit(child)
    }
  }

  visit(document)

  return classroomNotes.filter(note => seenIds.has(note.id))
}
