import Mention from '@tiptap/extension-mention'
import { searchClassroomNotes } from '../data/searchClassroomNotes'
import { renderSuggestion } from './renderSuggestion'

export function createMentionExtension() {
  return Mention.configure({
    HTMLAttributes: {
      class: 'note-mention',
    },
    suggestion: {
      char: '@',
      items: ({ query }) => searchClassroomNotes(query),
      render: renderSuggestion(),
    },
  })
}
