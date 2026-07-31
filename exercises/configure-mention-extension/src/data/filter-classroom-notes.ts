import type { ClassroomNote } from "./classroom-notes";

export const searchableText = (note: ClassroomNote) =>
  [
    note.student,
    note.name,
    note.activity,
    note.skillArea,
    note.supportLevel,
    note.summary,
  ]
    .join(" ")
    .toLowerCase();

/**
 * Returns classroom notes from the supplied list that match a query.
 *
 * @param notes The classroom notes to filter
 * @param query The user-generated query
 * @returns Up to five matching notes
 */
export function filterClassroomNotes(
  notes: ClassroomNote[],
  query: string,
): ClassroomNote[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return notes.slice(0, 5);
  }

  return notes
    .filter((note) => searchableText(note).includes(normalizedQuery))
    .slice(0, 5);
}
