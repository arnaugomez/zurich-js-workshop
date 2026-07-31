import { classroomNotes, type ClassroomNote } from "./classroom-notes";
import { filterClassroomNotes } from "./filter-classroom-notes";

export { searchableText } from "./filter-classroom-notes";

/**
 * Mock function that returns classroom notes
 *
 * @param query The user-generated query
 * @returns The results that match the query
 */
export async function searchClassroomNotes(
  query: string,
): Promise<ClassroomNote[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return filterClassroomNotes(classroomNotes, query);
}
