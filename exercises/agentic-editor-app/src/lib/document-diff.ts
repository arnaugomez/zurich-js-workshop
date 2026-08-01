import type { JSONContent } from "@tiptap/core";

export type JoinedChange = { deleted: JSONContent[]; added: JSONContent[] };

function equal(left: JSONContent, right: JSONContent): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function documentDiff(previousDocument: JSONContent, document: JSONContent): JoinedChange[] {
  const before = previousDocument.content ?? [];
  const after = document.content ?? [];
  const rows = before.length + 1;
  const columns = after.length + 1;
  const lengths = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let left = before.length - 1; left >= 0; left -= 1) {
    for (let right = after.length - 1; right >= 0; right -= 1) {
      lengths[left][right] = equal(before[left], after[right])
        ? lengths[left + 1][right + 1] + 1
        : Math.max(lengths[left + 1][right], lengths[left][right + 1]);
    }
  }

  const changes: JoinedChange[] = [];
  let current: JoinedChange | null = null;
  let left = 0;
  let right = 0;
  const ensureChange = () => (current ??= { deleted: [], added: [] });

  while (left < before.length || right < after.length) {
    if (left < before.length && right < after.length && equal(before[left], after[right])) {
      if (current) changes.push(current);
      current = null;
      left += 1;
      right += 1;
    } else if (
      right < after.length &&
      (left === before.length || lengths[left][right + 1] >= lengths[left + 1][right])
    ) {
      ensureChange().added.push(after[right]);
      right += 1;
    } else {
      ensureChange().deleted.push(before[left]);
      left += 1;
    }
  }
  if (current) changes.push(current);
  return changes;
}

export function buildSuggestionsPrompt(document: JSONContent, changes: JoinedChange[]): string {
  const context = changes.length
    ? `<current_document>${JSON.stringify(document)}</current_document>\n<recent_changes>${JSON.stringify(changes)}</recent_changes>`
    : `<current_document>${JSON.stringify(document)}</current_document>`;
  return `You support a special-needs education teacher writing an end-of-course student report.
Review the report and suggest specific improvements or useful evidence the teacher could add. Pay particular attention to recent changes. Never invent facts, diagnoses, activities, or progress.
Phrase every suggestion as a short, respectful question. Provide exactly 3 suggestions.
${context}`;
}
