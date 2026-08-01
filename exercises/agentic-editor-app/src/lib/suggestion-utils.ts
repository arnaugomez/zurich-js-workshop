import type { Suggestion } from "@tiptap-pro/extension-tracked-changes";

type JsonNode = { type?: string; text?: string; attrs?: { alt?: string }; content?: JsonNode[] };

function nodeText(node: JsonNode): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content?.length) return node.attrs?.alt ?? "";
  return node.content.map(nodeText).join("");
}

function nodesPreview(nodes?: JsonNode[]): string {
  return (nodes ?? [])
    .map(nodeText)
    .filter(Boolean)
    .map((text) => `“${text}”`)
    .join(" + ");
}

export function getSuggestionPreview(suggestion: Suggestion): string {
  const inserted = nodesPreview(suggestion.insertedNodes as JsonNode[] | undefined);
  const deleted = nodesPreview(suggestion.deletedNodes as JsonNode[] | undefined);
  if (suggestion.type === "replace")
    return `↔ ${inserted || suggestion.text}${deleted ? ` (was ${deleted})` : ""}`;
  if (suggestion.type === "add") return `+ ${inserted || suggestion.text}`;
  if (suggestion.type === "delete") return `− ${deleted || suggestion.text}`;
  return `~ ${suggestion.text}`;
}

export function getUniqueSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return [...new Map(suggestions.map((suggestion) => [suggestion.id, suggestion])).values()];
}
