import { computePosition, flip, shift } from '@floating-ui/dom'
import { posToDOMRect, ReactRenderer } from '@tiptap/react'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import type { ClassroomNote } from '../data/classroom-notes'
import { NoteMentionList, type NoteMentionListRef } from '../mention/NoteMentionList'

type MentionSuggestion = Omit<SuggestionOptions<ClassroomNote>, 'editor'>

export function renderSuggestion(): MentionSuggestion['render'] {
  let component: ReactRenderer<NoteMentionListRef> | undefined

  const updatePosition = (props: SuggestionProps<ClassroomNote>) => {
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

  return () => ({
    onStart(props) {
      component = new ReactRenderer(NoteMentionList, {
        props,
        editor: props.editor,
      })
      component.element.classList.add('suggestion-popover')
      document.body.appendChild(component.element)
      updatePosition(props)
    },
    onUpdate(props) {
      component?.updateProps(props)
      updatePosition(props)
    },
    onKeyDown(props) {
      if (props.event.key === 'Escape') {
        component?.destroy()
        return true
      }

      return component?.ref?.onKeyDown(props) ?? false
    },
    onExit() {
      component?.element.remove()
      component?.destroy()
      component = undefined
    },
  })
}
