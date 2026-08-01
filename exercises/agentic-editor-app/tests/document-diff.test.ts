import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { buildSuggestionsPrompt, documentDiff } from "@/lib/document-diff";

const doc = (...text: string[]): JSONContent => ({
  type: "doc",
  content: text.map((value) => ({
    type: "paragraph",
    content: [{ type: "text", text: value }],
  })),
});

describe("documentDiff", () => {
  it("joins adjacent deletion and insertion as one changed run", () => {
    const changes = documentDiff(doc("One", "Before", "Three"), doc("One", "After", "Three"));
    expect(changes).toHaveLength(1);
    expect(changes[0].deleted).toHaveLength(1);
    expect(changes[0].added).toHaveLength(1);
  });

  it("includes both the document and recent changes in the prompt", () => {
    const current = doc("Updated");
    const prompt = buildSuggestionsPrompt(current, documentDiff(doc("Old"), current));
    expect(prompt).toContain("<current_document>");
    expect(prompt).toContain("<recent_changes>");
    expect(prompt).toContain("exactly 3 suggestions");
  });
});
