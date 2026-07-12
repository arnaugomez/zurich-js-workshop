import type { RewriteTask } from "../exercise/buildRewritePrompt.js";

const taskInstructions: Record<RewriteTask, string> = {
  summarize: "Summarize the text while preserving its key information.",
  expand: "Expand the text with useful detail while preserving its meaning.",
  rephrase: "Rephrase the text for clarity while preserving its meaning.",
  proofread:
    "Proofread the text, correcting grammar, spelling, and punctuation.",
};

export function buildRewritePrompt(task: RewriteTask, text: string): string {
  const taskInstruction = taskInstructions[task];
  return `You are a precise text editor. Re-write the provided text to accomplish the task.
<text>${text}</text>
<task>${taskInstruction}</task>
Your response should be the re-written text. Your response should not contain any "<text>" or "<task>" tags and it shoud not contain HTML tags. Your response should not include any additional commentary apart from the re-written text. Your response should only be the re-written text`;
}
