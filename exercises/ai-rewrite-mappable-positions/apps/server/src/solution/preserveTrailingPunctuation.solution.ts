const trailingPunctuationAndWhitespace = /[\p{P}\s]*$/u

export function preserveTrailingPunctuation(
  originalText: string,
  generatedText: string,
): string {
  const originalEnding = originalText.match(
    trailingPunctuationAndWhitespace,
  )?.[0]

  return generatedText.replace(
    trailingPunctuationAndWhitespace,
    originalEnding ?? '',
  )
}
