import { node } from "@elysia/node";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import OpenAI from "openai";
import {
  buildInitialSuggestionsPrompt,
  buildSuggestionsPrompt,
} from "./solution/buildSuggestionsPrompt.solution.js";
import { documentDiff } from "./solution/documentDiff.solution.js";
import type { DocumentNode } from "./types.js";

const port = Number(process.env.PORT ?? 3001);
const useMockResponse = process.env.MOCK_RESPONSE === "true";
let openai: OpenAI | null = null;

function getOpenAiClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required unless MOCK_RESPONSE=true.");
  }
  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

function parseSuggestions(text: string): string[] {
  const value: unknown = JSON.parse(text);
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    throw new Error("The model did not return an array of suggestions.");
  }
  return value.slice(0, 5);
}

const app = new Elysia({ adapter: node() })
  .use(cors({ origin: "http://localhost:5173" }))
  .post(
    "/api/suggestions",
    async ({ body, set }) => {
      const currentDocument = body.document as DocumentNode;
      const previousDocument = body.previousDocument as DocumentNode;
      const changes = documentDiff(previousDocument, currentDocument);
      if (useMockResponse) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          suggestions: Array.from({ length: 3 }, () => "MOCK SUGGESTION"),
        };
      }

      try {
        const result = await getOpenAiClient().responses.create({
          model: "gpt-5.4-nano",
          input:
            changes.length === 0
              ? buildInitialSuggestionsPrompt(currentDocument)
              : buildSuggestionsPrompt(currentDocument, changes),
        });
        return { suggestions: parseSuggestions(result.output_text) };
      } catch (error) {
        console.error(error);
        set.status = 500;
        return { error: "Could not generate suggestions." };
      }
    },
    {
      body: t.Object({
        previousDocument: t.Object({
          type: t.Literal("doc"),
          content: t.Optional(t.Array(t.Any())),
        }),
        document: t.Object({
          type: t.Literal("doc"),
          content: t.Optional(t.Array(t.Any())),
        }),
      }),
    },
  );

app.listen(port);
console.log(`AI suggestions server listening on http://localhost:${port}`);
