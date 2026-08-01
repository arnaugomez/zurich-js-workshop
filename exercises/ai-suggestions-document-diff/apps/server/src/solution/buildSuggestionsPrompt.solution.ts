import type { DocumentNode, JoinedChange } from "../types.js";

export function buildSuggestionsPrompt(
  document: DocumentNode,
  changes: JoinedChange[],
): string {
  return `You support a special-needs education teacher writing an end-of-course student report.
Review the current report, paying particular attention to the paragraph-level edits. Suggest specific ways to improve the report or useful evidence the teacher could add. Never invent facts, diagnoses, activities, or progress.

Phrase every suggestion as a short, respectful question. Provide 3 suggestions.

<recent_changes>${JSON.stringify(changes)}</recent_changes>`;
}
// Or, if you'd like to provide AI with context about the current document plus the recent changes:
// <current_document>${JSON.stringify(document)}</current_document>
// <recent_changes>${JSON.stringify(changes)}</recent_changes>`;

export function buildInitialSuggestionsPrompt(document: DocumentNode): string {
  return `You support a special-needs education teacher writing an end-of-course student report.
Review the entire current report and suggest specific ways to improve it or useful evidence the teacher could add. Never invent facts, diagnoses, activities, or progress.

Phrase every suggestion as a short, respectful question. Provide 3 suggestions.

<current_document>${JSON.stringify(document)}</current_document>`;
}
