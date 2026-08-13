"use client";

import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionProps } from "@tiptap/suggestion";
import { searchSupportingDocuments, type SupportingDocument } from "@/data/supporting-documents";

type MentionListProps = {
  items: SupportingDocument[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function MentionList({ items, selectedIndex, onSelect }: MentionListProps) {
  if (!items.length) return <div className="mention-empty">No matching documents</div>;
  return (
    <div className="mention-list" role="listbox" aria-label="Supporting documents">
      {items.map((document, index) => (
        <button
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          className={`mention-option${index === selectedIndex ? " is-selected" : ""}`}
          key={document.id}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(index);
          }}
        >
          <strong>{document.student}</strong>
          <span>{document.activity}</span>
        </button>
      ))}
    </div>
  );
}

function positionPopover(element: HTMLElement, props: SuggestionProps<SupportingDocument>) {
  const rect = props.clientRect?.();
  if (!rect) return;

  const reference = {
    getBoundingClientRect: () => rect,
    contextElement: props.editor.view.dom,
  };

  void computePosition(reference, element, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ["top-start"], padding: 8 }),
      shift({ padding: 8 }),
    ],
  }).then(({ x, y, placement, strategy }) => {
    if (!element.isConnected) return;
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.dataset.placement = placement;
  });
}

export function createSupportingDocumentMention() {
  return Mention.configure({
    HTMLAttributes: { class: "document-mention" },
    renderText: ({ node }) => `@${String(node.attrs.label ?? node.attrs.id)}`,
    suggestion: {
      char: "@",
      items: ({ query }) => searchSupportingDocuments(query),
      render: () => {
        let component: ReactRenderer<MentionListProps> | undefined;
        let currentProps: SuggestionProps<SupportingDocument> | undefined;
        let selectedIndex = 0;
        const select = (index: number) => {
          const item = currentProps?.items[index];
          if (item) currentProps?.command({ id: item.id, label: item.name });
        };
        const update = () =>
          component?.updateProps({
            items: currentProps?.items ?? [],
            selectedIndex,
            onSelect: select,
          });

        return {
          onStart(props) {
            currentProps = props;
            component = new ReactRenderer(MentionList, {
              editor: props.editor,
              props: { items: props.items, selectedIndex, onSelect: select },
            });
            component.element.classList.add("mention-popover");
            document.body.appendChild(component.element);
            positionPopover(component.element, props);
          },
          onUpdate(props) {
            currentProps = props;
            selectedIndex = 0;
            update();
            if (component) positionPopover(component.element, props);
          },
          onKeyDown({ event }) {
            const count = currentProps?.items.length ?? 0;
            if (event.key === "Escape") {
              component?.element.remove();
              return true;
            }
            if (!count) return false;
            if (event.key === "ArrowUp") {
              selectedIndex = (selectedIndex + count - 1) % count;
              update();
              return true;
            }
            if (event.key === "ArrowDown") {
              selectedIndex = (selectedIndex + 1) % count;
              update();
              return true;
            }
            if (event.key === "Enter") {
              select(selectedIndex);
              return true;
            }
            return false;
          },
          onExit() {
            component?.element.remove();
            component?.destroy();
            component = undefined;
            currentProps = undefined;
          },
        };
      },
    },
  });
}
