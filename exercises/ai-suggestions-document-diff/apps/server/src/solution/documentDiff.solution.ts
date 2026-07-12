import type { DiffChange, DocumentNode, JoinedChange } from '../types.js'

export function getDocumentNodes(document: DocumentNode): DocumentNode[] {
  // A Tiptap document is a ProseMirror `doc` node. Its direct children are the
  // block-level units users perceive as paragraphs, headings, or lists.
  return document.content ?? []
}

function stableValue(value: unknown): unknown {
  // JSON object key order is not semantically meaningful. Sorting keys gives
  // us a canonical value while retaining array order, which *is* meaningful
  // for document content and marks.
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableValue(nested)]),
    )
  }
  return value
}

export function nodesEqual(left: DocumentNode, right: DocumentNode): boolean {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
}

type Point = { x: number; y: number }

export function diffNodes(
  before: DocumentNode[],
  after: DocumentNode[],
): DiffChange[] {
  // Myers searches an edit graph. Moving right deletes from `before`, moving
  // down adds from `after`, and moving diagonally consumes equal nodes for free.
  const maximumDepth = before.length + after.length
  // Each trace entry stores the furthest x coordinate reached for every
  // diagonal k = x - y. Keeping these snapshots lets us reconstruct the path.
  const trace: Array<Map<number, number>> = []
  let frontier = new Map<number, number>([[1, 0]])

  for (let depth = 0; depth <= maximumDepth; depth += 1) {
    trace.push(new Map(frontier))

    for (let diagonal = -depth; diagonal <= depth; diagonal += 2) {
      // At the graph edges only one move is possible. Else choose the move
      // whose previous path reached furthest right, as required by Myers.
      const goesDown =
        diagonal === -depth ||
        (diagonal !== depth &&
          (frontier.get(diagonal - 1) ?? -1) <
            (frontier.get(diagonal + 1) ?? -1))
      let x = goesDown
        ? (frontier.get(diagonal + 1) ?? 0)
        : (frontier.get(diagonal - 1) ?? 0) + 1
      let y = x - diagonal

      // Follow the diagonal (the "snake") while whole nodes match. These
      // paragraphs are unchanged and therefore never appear in the result.
      while (
        x < before.length &&
        y < after.length &&
        nodesEqual(before[x], after[y])
      ) {
        x += 1
        y += 1
      }

      frontier.set(diagonal, x)
      if (x >= before.length && y >= after.length) {
        return backtrack(trace, before, after, { x, y })
      }
    }
  }

  return []
}

function backtrack(
  trace: Array<Map<number, number>>,
  before: DocumentNode[],
  after: DocumentNode[],
  end: Point,
): DiffChange[] {
  const reversed: DiffChange[] = []
  let { x, y } = end

  // Walk the saved frontiers backwards. Equal diagonal steps are skipped;
  // horizontal and vertical steps become deletions and additions respectively.
  for (let depth = trace.length - 1; depth > 0; depth -= 1) {
    const frontier = trace[depth]
    const diagonal = x - y
    const goesDown =
      diagonal === -depth ||
      (diagonal !== depth &&
        (frontier.get(diagonal - 1) ?? -1) <
          (frontier.get(diagonal + 1) ?? -1))
    const previousDiagonal = goesDown ? diagonal + 1 : diagonal - 1
    const previousX = frontier.get(previousDiagonal) ?? 0
    const previousY = previousX - previousDiagonal

    while (x > previousX && y > previousY) {
      x -= 1
      y -= 1
    }

    if (goesDown) {
      y -= 1
      reversed.push({ type: 'add', node: after[y] })
    } else {
      x -= 1
      reversed.push({ type: 'delete', node: before[x] })
    }
  }

  return reversed.reverse()
}

export function joinAdjacentChanges(changes: DiffChange[]): JoinedChange[] {
  if (changes.length === 0) return []

  // `diffNodes` omits equal nodes, so its output alone cannot identify a gap
  // between edit runs. Myers emits one contiguous edit script here; collect it
  // into the replacement shape the prompt builder needs.
  const joined: JoinedChange = { deleted: [], added: [] }
  for (const change of changes) {
    if (change.type === 'delete') joined.deleted.push(change.node)
    else joined.added.push(change.node)
  }
  return [joined]
}
