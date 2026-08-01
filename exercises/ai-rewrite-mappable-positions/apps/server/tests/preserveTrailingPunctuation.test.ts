import { describe, expect, it } from 'vitest'
import { preserveTrailingPunctuation } from '../src/solution/preserveTrailingPunctuation.solution.js'

describe('preserveTrailingPunctuation', () => {
  it('adds the original punctuation when the generated text has none', () => {
    expect(
      preserveTrailingPunctuation('How was your day?', 'How did your day go'),
    ).toBe('How did your day go?')
  })

  it('removes generated punctuation when the original has none', () => {
    expect(
      preserveTrailingPunctuation('a selected fragment', 'A rewritten fragment.'),
    ).toBe('A rewritten fragment')
  })

  it('replaces generated punctuation with the original punctuation', () => {
    expect(
      preserveTrailingPunctuation('A complete sentence.', 'A clearer sentence!'),
    ).toBe('A clearer sentence.')
  })

  it('preserves the original trailing whitespace exactly', () => {
    expect(preserveTrailingPunctuation('A sentence.  ', 'A rewrite!\n')).toBe(
      'A rewrite.  ',
    )
  })
})
