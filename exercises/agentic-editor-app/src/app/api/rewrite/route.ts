import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import { buildRewritePrompt, preserveTrailingPunctuation } from "@/lib/rewrite";

const requestSchema = z.object({
  task: z.enum(["summarize", "expand", "rephrase", "proofread"]),
  text: z.string().min(1).max(20_000),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid rewrite request." }, { status: 400 });

  try {
    if (process.env.MOCK_RESPONSE === "true")
      return Response.json({
        text: preserveTrailingPunctuation(parsed.data.text, "MOCK RESPONSE"),
      });
    const result = await generateText({
      model: openai("gpt-5.4-nano"),
      prompt: buildRewritePrompt(parsed.data.task, parsed.data.text),
    });
    return Response.json({
      text: preserveTrailingPunctuation(parsed.data.text, result.text),
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not rewrite the selected text." }, { status: 500 });
  }
}
