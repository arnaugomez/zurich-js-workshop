import type { Editor, EditorEvents } from '@tiptap/core'

export type TransactionListener = (
  transaction: EditorEvents['transaction']['transaction'],
) => void

export function subscribeToTransactions(
  editor: Editor,
  listener: TransactionListener,
): () => void {
  const handleTransaction = ({
    transaction,
  }: Pick<EditorEvents['transaction'], 'transaction'>) => {
    listener(transaction)
  }

  editor.on('transaction', handleTransaction)

  return () => editor.off('transaction', handleTransaction)
}
