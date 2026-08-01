import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { extractMentionIds } from "@/components/chat-panel";

describe("chat mentions", () => {
  it("extracts unique supporting-document IDs from minimal editor JSON", () => {
    const content: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Use " },
            { type: "mention", attrs: { id: "note-marc-garden-01" } },
            { type: "mention", attrs: { id: "note-marc-garden-01" } },
          ],
        },
      ],
    };
    expect(extractMentionIds(content)).toEqual(["note-marc-garden-01"]);
  });
});
