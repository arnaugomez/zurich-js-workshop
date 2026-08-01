import jwt from "jsonwebtoken";

type Permission = {
  action: "AI:Toolkit" | "Documents:Write";
  resource: string;
};

export function getTiptapCloudAiJwtToken(documentId?: string): string {
  const privateKey = process.env.TIPTAP_AUTH_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const environmentId = process.env.TIPTAP_AUTH_ENVIRONMENT_ID;
  if (!privateKey) throw new Error("TIPTAP_AUTH_PRIVATE_KEY is not configured");
  if (!environmentId) throw new Error("TIPTAP_AUTH_ENVIRONMENT_ID is not configured");

  const permissions: Permission[] = [{ action: "AI:Toolkit", resource: "*" }];
  if (documentId) permissions.push({ action: "Documents:Write", resource: documentId });

  return jwt.sign({ permissions }, privateKey, {
    algorithm: "ES256",
    audience: documentId ? ["AI", "Documents"] : ["AI"],
    expiresIn: "30m",
    issuer: environmentId,
  });
}
