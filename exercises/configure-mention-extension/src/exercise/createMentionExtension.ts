import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionProps } from "@tiptap/suggestion";
import type { ClassroomNote } from "../data/classroom-notes";
import { searchClassroomNotes } from "../data/searchClassroomNotes";
import { NoteMentionList } from "./NoteMentionList";
import { updatePosition } from "./updatePosition";
import { filterClassroomNotes } from "../data/filter-classroom-notes";

export function createMentionExtension(): ReturnType<typeof Mention.configure> {
  return Mention.conjfigure({
    // TODO: Add the "note-mention" CSS class used to style inserted note mentions.
    HTMLAttributes: {},
    suggestion: {
      // TODO: configure the suggestion so that it opens when the user presses "@"
      char: "",
      // TODO: use `searchClassroomNotes` to retrieve the classroom notes every time the user types in the mention
      items: async (props) => {
        return [];
      },
      render: () => {
        // The UI state is handled here:
        /** The UI tooltip that's rendered over the notes */
        let component: ReactRenderer | undefined;
        /** The current state of the suggestion */
        let suggestionProps: SuggestionProps<ClassroomNote> | undefined;
        /** The index of the selected item */
        let selectedIndex = 0;

        const selectItem = (index: number) => {
          const currentSuggestionProps = suggestionProps;
          const item = currentSuggestionProps?.items[index];

          if (item) {
            // TODO: Run the suggestion command (suggestionProps.command) with the selected note.
          }
        };

        const rerenderComponent = () => {
          if (!suggestionProps) {
            return;
          }

          const componentProps = {
            // TODO: Pass the props that the NoteMentionList component needs
            // - The items
            // - The index of the selected item
            // - The `onSelect` callback that responds to the user selecting an item
            // Tip: see the NoteMentionList component for a full list of the props it needs.
          };

          // Re-render the component by updating its props.
          component?.updateProps(componentProps);
        };

        return {
          onStart(props) {
            suggestionProps = props;
            selectedIndex = 0;
            const componentProps = {
              // TODO: Pass the initial props that the NoteMentionList component needs
              // - The items (get them from suggestionProps)
              // - The index of the selected item
              // - The `onSelect` callback that responds to the user selecting an item
              // Tip: see the NoteMentionList component for a full list of the props it needs.
            };
            component = new ReactRenderer(NoteMentionList, {
              props: componentProps,
              editor: props.editor,
            });
            rerenderComponent();
            component.element.classList.add("suggestion-popover");
            // TODO: Append the popover element to the document body, then
            // position it next to the active suggestion range.
          },
          onUpdate(props) {
            // If it's loading, filter the existing notes locally
            if (props.loading && suggestionProps) {
              props.items = filterClassroomNotes(
                suggestionProps.items,
                props.query,
              );
            }
            suggestionProps = props;
            selectedIndex = 0;
            rerenderComponent();
            // TODO: Reposition the existing popover after the query changes.
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
              // TODO: Move to the previous item, wrapping to the last item,
              // then rerender the list.
              return true;
            }

            if (props.event.key === "ArrowDown") {
              // TODO: Move to the next item, wrapping to the first item,
              // then rerender the list.
              return true;
            }

            if (props.event.key === "Enter") {
              // TODO: Insert the currently selected note.
              return true;
            }

            return false;
          },
          onExit() {
            // TODO: Remove and destroy the rendered popover, then clear the
            // component and suggestion state.
          },
        };
      },
    },
  });
}
