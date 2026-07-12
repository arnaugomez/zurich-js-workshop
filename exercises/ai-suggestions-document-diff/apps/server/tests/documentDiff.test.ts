import { describe, expect, it } from 'vitest'
import * as exercise from '../src/exercise/documentDiff.js'
import * as solution from '../src/solution/documentDiff.solution.js'
import type { DocumentNode } from '../src/types.js'

const paragraph = (text: string): DocumentNode => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

describe.each([
  ['exercise', exercise],
  ['solution', solution],
])('%s document diff', (_name, implementation) => {
  it('returns the direct children of the document', () => {
    const nodes = [paragraph('One'), paragraph('Two')]
    expect(implementation.getDocumentNodes({ type: 'doc', content: nodes })).toEqual(nodes)
    expect(implementation.getDocumentNodes({ type: 'doc' })).toEqual([])
  })

  it('compares complete nodes without depending on object key order', () => {
    expect(implementation.nodesEqual(
      { type: 'paragraph', attrs: { level: 1, align: 'left' } },
      { attrs: { align: 'left', level: 1 }, type: 'paragraph' },
    )).toBe(true)
    expect(implementation.nodesEqual(paragraph('One'), paragraph('Two'))).toBe(false)
  })

  it('finds a minimal paragraph-level edit script', () => {
    const one = paragraph('One')
    const oldTwo = paragraph('Old two')
    const newTwo = paragraph('New two')
    const three = paragraph('Three')

    expect(implementation.diffNodes([one, oldTwo, three], [one, newTwo, three])).toEqual([
      { type: 'delete', node: oldTwo, beforeIndex: 1, afterIndex: 1 },
      { type: 'add', node: newTwo, beforeIndex: 2, afterIndex: 1 },
    ])
  })

  it('handles additions at the beginning and deletions at the end', () => {
    const zero = paragraph('Zero')
    const one = paragraph('One')
    const two = paragraph('Two')
    expect(implementation.diffNodes([one, two], [zero, one])).toEqual([
      { type: 'add', node: zero, beforeIndex: 0, afterIndex: 0 },
      { type: 'delete', node: two, beforeIndex: 1, afterIndex: 2 },
    ])
  })

  it('joins adjacent edit operations into replacement changes', () => {
    const oldOne = paragraph('Old one')
    const oldTwo = paragraph('Old two')
    const newOne = paragraph('New one')
    expect(implementation.joinAdjacentChanges([
      { type: 'delete', node: oldOne, beforeIndex: 0, afterIndex: 0 },
      { type: 'delete', node: oldTwo, beforeIndex: 1, afterIndex: 0 },
      { type: 'add', node: newOne, beforeIndex: 2, afterIndex: 0 },
    ])).toEqual([{ deleted: [oldOne, oldTwo], added: [newOne] }])
  })

  it('does not join edit runs separated by an equal node', () => {
    const oldOne = paragraph('Old one')
    const newOne = paragraph('New one')
    const unchanged = paragraph('Unchanged')
    const oldThree = paragraph('Old three')
    const newThree = paragraph('New three')

    const changes = implementation.diffNodes(
      [oldOne, unchanged, oldThree],
      [newOne, unchanged, newThree],
    )

    expect(implementation.joinAdjacentChanges(changes)).toEqual([
      { deleted: [oldOne], added: [newOne] },
      { deleted: [oldThree], added: [newThree] },
    ])
  })
})
