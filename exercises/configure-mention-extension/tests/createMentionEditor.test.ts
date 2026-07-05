import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { createMentionExtension } from '../src/exercise/createMentionExtension'

let editor: Editor | undefined

type JSONNode = {
  type?: string
  attrs?: Record<string, unknown>
  content?: JSONNode[]
}

function findNodeByType(node: JSONNode, type: string): JSONNode | undefined {
  if (node.type === type) {
    return node
  }

  for (const child of node.content ?? []) {
    const found = findNodeByType(child, type)

    if (found) {
      return found
    }
  }

  return undefined
}

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

function createEditor() {
  return new Editor({
    extensions: [StarterKit, createMentionExtension()],
    content:
      '<p>Draft evidence for the autonomy section. Type @ to reference a classroom note.</p>',
  })
}

describe('createMentionExtension', () => {
  it('registers the Mention node in the editor schema', () => {
    editor = createEditor()

    expect(editor.schema.nodes.mention).toBeDefined()
  })

  it('configures Mention to search classroom notes with the @ trigger', async () => {
    editor = createEditor()

    const mention = editor.extensionManager.extensions.find(
      extension => extension.name === 'mention',
    )

    expect(mention).toBeDefined()
    expect(mention?.options.suggestion.char).toBe('@')

    const items = await mention?.options.suggestion.items({ query: 'garden' })

    expect(items).toEqual([
      expect.objectContaining({
        id: 'note-marc-garden-01',
        name: 'Marc: Garden watering routine',
        label: 'Marc: Garden watering routine',
      }),
    ])
  })

  it('stores only a unique id and name on inserted mentions', () => {
    editor = createEditor()

    editor.commands.insertContent({
      type: 'mention',
      attrs: {
        id: 'note-arnau-aac-01',
        label: 'Arnau: Communication board check-in',
      },
    })

    const mention = findNodeByType(editor.getJSON(), 'mention')

    expect(mention).toMatchObject({
      type: 'mention',
      attrs: {
        id: 'note-arnau-aac-01',
        label: 'Arnau: Communication board check-in',
      },
    })
  })

  it('styles rendered mentions through HTML attributes', () => {
    editor = createEditor()

    const mention = editor.extensionManager.extensions.find(
      extension => extension.name === 'mention',
    )

    expect(mention?.options.HTMLAttributes).toEqual({
      class: 'note-mention',
    })
  })
})
