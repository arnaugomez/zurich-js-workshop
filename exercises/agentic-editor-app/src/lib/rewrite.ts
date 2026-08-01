import type { MappablePosition, Range } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";

export const rewriteTasks = ["summarize", "expand", "rephrase", "proofread"] as const;
export type RewriteTask = (typeof rewriteTasks)[number];

export type RewriteRequest = {
  text: Promise<string>;
  range: { from: MappablePosition; to: MappablePosition };
};

export function preserveTrailingPunctuation(original: string, rewritten: string): string {
  const punctuation = original.match(/[.!?]+\s*$/)?.[0].trim();
  const clean = rewritten.trim();
  if (!punctuation || /[.!?]$/.test(clean)) return clean;
  return `${clean}${punctuation}`;
}

export function buildRewritePrompt(task: RewriteTask, text: string): string {
  return `Rewrite the selected text to ${task}. Return only the rewritten text, without quotation marks or commentary. Preserve its meaning and do not invent facts.\n\n<selected_text>${text}</selected_text>`;
}

export function requestAiRewrite(task: RewriteTask, editor: Editor, range: Range): RewriteRequest {
  const selectedText = editor.state.doc.textBetween(range.from, range.to, " ");
  return {
    text: fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, text: selectedText }),
    }).then(async (response) => {
      const body = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || typeof body.text !== "string")
        throw new Error(body.error || "Could not rewrite the selected text.");
      return body.text;
    }),
    range: {
      from: editor.utils.createMappablePosition(range.from),
      to: editor.utils.createMappablePosition(range.to),
    },
  };
}

export function updateRewriteRange(
  editor: Editor,
  request: RewriteRequest,
  transaction: Transaction,
): void {
  request.range = {
    from: editor.utils.getUpdatedPosition(request.range.from, transaction).position,
    to: editor.utils.getUpdatedPosition(request.range.to, transaction).position,
  };
}

export async function insertAiRewrite(editor: Editor, request: RewriteRequest) {
  const text = await request.text;
  const from = Math.min(request.range.from.position, request.range.to.position);
  const to = Math.max(request.range.from.position, request.range.to.position);
  editor
    .chain()
    .focus()
    .insertContentAt({ from, to }, text)
    .setTextSelection({ from, to: from + text.length })
    .run();
}
