import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { JSONContent } from "@tiptap/core";
import { z } from "zod";
import { buildSuggestionsPrompt, documentDiff } from "@/lib/document-diff";

const documentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
});
const requestSchema = z.object({
  previousDocument: documentSchema,
  document: documentSchema,
});
const responseSchema = z.object({
  suggestions: z.array(z.string()).length(3),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid suggestions request." }, { status: 400 });

  try {
    if (process.env.MOCK_RESPONSE === "true")
      return Response.json({
        suggestions: ["MOCK SUGGESTION", "MOCK SUGGESTION", "MOCK SUGGESTION"],
      });
    const previousDocument = parsed.data.previousDocument as JSONContent;
    const document = parsed.data.document as JSONContent;
    const changes = documentDiff(previousDocument, document);
    const result = await generateObject({
      model: openai("gpt-5.4-nano"),
      schema: responseSchema,
      prompt: buildSuggestionsPrompt(document, changes),
    });
    return Response.json(result.object);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not generate suggestions." }, { status: 500 });
  }
}
