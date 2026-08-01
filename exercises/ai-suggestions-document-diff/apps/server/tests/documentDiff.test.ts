import { describe, expect, it } from 'vitest'
import * as exercise from '../src/exercise/documentDiff.js'
import * as solution from '../src/solution/documentDiff.solution.js'
import type { DocumentNode } from '../src/types.js'

const paragraph = (text: string): DocumentNode => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const document = (content?: DocumentNode[]): DocumentNode => ({
  type: 'doc',
  ...(content ? { content } : {}),
})

describe.each([
  ['exercise', exercise],
  ['solution', solution],
])('%s document diff', (_name, implementation) => {
  it('returns no changes for documents without children', () => {
    expect(implementation.documentDiff(document(), document())).toEqual([])
  })

  it('compares complete nodes without depending on object key order', () => {
    const before: DocumentNode = {
      type: 'paragraph',
      attrs: { level: 1, align: 'left' },
    }
    const same: DocumentNode = {
      attrs: { align: 'left', level: 1 },
      type: 'paragraph',
    }

    expect(implementation.nodesEqual(before, same)).toBe(true)
    expect(
      implementation.nodesEqual(paragraph('One'), paragraph('Two')),
    ).toBe(false)
    expect(implementation.documentDiff(document([before]), document([same]))).toEqual([])
    expect(
      implementation.documentDiff(
        document([paragraph('One')]),
        document([paragraph('Two')]),
      ),
    ).toEqual([
      {
        deleted: [paragraph('One')],
        added: [paragraph('Two')],
      },
    ])
  })

  it('finds and joins a paragraph-level replacement', () => {
    const one = paragraph('One')
    const oldTwo = paragraph('Old two')
    const newTwo = paragraph('New two')
    const three = paragraph('Three')

    expect(
      implementation.documentDiff(
        document([one, oldTwo, three]),
        document([one, newTwo, three]),
      ),
    ).toEqual([{ deleted: [oldTwo], added: [newTwo] }])
  })

  it('handles additions at the beginning and deletions at the end', () => {
    const zero = paragraph('Zero')
    const one = paragraph('One')
    const two = paragraph('Two')

    expect(
      implementation.documentDiff(document([one, two]), document([zero, one])),
    ).toEqual([
      { deleted: [], added: [zero] },
      { deleted: [two], added: [] },
    ])
  })

  it('joins adjacent edits and separates runs divided by an equal node', () => {
    const oldOne = paragraph('Old one')
    const oldTwo = paragraph('Old two')
    const newOne = paragraph('New one')
    const unchanged = paragraph('Unchanged')
    const oldFour = paragraph('Old four')
    const newFour = paragraph('New four')

    expect(
      implementation.documentDiff(
        document([oldOne, oldTwo, unchanged, oldFour]),
        document([newOne, unchanged, newFour]),
      ),
    ).toEqual([
      { deleted: [oldOne, oldTwo], added: [newOne] },
      { deleted: [oldFour], added: [newFour] },
    ])
  })
})
