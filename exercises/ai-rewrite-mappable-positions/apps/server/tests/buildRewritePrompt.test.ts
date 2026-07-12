import { describe, expect, it } from 'vitest'
import { buildRewritePrompt } from '../src/solution/buildRewritePrompt.solution.js'

describe('buildRewritePrompt', () => {
  it('adds the selected task instruction and source text', () => {
    expect(buildRewritePrompt('proofread', 'teh draft')).toContain(
      'Proofread the text',
    )
    expect(buildRewritePrompt('proofread', 'teh draft')).toContain('teh draft')
  })
})
