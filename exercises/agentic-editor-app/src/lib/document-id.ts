export const DOCUMENT_QUERY_PARAM = "document";
export const DOCUMENT_PREFIX = "zurich-js-workshop/agentic-editor-app";

const DOCUMENT_SLUG_PATTERN = /^[a-z]+-[a-z]+$/;

export function isDocumentSlug(value: unknown): value is string {
  return typeof value === "string" && DOCUMENT_SLUG_PATTERN.test(value);
}

export function getDocumentName(slug: string): string {
  if (!isDocumentSlug(slug)) throw new Error("Invalid document slug");
  return `${DOCUMENT_PREFIX}/${slug}`;
}
