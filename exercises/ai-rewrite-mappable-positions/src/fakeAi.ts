export async function fakeAiRewrite(text: string, delayMs = 700): Promise<string> {
  await new Promise(resolve => window.setTimeout(resolve, delayMs))

  return `AI rewrite: ${text.trim().replace(/\s+/g, ' ')}`
}
