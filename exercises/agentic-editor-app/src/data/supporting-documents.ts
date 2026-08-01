export type SupportingDocument = {
  id: string;
  name: string;
  student: string;
  date: string;
  activity: string;
  skillArea: "communication" | "autonomy" | "participation" | "self-regulation";
  supportLevel: "independent" | "visual cue" | "verbal prompt" | "adult support";
  summary: string;
};

export const supportingDocuments: SupportingDocument[] = [
  {
    id: "note-marc-garden-01",
    name: "Marc: Garden watering routine",
    student: "Marc",
    date: "2026-02-18",
    activity: "Garden watering routine",
    skillArea: "autonomy",
    supportLevel: "visual cue",
    summary:
      "Marc needed visual cues for the first two steps, then watered the plants independently.",
  },
  {
    id: "note-laia-sports-01",
    name: "Laia: Sports turn-taking at Decathlon Mollet",
    student: "Laia",
    date: "2026-03-04",
    activity: "Sports turn-taking at Decathlon Mollet",
    skillArea: "self-regulation",
    supportLevel: "adult support",
    summary:
      "Laia found waiting difficult at first, then completed the transition calmly when paired with Julia.",
  },
  {
    id: "note-arnau-aac-01",
    name: "Arnau: Communication board check-in",
    student: "Arnau",
    date: "2026-03-19",
    activity: "Communication board check-in",
    skillArea: "communication",
    supportLevel: "verbal prompt",
    summary:
      "Arnau used the pictogram board to request a break twice; the second request was spontaneous.",
  },
  {
    id: "note-nora-community-01",
    name: "Nora: Community bakery visit",
    student: "Nora",
    date: "2026-04-09",
    activity: "Community bakery visit",
    skillArea: "participation",
    supportLevel: "visual cue",
    summary:
      "Nora greeted the baker with a gesture and followed the picture sequence to choose bread.",
  },
  {
    id: "note-joel-routine-01",
    name: "Joel: Morning classroom routine",
    student: "Joel",
    date: "2026-04-28",
    activity: "Morning classroom routine",
    skillArea: "autonomy",
    supportLevel: "independent",
    summary:
      "Joel unpacked his folder, placed his bottle on the shelf, and joined the morning circle without prompting.",
  },
  {
    id: "note-ines-collab-01",
    name: "Ines: Shared art activity with primary school group",
    student: "Ines",
    date: "2026-05-12",
    activity: "Shared art activity with primary school group",
    skillArea: "participation",
    supportLevel: "adult support",
    summary:
      "Ines accepted shared materials after an adult modeled the exchange and stayed with the group for ten minutes.",
  },
];

export function findSupportingDocument(id: string): SupportingDocument | undefined {
  return supportingDocuments.find((document) => document.id === id);
}

export function searchSupportingDocuments(query: string): SupportingDocument[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return supportingDocuments;
  return supportingDocuments.filter((document) =>
    [document.name, document.student, document.activity, document.summary]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function serializeSupportingDocument(document: SupportingDocument): string {
  return JSON.stringify({
    id: document.id,
    name: document.name,
    student: document.student,
    date: document.date,
    activity: document.activity,
    skillArea: document.skillArea,
    supportLevel: document.supportLevel,
    summary: document.summary,
  });
}
