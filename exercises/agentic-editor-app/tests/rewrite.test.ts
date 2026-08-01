import { describe, expect, it } from "vitest";
import { buildRewritePrompt, preserveTrailingPunctuation } from "@/lib/rewrite";

describe("AI rewrite helpers", () => {
  it("restores trailing punctuation when the model drops it", () => {
    expect(preserveTrailingPunctuation("Original?", "Rewritten")).toBe("Rewritten?");
    expect(preserveTrailingPunctuation("Original!", "Rewritten.")).toBe("Rewritten.");
  });

  it("instructs the model not to invent facts", () => {
    expect(buildRewritePrompt("proofread", "Some text.")).toContain("do not invent facts");
  });
});
