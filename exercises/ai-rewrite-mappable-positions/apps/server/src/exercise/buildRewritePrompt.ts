export type RewriteTask = 'summarize' | 'expand' | 'rephrase' | 'proofread'

export function buildRewritePrompt(task: RewriteTask, text: string): string {
  // TODO: Return a prompt that tells the model to perform `task` on `text`.
  // Keep the instruction explicit that it must return only the transformed text.
  throw new Error('Not implemented')
}
