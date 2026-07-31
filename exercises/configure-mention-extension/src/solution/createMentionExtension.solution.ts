import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionProps } from "@tiptap/suggestion";
import type { ClassroomNote } from "../data/classroom-notes";
import { searchClassroomNotes } from "../data/searchClassroomNotes";
import { NoteMentionList } from "./NoteMentionList";
import { updatePosition } from "./updatePosition";

export function createMentionExtension() {
  return Mention.configure({
    HTMLAttributes: {
      class: "note-mention",
    },
    suggestion: {
      char: "@",
      items: ({ query }) => searchClassroomNotes(query),
      render: () => {
        let component: ReactRenderer | undefined;
        let suggestionProps: SuggestionProps<ClassroomNote> | undefined;
        let selectedIndex = 0;

        const selectItem = (index: number) => {
          const currentSuggestionProps = suggestionProps;
          const item = currentSuggestionProps?.items[index];

          if (item) {
            currentSuggestionProps.command(item);
          }
        };

        const rerenderComponent = () => {
          if (!suggestionProps) {
            return;
          }

          const props = {
            items: suggestionProps.items,
            selectedIndex,
            onSelect: selectItem,
          };

          component?.updateProps(props);
        };

        return {
          onStart(props) {
            suggestionProps = props;
            selectedIndex = 0;
            component = new ReactRenderer(NoteMentionList, {
              props,
              editor: props.editor,
            });
            rerenderComponent();
            component.element.classList.add("suggestion-popover");
            document.body.appendChild(component.element);
            updatePosition(component, props);
          },
          onUpdate(props) {
            suggestionProps = props;
            selectedIndex = 0;
            rerenderComponent();
            updatePosition(component, props);
          },
          onKeyDown(props) {
            if (props.event.key === "Escape") {
              component?.destroy();
              return true;
            }

            if (!suggestionProps?.items.length) {
              return false;
            }

            if (props.event.key === "ArrowUp") {
              selectedIndex =
                (selectedIndex + suggestionProps.items.length - 1) %
                suggestionProps.items.length;
              rerenderComponent();
              return true;
            }

            if (props.event.key === "ArrowDown") {
              selectedIndex =
                (selectedIndex + 1) % suggestionProps.items.length;
              rerenderComponent();
              return true;
            }

            if (props.event.key === "Enter") {
              selectItem(selectedIndex);
              return true;
            }

            return false;
          },
          onExit() {
            component?.element.remove();
            component?.destroy();
            component = undefined;
            suggestionProps = undefined;
          },
        };
      },
    },
  });
}
