import { isDeepStrictEqual } from "node:util";
import type { DiffChange, DocumentNode, JoinedChange } from "../types.js";

export function nodesEqual(left: DocumentNode, right: DocumentNode): boolean {
  // TODO: Compare the two complete nodes using deep object equality. Object
  // key order must not affect equality; `isDeepStrictEqual` is imported for this.
  return false;
}

export function documentDiff(
  previousDocument: DocumentNode,
  currentDocument: DocumentNode,
): JoinedChange[] {
  // TODO: Get the direct children of each document. A document without
  // `content` has no children, so use an empty array in that case.
  const before: DocumentNode[] = [];
  const after: DocumentNode[] = [];

  // Myers searches an edit graph. Moving right deletes from `before`, moving
  // down adds from `after`, and moving diagonally consumes equal nodes for free.
  // TODO: set the maximum depth of the search tree.
  // Remember the graph we saw before?
  //       A   B   A   C   C
  //     +---+---+---+---+---+
  //   C |   |   |   | \ | \ |
  //     +---+---+---+---+---+
  //   B |   | \ |   |   |   |
  //     +---+---+---+---+---+
  //   A | \ |   | \ |   |   |
  //     +---+---+---+---+---+
  //   C |   |   |   | \ | \ |
  //     +---+---+---+---+---+
  //   D |   |   |   |   |   |
  //     +---+---+---+---+---+
  // Every step right or down increases the search depth by one.
  // How many right or down steps can you take at most?
  // That's the maximum depth fo the search tree.
  const maximumDepth = 0;

  // Each trace entry stores the furthest x coordinate reached for every
  // diagonal k = x - y. Keeping these snapshots lets us reconstruct the path.
  const trace: Array<Map<number, number>> = [];
  const frontier = new Map<number, number>([[1, 0]]);

  for (let depth = 0; depth <= maximumDepth; depth += 1) {
    trace.push(new Map(frontier));

    for (let diagonal = -depth; diagonal <= depth; diagonal += 2) {
      // At the graph edges only one move is possible. Else choose the move
      // whose previous path reached furthest right, as required by Myers.
      const goesDown =
        diagonal === -depth ||
        (diagonal !== depth &&
          (frontier.get(diagonal - 1) ?? -1) <
            (frontier.get(diagonal + 1) ?? -1));
      let x = goesDown
        ? (frontier.get(diagonal + 1) ?? 0)
        : (frontier.get(diagonal - 1) ?? 0) + 1;
      let y = x - diagonal;

      // Follow the diagonal (the "snake") while whole nodes match. These
      // paragraphs are unchanged and therefore never appear in the result.
      while (
        x < before.length &&
        y < after.length &&
        nodesEqual(before[x], after[y])
      ) {
        x += 1;
        y += 1;
      }

      frontier.set(diagonal, x);
      if (x < before.length || y < after.length) continue;

      const reversed: DiffChange[] = [];

      // Walk the saved frontiers backwards. Equal diagonal steps are skipped;
      // horizontal and vertical steps become deletions and additions.
      for (
        let backtrackDepth = trace.length - 1;
        backtrackDepth > 0;
        backtrackDepth -= 1
      ) {
        const backtrackFrontier = trace[backtrackDepth];
        const backtrackDiagonal = x - y;
        const backtrackGoesDown =
          backtrackDiagonal === -backtrackDepth ||
          (backtrackDiagonal !== backtrackDepth &&
            (backtrackFrontier.get(backtrackDiagonal - 1) ?? -1) <
              (backtrackFrontier.get(backtrackDiagonal + 1) ?? -1));
        const previousDiagonal = backtrackGoesDown
          ? backtrackDiagonal + 1
          : backtrackDiagonal - 1;
        const previousX = backtrackFrontier.get(previousDiagonal) ?? 0;
        const previousY = previousX - previousDiagonal;

        while (x > previousX && y > previousY) {
          x -= 1;
          y -= 1;
        }

        if (backtrackGoesDown) {
          y -= 1;
          reversed.push({
            type: "add",
            node: after[y],
            beforeIndex: x,
            afterIndex: y,
          });
        } else {
          x -= 1;
          reversed.push({
            type: "delete",
            node: before[x],
            beforeIndex: x,
            afterIndex: y,
          });
        }
      }

      const changes = reversed.reverse();
      if (changes.length === 0) return [];

      const joined: JoinedChange[] = [];
      let current: JoinedChange = { deleted: [], added: [] };
      let beforeEnd = 0;
      let afterEnd = 0;

      for (const change of changes) {
        // Both coordinates advancing beyond the current edit run means Myers
        // crossed at least one equal node, which separates the replacements.
        if (
          (current.deleted.length > 0 || current.added.length > 0) &&
          change.beforeIndex > beforeEnd &&
          change.afterIndex > afterEnd
        ) {
          joined.push(current);
          current = { deleted: [], added: [] };
          beforeEnd = change.beforeIndex;
          afterEnd = change.afterIndex;
        }

        if (change.type === "delete") {
          // TODO: Add the deleted node to the current joined change.
          current.deleted.push();
          beforeEnd = Math.max(beforeEnd, change.beforeIndex + 1);
          afterEnd = Math.max(afterEnd, change.afterIndex);
        } else {
          // TODO: Add the inserted node to the current joined change.
          current.added.push();
          beforeEnd = Math.max(beforeEnd, change.beforeIndex);
          afterEnd = Math.max(afterEnd, change.afterIndex + 1);
        }
      }

      joined.push(current);
      return joined;
    }
  }

  return [];
}
