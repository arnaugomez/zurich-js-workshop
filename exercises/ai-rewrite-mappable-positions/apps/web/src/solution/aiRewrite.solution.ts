import type { MappablePosition, Range } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/react'
import { requestAiRewrite as requestAiRewriteFromServer } from '../aiApi'
import type { RewriteTask } from '../aiApi'

export type MappableRewriteRange = {
  from: MappablePosition
  to: MappablePosition
}

export type RewriteRequest = {
  text: Promise<string>
  range: MappableRewriteRange
}

export function requestAiRewrite(
  task: RewriteTask,
  editor: Editor,
  range: Range,
): RewriteRequest {
  const selectedText = editor.state.doc.textBetween(
    range.from,
    range.to,
    ' ',
  )

  return {
    text: requestAiRewriteFromServer(task, selectedText),
    range: {
      from: editor.utils.createMappablePosition(range.from),
      to: editor.utils.createMappablePosition(range.to),
    },
  }
}

export function updateRewriteRange(
  editor: Editor,
  range: MappableRewriteRange,
  transaction: Transaction,
): MappableRewriteRange {
  return {
    from: editor.utils.getUpdatedPosition(range.from, transaction).position,
    to: editor.utils.getUpdatedPosition(range.to, transaction).position,
  }
}

export async function insertAiRewrite(
  editor: Editor,
  request: RewriteRequest,
): Promise<void> {
  const text = await request.text
  const from = Math.min(request.range.from.position, request.range.to.position)
  const to = Math.max(request.range.from.position, request.range.to.position)

  editor.commands.insertContentAt({ from, to }, text)
}
