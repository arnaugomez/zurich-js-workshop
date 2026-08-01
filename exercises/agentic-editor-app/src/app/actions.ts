"use server";

import jwt from "jsonwebtoken";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import { getDocumentName } from "@/lib/document-id";

export async function generateDocumentSlug(): Promise<string> {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    length: 2,
    separator: "-",
    style: "lowerCase",
  });
}

export async function getCollabConfig(
  userId: string,
  slug: string,
): Promise<{ token: string; appId: string; collabBaseUrl?: string }> {
  const documentName = getDocumentName(slug);
  const privateKey = process.env.TIPTAP_AUTH_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const environmentId = process.env.TIPTAP_AUTH_ENVIRONMENT_ID;
  const documentServerId = process.env.TIPTAP_CLOUD_DOCUMENT_SERVER_ID;
  const collabBaseUrl = process.env.TIPTAP_CLOUD_COLLAB_BASE_URL;

  if (!privateKey) throw new Error("TIPTAP_AUTH_PRIVATE_KEY is not configured");
  if (!environmentId) throw new Error("TIPTAP_AUTH_ENVIRONMENT_ID is not configured");
  if (!documentServerId) throw new Error("TIPTAP_CLOUD_DOCUMENT_SERVER_ID is not configured");

  const token = jwt.sign(
    { permissions: [{ action: "Documents:Write", resource: documentName }] },
    privateKey,
    {
      algorithm: "ES256",
      audience: ["Documents"],
      expiresIn: "30m",
      issuer: environmentId,
      subject: userId,
    },
  );

  return {
    token,
    appId: documentServerId,
    ...(collabBaseUrl ? { collabBaseUrl } : {}),
  };
}
