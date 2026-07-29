import Mention from "@tiptap/extension-mention";

export function createMentionExtension(): ReturnType<typeof Mention.configure> {
  // TODO: Configure the Mention extension.
  // It should use the @ trigger, search classroom notes asynchronously,
  // insert mentions with a unique id and name, and render the suggestion list.
  // Mention elements should have the "note-mention" class.
  throw new Error("Not implemented");
}
