import type { DiffChange, DocumentNode, JoinedChange } from '../types.js'

export function getDocumentNodes(document: DocumentNode): DocumentNode[] {
  // TODO: Return only the direct children of the main `doc` node.
  throw new Error('Not implemented')
}

export function nodesEqual(left: DocumentNode, right: DocumentNode): boolean {
  // TODO: Compare two nodes deeply, including their type, attributes, marks,
  // text, and nested content. Attribute key order must not affect equality.
  throw new Error('Not implemented')
}

export function diffNodes(
  before: DocumentNode[],
  after: DocumentNode[],
): DiffChange[] {
  // TODO: Implement the Myers diff algorithm at node (normally paragraph)
  // granularity. Unchanged nodes are omitted. Return every edit as either
  // `{ type: 'delete', node }` or `{ type: 'add', node }`.
  throw new Error('Not implemented')
}

export function joinAdjacentChanges(changes: DiffChange[]): JoinedChange[] {
  // TODO: Group each uninterrupted run of additions and deletions into one
  // `{ deleted, added }` change. Preserve the order within both arrays.
  throw new Error('Not implemented')
}
