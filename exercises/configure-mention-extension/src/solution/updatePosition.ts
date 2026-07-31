import { computePosition, flip, shift } from '@floating-ui/dom'
import { posToDOMRect } from '@tiptap/react'
import type { SuggestionProps } from '@tiptap/suggestion'
import type { ClassroomNote } from '../data/classroom-notes'

/**
 * Uses the Floating UI library to position the suggestion element by the editor selection.
 */
export function updatePosition(
  component: { element: HTMLElement } | undefined,
  props: SuggestionProps<ClassroomNote>,
) {
  if (!component?.element || !props.clientRect) {
    return
  }

  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        props.editor.view,
        props.editor.state.selection.from,
        props.editor.state.selection.to,
      ),
  }

  computePosition(virtualElement, component.element, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    if (!component?.element) {
      return
    }

    component.element.style.position = strategy
    component.element.style.left = `${x}px`
    component.element.style.top = `${y}px`
  })
}
