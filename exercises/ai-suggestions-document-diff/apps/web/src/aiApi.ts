import type { JSONContent } from '@tiptap/core'

export async function requestSuggestions(
  previousDocument: JSONContent,
  document: JSONContent,
): Promise<string[]> {
  const response = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ previousDocument, document }),
  })
  const body: unknown = await response.json()

  const suggestions = body && typeof body === 'object'
    ? (body as { suggestions?: unknown }).suggestions
    : undefined
  if (!response.ok || !Array.isArray(suggestions) || !suggestions.every(item => typeof item === 'string')) {
    const message =
      body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string'
        ? (body as { error: string }).error
        : 'The AI server returned invalid suggestions.'
    throw new Error(message)
  }

  return suggestions
}
