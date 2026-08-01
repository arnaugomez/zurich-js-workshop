import { describe, expect, it } from 'vitest'
import * as exercise from '../src/exercise/buildSuggestionsPrompt.js'
import * as solution from '../src/solution/buildSuggestionsPrompt.solution.js'

describe.each([
  ['exercise', exercise],
  ['solution', solution],
])('%s suggestions prompt', (_name, implementation) => {
  it('includes the document, changes, safety constraint, and question style', () => {
    const prompt = implementation.buildSuggestionsPrompt(
      { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Laia participates.' }] }] },
      [{ deleted: [], added: [{ type: 'paragraph', content: [{ type: 'text', text: 'Laia participates.' }] }] }],
    )
    expect(prompt).toContain('Laia participates.')
    expect(prompt).toContain('recent_changes')
    expect(prompt).toMatch(/never invent/i)
    expect(prompt).toMatch(/question/i)
  })

  it('builds a full-document prompt when there are no changes', () => {
    const prompt = implementation.buildInitialSuggestionsPrompt({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Laia participates.' }] }],
    })
    expect(prompt).toContain('Laia participates.')
    expect(prompt).not.toContain('recent_changes')
    expect(prompt).toMatch(/entire current report/i)
    expect(prompt).toMatch(/3 to 5 suggestions/i)
  })
})
