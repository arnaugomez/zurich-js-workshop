import { classroomNotes, type ClassroomNote } from './classroom-notes'

const searchableText = (note: ClassroomNote) =>
  [
    note.student,
    note.name,
    note.activity,
    note.skillArea,
    note.supportLevel,
    note.summary,
  ]
    .join(' ')
    .toLowerCase()

export async function searchClassroomNotes(query: string): Promise<ClassroomNote[]> {
  const normalizedQuery = query.trim().toLowerCase()

  await new Promise(resolve => setTimeout(resolve, 40))

  if (!normalizedQuery) {
    return classroomNotes.slice(0, 5)
  }

  return classroomNotes
    .filter(note => searchableText(note).includes(normalizedQuery))
    .slice(0, 5)
}
