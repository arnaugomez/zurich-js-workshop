import type { JSONContent } from '@tiptap/core'
import { describe, expect, it } from 'vitest'
import { classroomNotes } from '../src/data/classroom-notes'
import { findMentionedItems } from '../src/exercise/findMentionedItems'

const gardenNote = classroomNotes.find(note => note.id === 'note-marc-garden-01')!
const communicationNote = classroomNotes.find(note => note.id === 'note-arnau-aac-01')!
const sportsNote = classroomNotes.find(note => note.id === 'note-laia-sports-01')!

describe('findMentionedItems', () => {
  it('returns mentioned items from a Tiptap JSON document', () => {
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Ask ' },
            {
              type: 'mention',
              attrs: {
                id: communicationNote.id,
                label: communicationNote.label,
              },
            },
            { type: 'text', text: ' about the next session.' },
          ],
        },
      ],
    }

    expect(findMentionedItems(document)).toEqual([communicationNote])
  })

  it('finds mentions deeply nested inside the document', () => {
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Review ' },
                    {
                      type: 'mention',
                      attrs: {
                        id: gardenNote.id,
                        label: gardenNote.label,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    expect(findMentionedItems(document)).toEqual([gardenNote])
  })

  it('removes duplicate mentions by id', () => {
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'mention',
              attrs: {
                id: communicationNote.id,
                label: communicationNote.label,
              },
            },
            { type: 'text', text: ' and again ' },
            {
              type: 'mention',
              attrs: {
                id: communicationNote.id,
                label: 'Arnau: Updated label should not replace the first',
              },
            },
          ],
        },
      ],
    }

    expect(findMentionedItems(document)).toEqual([communicationNote])
  })

  it('returns matching notes in classroom-notes order and ignores unknown note ids', () => {
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'mention', attrs: { id: 'unknown-note' } },
            {
              type: 'mention',
              attrs: {
                id: sportsNote.id,
                label: sportsNote.label,
              },
            },
            { type: 'mention', attrs: { label: 'Missing id' } },
            {
              type: 'mention',
              attrs: {
                id: gardenNote.id,
                label: gardenNote.label,
              },
            },
          ],
        },
      ],
    }

    expect(findMentionedItems(document)).toEqual([gardenNote, sportsNote])
  })

  it('returns an empty array when the document has no mentions', () => {
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'No references yet.' }],
        },
      ],
    }

    expect(findMentionedItems(document)).toEqual([])
  })
})
