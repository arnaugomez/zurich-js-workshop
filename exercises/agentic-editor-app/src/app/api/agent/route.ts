import { devToolsMiddleware } from "@ai-sdk/devtools";
import { openai } from "@ai-sdk/openai";
import {
  createAgentUIStreamResponse,
  ToolLoopAgent,
  tool,
  type UIMessage,
  wrapLanguageModel,
} from "ai";
import { z } from "zod";
import {
  findSupportingDocument,
  serializeSupportingDocument,
  supportingDocuments,
} from "@/data/supporting-documents";
import { getDocumentName, isDocumentSlug } from "@/lib/document-id";
import { executeToolkitTool, getToolkitTools } from "@/lib/server-ai-toolkit/tools";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: UIMessage[];
    editorContext?: unknown;
    documentSlug?: unknown;
    mentionedDocumentIds?: unknown;
  };

  if (!Array.isArray(body.messages) || !isDocumentSlug(body.documentSlug)) {
    return Response.json({ error: "Invalid agent request." }, { status: 400 });
  }

  const documentId = getDocumentName(body.documentSlug);
  const mentionedIds = Array.isArray(body.mentionedDocumentIds)
    ? body.mentionedDocumentIds.filter((id): id is string => typeof id === "string")
    : [];
  const mentionedDocuments = mentionedIds
    .map(findSupportingDocument)
    .filter((document) => document !== undefined);

  const toolkit = await getToolkitTools(body.editorContext);
  const editorTools = Object.fromEntries(
    toolkit.tools.map((definition) => [
      definition.name,
      tool({
        description: definition.description,
        inputSchema: z.fromJSONSchema(definition.inputSchema),
        execute: async (input) => {
          try {
            return await executeToolkitTool({
              name: definition.name,
              input,
              editorContext: body.editorContext,
              documentId,
            });
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : "Editor tool failed",
            };
          }
        },
      }),
    ]),
  );

  const supportingDocumentTools = {
    listSupportingDocuments: tool({
      description: "List the read-only supporting documents available for use as evidence.",
      inputSchema: z.object({}),
      execute: async () =>
        supportingDocuments.map(({ id, name, date, student }) => ({
          id,
          name,
          date,
          student,
        })),
    }),
    readSupportingDocument: tool({
      description: "Read one supporting document by its exact id.",
      inputSchema: z.object({ id: z.string() }),
      execute: async ({ id }) => {
        const document = findSupportingDocument(id);
        return document ? document : { error: `Supporting document ${id} was not found.` };
      },
    }),
  };

  const mentionContext = mentionedDocuments.length
    ? `\nThe user explicitly mentioned these supporting documents in the latest message. Treat them as read-only evidence:\n<mentioned_supporting_documents>\n${mentionedDocuments
        .map(serializeSupportingDocument)
        .join("\n")}\n</mentioned_supporting_documents>`
    : "";

  const model = wrapLanguageModel({
    model: openai("gpt-5.6-luna"),
    middleware: process.env.NODE_ENV === "production" ? [] : devToolsMiddleware(),
  });
  const agent = new ToolLoopAgent({
    model,
    instructions: `You are an assistant that edits rich text documents with tracked changes and linked Tiptap comments.
Be concise in user-facing messages. Before tools, summarize the intended action in one short sentence. After completion, respond in one short sentence.
Rule: Always use tiptapRead before tiptapEdit.
Rule: Never reveal tool internals, hashes, raw document JSON, or comment implementation details.
Rule: For every tiptapEdit, put a brief improvement justification in the meta field and do not repeat it in chat.
Rule: Supporting documents are read-only. Never claim to edit them or invent evidence beyond their contents.
${mentionContext}

${toolkit.systemPrompt}`,
    tools: { ...editorTools, ...supportingDocumentTools },
  });

  return createAgentUIStreamResponse({ agent, uiMessages: body.messages });
}
