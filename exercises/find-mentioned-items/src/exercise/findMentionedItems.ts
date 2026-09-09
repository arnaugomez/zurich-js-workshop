import type { JSONContent } from "@tiptap/core";
import { classroomNotes, type ClassroomNote } from "../data/classroom-notes";

export function findMentionedItems(document: JSONContent): ClassroomNote[] {
  // TODO: Walk through the Tiptap JSON document and return a list of all the
  // classroom notes in `classroomNotes` that are mentioned in the document, 
  // without duplicates.

  throw new Error("Not implemented");
}
