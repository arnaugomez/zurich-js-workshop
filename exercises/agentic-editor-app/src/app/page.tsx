import { redirect } from "next/navigation";
import { generateDocumentSlug } from "./actions";
import { EditorApp } from "@/components/editor-app";
import { DOCUMENT_QUERY_PARAM, isDocumentSlug } from "@/lib/document-id";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const value = params[DOCUMENT_QUERY_PARAM];
  const slug = typeof value === "string" ? value : undefined;

  if (!isDocumentSlug(slug)) {
    const nextSlug = await generateDocumentSlug();
    redirect(`/?${DOCUMENT_QUERY_PARAM}=${encodeURIComponent(nextSlug)}`);
  }

  return <EditorApp key={slug} slug={slug} />;
}
