import type z from "zod";
import { getServerAiToolkitApiBaseUrl, getServerAiToolkitOrigin } from "./config";
import { getTiptapCloudAiJwtToken } from "./token";

export type ToolkitDefinition = {
  name: string;
  description: string;
  inputSchema: z.core.JSONSchema.JSONSchema;
};

export async function getToolkitTools(editorContext: unknown): Promise<{
  systemPrompt: string;
  tools: ToolkitDefinition[];
}> {
  const response = await fetch(`${getServerAiToolkitApiBaseUrl()}/v4/ai/toolkit/fetch-tools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getTiptapCloudAiJwtToken()}`,
    },
    body: JSON.stringify({
      editorContext,
      tools: {
        tiptapRead: true,
        tiptapEdit: {
          meta: "Brief justification explaining why this change improves the document.",
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`Could not load editor tools (${response.status})`);
  return response.json();
}

export async function executeToolkitTool(options: {
  name: string;
  input: unknown;
  editorContext: unknown;
  documentId: string;
}): Promise<unknown> {
  const response = await fetch(`${getServerAiToolkitApiBaseUrl()}/v4/ai/toolkit/execute-tool`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: getServerAiToolkitOrigin(),
      Authorization: `Bearer ${getTiptapCloudAiJwtToken(options.documentId)}`,
    },
    body: JSON.stringify({
      editorContext: options.editorContext,
      document: { type: "cloud", id: options.documentId },
      user: "ai-assistant",
      tool: {
        name: options.name,
        input: options.input,
        config: {
          threadData: { userName: "Tiptap AI" },
          commentData: { userName: "Tiptap AI" },
        },
      },
      reviewOptions: { mode: "trackedChanges" },
    }),
  });
  if (!response.ok) throw new Error(`Editor tool failed (${response.status})`);
  const result = (await response.json()) as { tool: { output: unknown } };
  return result.tool.output;
}
