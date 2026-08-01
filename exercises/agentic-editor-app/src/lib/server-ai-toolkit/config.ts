const DEFAULT_API_URL = "https://api.tiptap.dev";
const DEFAULT_ORIGIN = "http://localhost:3000";

export function getServerAiToolkitApiBaseUrl(): string {
  return process.env.TIPTAP_CLOUD_AI_API_URL || DEFAULT_API_URL;
}

export function getServerAiToolkitOrigin(): string {
  return process.env.TIPTAP_CLOUD_AI_ORIGIN || DEFAULT_ORIGIN;
}
