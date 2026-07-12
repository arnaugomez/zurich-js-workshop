export const rewriteTasks = [
  'summarize',
  'expand',
  'rephrase',
  'proofread',
] as const

export type RewriteTask = (typeof rewriteTasks)[number]

export async function requestAiRewrite(
  task: RewriteTask,
  text: string,
): Promise<string> {
  const response = await fetch('/api/rewrite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, text }),
  })
  const body: unknown = await response.json()

  if (!response.ok || !body || typeof body !== 'object' || typeof (body as { text?: unknown }).text !== 'string') {
    const message =
      body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string'
        ? (body as { error: string }).error
        : 'The AI server returned an invalid response.'
    throw new Error(message)
  }

  return (body as { text: string }).text
}
