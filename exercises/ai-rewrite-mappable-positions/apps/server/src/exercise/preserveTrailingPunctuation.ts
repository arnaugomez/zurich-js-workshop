// Regex breakdown:
// 1. [...] creates a character group.
// 2. \p{P} matches any Unicode punctuation character.
// 3. \s matches any whitespace character.
// 4. * matches zero or more of those characters.
// 5. $ requires the match to be at the end of the text.
// 6. u enables Unicode property escapes such as \p{P}.
const trailingPunctuationAndWhitespace = /[\p{P}\s]*$/u;

/**
 * Ensure the AI-generated text has the same trailing spacing and punctuation as the original text.
 * This prevents a common mistake where the AI replaces a string that ends with a space with a string
 * that doesn't, causing the text to lose a space.
 */
export function preserveTrailingPunctuation(
  originalText: string,
  generatedText: string,
): string {
  // TODO:
  // 1. Use the regex to get the original text's trailing punctuation and
  //    whitespace.
  // 2. Use the same regex to replace the generated text's ending with it.
  throw new Error("Not implemented");
}
