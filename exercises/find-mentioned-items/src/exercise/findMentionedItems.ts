import type { JSONContent } from "@tiptap/core";
import { classroomNotes, type ClassroomNote } from "../data/classroom-notes";

export function findMentionedItems(document: JSONContent): ClassroomNote[] {
  console.log(classroomNotes);
  // TODO: Walk through the Tiptap JSON document and return a list of all the
  // classroom notes referenced by Mention nodes, without duplicates.
  throw new Error("Not implemented");
}
