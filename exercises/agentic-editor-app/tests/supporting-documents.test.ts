import { describe, expect, it } from "vitest";
import {
  findSupportingDocument,
  searchSupportingDocuments,
  serializeSupportingDocument,
  supportingDocuments,
} from "@/data/supporting-documents";

describe("supporting documents", () => {
  it("reuses the six fixed classroom notes", () => {
    expect(supportingDocuments).toHaveLength(6);
    expect(findSupportingDocument("note-marc-garden-01")?.student).toBe("Marc");
  });

  it("searches all user-facing evidence fields", () => {
    expect(searchSupportingDocuments("garden").map((item) => item.student)).toEqual(["Marc"]);
    expect(searchSupportingDocuments("break").map((item) => item.student)).toContain("Arnau");
  });

  it("serializes the complete read-only evidence", () => {
    const serialized = serializeSupportingDocument(supportingDocuments[0]);
    expect(JSON.parse(serialized)).toMatchObject({
      id: "note-marc-garden-01",
      supportLevel: "visual cue",
    });
  });
});
