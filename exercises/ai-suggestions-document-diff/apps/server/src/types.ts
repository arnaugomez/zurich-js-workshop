export type DocumentNode = {
  type?: string
  attrs?: Record<string, unknown>
  text?: string
  marks?: Array<Record<string, unknown>>
  content?: DocumentNode[]
}

export type DiffChange =
  | {
      type: 'delete'
      node: DocumentNode
      beforeIndex: number
      afterIndex: number
    }
  | {
      type: 'add'
      node: DocumentNode
      beforeIndex: number
      afterIndex: number
    }

export type JoinedChange = {
  deleted: DocumentNode[]
  added: DocumentNode[]
}
