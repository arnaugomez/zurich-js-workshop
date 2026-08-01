import type { DocumentNode, JoinedChange } from '../types.js'

export function buildSuggestionsPrompt(
  document: DocumentNode,
  changes: JoinedChange[],
): string {
  // TODO: Build a prompt asking for short, constructive questions that help a
  // special-needs teacher improve an end-of-course report. Include the current
  // document and compact changes, and ask for 3 to 5 respectful questions.
  throw new Error('Not implemented')
}

export function buildInitialSuggestionsPrompt(document: DocumentNode): string {
  // TODO: Build a prompt for the initial review, when no paragraph-level
  // changes exist yet. Include the entire current document and require the
  // same short, respectful question response as the change prompt.
  throw new Error('Not implemented')
}
