import type { ClassroomNote } from "../data/classroom-notes";

type NoteMentionListProps = {
  items: ClassroomNote[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function NoteMentionList({
  items,
  selectedIndex,
  onSelect,
}: NoteMentionListProps) {
  if (items.length === 0) {
    // TODO: Render the empty-state message for a search with no matching notes.
    return null;
  }

  return (
    <div className="suggestion-list">
      {items.map((note, index) => (
        <button
          type="button"
          // TODO: Use the suggestion item class and add the selected class
          // when this item's index matches `selectedIndex`.
          className=""
          // TODO: Use the note's stable, unique id as the React key.
          key={index}
          onMouseDown={(event) => {
            event.preventDefault();
            // TODO: Select this note without letting the editor lose focus.
            void onSelect;
          }}
        >
          {/* TODO: Render the student's name and the note's activity. */}
        </button>
      ))}
    </div>
  );
}
