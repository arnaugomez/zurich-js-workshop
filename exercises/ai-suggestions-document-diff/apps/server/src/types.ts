export type DocumentNode = {
  type?: string
  attrs?: Record<string, unknown>
  text?: string
  marks?: Array<Record<string, unknown>>
  content?: DocumentNode[]
}

export type DiffChange =
  | { type: 'delete'; node: DocumentNode }
  | { type: 'add'; node: DocumentNode }

export type JoinedChange = {
  deleted: DocumentNode[]
  added: DocumentNode[]
}
