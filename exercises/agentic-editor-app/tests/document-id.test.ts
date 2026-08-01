import { describe, expect, it } from "vitest";
import { DOCUMENT_PREFIX, getDocumentName, isDocumentSlug } from "@/lib/document-id";

describe("document identity", () => {
  it("accepts only lowercase two-word slugs", () => {
    expect(isDocumentSlug("quiet-panda")).toBe(true);
    expect(isDocumentSlug("quiet-panda-extra")).toBe(false);
    expect(isDocumentSlug("Quiet-panda")).toBe(false);
    expect(isDocumentSlug("quiet_panda")).toBe(false);
  });

  it("keeps the cloud prefix out of the query slug", () => {
    expect(getDocumentName("quiet-panda")).toBe(`${DOCUMENT_PREFIX}/quiet-panda`);
    expect(() => getDocumentName("invalid")).toThrow("Invalid document slug");
  });
});
