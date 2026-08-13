"use client";

import { useChat } from "@ai-sdk/react";
import { getEditorContext, ServerAiToolkit } from "@tiptap/ai-toolkit";
import type { JSONContent } from "@tiptap/core";
import { Collaboration } from "@tiptap/extension-collaboration";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Selection } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { CommentsKit, subscribeToThreads } from "@tiptap-pro/extension-comments";
import {
  findSuggestions,
  type Suggestion,
  TrackedChanges,
} from "@tiptap-pro/extension-tracked-changes";
import { TiptapCollabProvider } from "@tiptap-pro/provider";
import { DefaultChatTransport } from "ai";
import { WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as Y from "yjs";
import { generateDocumentSlug, getCollabConfig } from "@/app/actions";
import { initialReport } from "@/data/initial-content";
import { getDocumentName } from "@/lib/document-id";
import {
  insertAiRewrite,
  requestAiRewrite,
  rewriteTasks,
  type RewriteRequest,
  updateRewriteRange,
} from "@/lib/rewrite";
import { getUniqueSuggestions } from "@/lib/suggestion-utils";
import { ChatPanel, type ChatSubmission } from "./chat-panel";
import {
  CommentsPanel,
  type CommentThread,
  SuggestionsPanel,
  SupportingDocumentsPanel,
  TrackedChangesPanel,
} from "./review-panels";

type PanelId = "chat" | "tracked" | "comments" | "suggestions" | "documents";
const panels: Array<{ id: PanelId; label: string }> = [
  { id: "chat", label: "Chat" },
  { id: "tracked", label: "Changes" },
  { id: "comments", label: "Comments" },
  { id: "suggestions", label: "Ideas" },
  { id: "documents", label: "Docs" },
];

const rewriteMenuOptions = {
  placement: "top" as const,
  offset: 8,
  flip: true,
  shift: true,
  inline: true,
};

const showRewriteMenu = ({ state }: { state: { selection: { empty: boolean } } }) =>
  !state.selection.empty;

const demoUser = {
  id: "workshop-user",
  name: "Workshop User",
  avatarUrl: "https://i.pravatar.cc/150?u=workshop-user",
};

export function EditorApp({ slug }: { slug: string }) {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const documentName = getDocumentName(slug);

  useEffect(() => {
    let active = true;
    let collabProvider: TiptapCollabProvider | null = null;
    void getCollabConfig(demoUser.id, slug)
      .then(({ token, appId, collabBaseUrl }) => {
        if (!active) return;
        collabProvider = new TiptapCollabProvider({
          ...(collabBaseUrl ? { baseUrl: collabBaseUrl } : { appId }),
          name: documentName,
          token,
          document: doc,
          user: demoUser.id,
        });
        setProvider(collabProvider);
      })
      .catch((setupError) => {
        setError(
          setupError instanceof Error ? setupError.message : "Could not connect to collaboration.",
        );
      });
    return () => {
      active = false;
      collabProvider?.destroy();
      doc.destroy();
    };
  }, [doc, documentName, slug]);

  if (error)
    return (
      <main className="centered-state">
        <h1>Could not open the document</h1>
        <p>{error}</p>
      </main>
    );
  if (!provider)
    return (
      <main className="centered-state" aria-busy="true">
        <span className="spinner large" />
        <p>Loading collaboration document…</p>
      </main>
    );

  return <CollaborativeEditor doc={doc} provider={provider} slug={slug} />;
}

function CollaborativeEditor({
  doc,
  provider,
  slug,
}: {
  doc: Y.Doc;
  provider: TiptapCollabProvider;
  slug: string;
}) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<PanelId>("chat");
  const [trackedSuggestions, setTrackedSuggestions] = useState<Suggestion[]>([]);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [composerResetKey, setComposerResetKey] = useState(0);
  const pendingRewrite = useRef<RewriteRequest | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [reviewTooltip, setReviewTooltip] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const previousDocument = useRef<JSONContent | null>(null);
  const pendingBaseline = useRef<JSONContent | null>(null);
  const suggestionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionRequest = useRef(0);
  const mentionedIdsRef = useRef<string[]>([]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ undoRedo: false, link: false }),
      Link.configure({ openOnClick: false }),
      Selection,
      Collaboration.configure({ document: doc }),
      ServerAiToolkit,
      TrackedChanges.configure({
        enabled: false,
        userId: demoUser.id,
        userMetadata: { name: demoUser.name, avatarUrl: demoUser.avatarUrl },
      }),
      CommentsKit.configure({
        provider,
        onClickThread: (threadId: string | null) => {
          setSelectedThread(threadId);
          if (threadId)
            editor?.chain().selectThread({ id: threadId, updateSelection: false }).run();
          else editor?.chain().unselectThread().run();
        },
      }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editorProps: {
      attributes: {
        class: "document-editor",
        "aria-label": "Student progress report editor",
        role: "textbox",
        spellcheck: "true",
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      previousDocument.current = currentEditor.getJSON();
      setTrackedSuggestions(getUniqueSuggestions(findSuggestions(currentEditor, "suggestion")));
    },
    onUpdate: ({ editor: currentEditor }) => {
      setTrackedSuggestions(getUniqueSuggestions(findSuggestions(currentEditor, "suggestion")));
      queueSuggestions(currentEditor.getJSON());
    },
    onTransaction: ({ editor: currentEditor, transaction }) => {
      if (pendingRewrite.current)
        updateRewriteRange(currentEditor, pendingRewrite.current, transaction);
    },
  });

  function requestSuggestions(previous: JSONContent, current: JSONContent) {
    const requestId = ++suggestionRequest.current;
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    void fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previousDocument: previous, document: current }),
    })
      .then(async (response) => {
        const body = (await response.json()) as { suggestions?: string[]; error?: string };
        if (!response.ok || !Array.isArray(body.suggestions))
          throw new Error(body.error || "Could not generate suggestions.");
        if (requestId === suggestionRequest.current) setSuggestions(body.suggestions);
      })
      .catch((requestError) => {
        if (requestId === suggestionRequest.current)
          setSuggestionsError(
            requestError instanceof Error
              ? requestError.message
              : "Could not generate suggestions.",
          );
      })
      .finally(() => {
        if (requestId === suggestionRequest.current) setSuggestionsLoading(false);
      });
  }

  function queueSuggestions(current: JSONContent) {
    if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current);
    const baseline = pendingBaseline.current ?? previousDocument.current ?? current;
    pendingBaseline.current = baseline;
    previousDocument.current = current;
    setSuggestionsLoading(true);
    suggestionsTimer.current = setTimeout(() => {
      pendingBaseline.current = null;
      requestSuggestions(baseline, current);
    }, 2_000);
  }

  useEffect(() => {
    if (!editor) return;
    const initialize = ({ state = true }: { state?: boolean } = {}) => {
      if (!state) return;
      if (editor.isEmpty) editor.commands.setContent(initialReport);
      const current = editor.getJSON();
      previousDocument.current = current;
      requestSuggestions(current, current);
    };
    if (provider.isSynced) initialize();
    provider.on("synced", initialize);
    return () => {
      provider.off("synced", initialize);
    };
  }, [editor, provider]);

  useEffect(() => {
    const unsubscribe = subscribeToThreads({
      provider,
      callback: (currentThreads) => setThreads(currentThreads as CommentThread[]),
    });
    return () => {
      unsubscribe();
    };
  }, [provider]);

  useEffect(() => {
    if (!editor) return;
    const handleClick = (event: MouseEvent) => {
      const position = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (!position) {
        setReviewTooltip(null);
        return;
      }
      const suggestion = findSuggestions(editor, "suggestion").find(
        (item) => position.pos >= item.from && position.pos <= item.to,
      );
      if (!suggestion) {
        setReviewTooltip(null);
        return;
      }
      const coordinates = editor.view.coordsAtPos(suggestion.to);
      setReviewTooltip({ id: suggestion.id, x: coordinates.left, y: coordinates.top });
    };
    const element = editor.view.dom;
    element.addEventListener("click", handleClick);
    return () => element.removeEventListener("click", handleClick);
  }, [editor]);

  useEffect(
    () => () => {
      if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current);
      suggestionRequest.current += 1;
    },
    [],
  );

  const editorContext = editor ? getEditorContext(editor) : null;
  const editorContextRef = useRef(editorContext);
  editorContextRef.current = editorContext;
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
      body: () => ({
        editorContext: editorContextRef.current,
        documentSlug: slug,
        mentionedDocumentIds: mentionedIdsRef.current,
      }),
    }),
  });

  const createThread = useCallback(() => {
    if (!editor || editor.state.selection.empty) return;
    const content = window.prompt("Comment content");
    if (!content?.trim()) return;
    editor
      .chain()
      .focus()
      .setThread({
        content: content.trim(),
        commentData: { userName: demoUser.name, avatarUrl: demoUser.avatarUrl },
      })
      .run();
  }, [editor]);

  const reasonBySuggestionId = useMemo(
    () =>
      Object.fromEntries(
        threads
          .filter(
            (thread) =>
              typeof thread.data?.suggestionId === "string" &&
              typeof thread.data?.suggestionReason === "string",
          )
          .map((thread) => [thread.data!.suggestionId, thread.data!.suggestionReason]),
      ),
    [threads],
  );

  async function handleRewrite(task: (typeof rewriteTasks)[number]) {
    if (!editor || editor.state.selection.empty) return;
    const request = requestAiRewrite(task, editor, editor.state.selection);
    pendingRewrite.current = request;
    setRewriteLoading(true);
    setRewriteError(null);
    try {
      await insertAiRewrite(editor, request);
    } catch (error) {
      setRewriteError(error instanceof Error ? error.message : "Could not rewrite selected text.");
    } finally {
      if (pendingRewrite.current === request) {
        pendingRewrite.current = null;
        setRewriteLoading(false);
      }
    }
  }

  async function resetApp() {
    setResetting(true);
    try {
      const nextSlug = await generateDocumentSlug();
      setMessages([]);
      mentionedIdsRef.current = [];
      setComposerResetKey((value) => value + 1);
      router.replace(`/?document=${encodeURIComponent(nextSlug)}`);
    } finally {
      setResetting(false);
    }
  }

  if (!editor) return null;
  const chatLoading = status !== "ready";

  return (
    <div className="app-shell">
      <main className="workspace">
        <EditorToolbar
          editor={editor}
          hasSelection={!editor.state.selection.empty}
          resetting={resetting}
          onComment={createThread}
          onReset={() => void resetApp()}
        />
        <div className="editor-scroll">
          <EditorContent editor={editor} />
          {reviewTooltip
            ? createPortal(
                <div
                  className="review-tooltip"
                  style={{ left: reviewTooltip.x, top: reviewTooltip.y }}
                >
                  {reasonBySuggestionId[reviewTooltip.id] ? (
                    <p>{reasonBySuggestionId[reviewTooltip.id]}</p>
                  ) : null}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        editor.commands.acceptSuggestion({ id: reviewTooltip.id });
                        setReviewTooltip(null);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.commands.rejectSuggestion({ id: reviewTooltip.id });
                        setReviewTooltip(null);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>,
                document.body,
              )
            : null}
          {rewriteError ? (
            <p className="editor-error" role="alert">
              {rewriteError}
            </p>
          ) : null}
          <BubbleMenu
            editor={editor}
            updateDelay={0}
            shouldShow={showRewriteMenu}
            options={rewriteMenuOptions}
          >
            <div className="rewrite-menu">
              <span>
                <WandSparkles size={14} />
                {rewriteLoading ? "Rewriting…" : "AI rewrite"}
              </span>
              {rewriteTasks.map((task) => (
                <button
                  type="button"
                  disabled={rewriteLoading}
                  key={task}
                  onClick={() => void handleRewrite(task)}
                >
                  {task}
                </button>
              ))}
            </div>
          </BubbleMenu>
        </div>
      </main>
      <aside className="sidebar">
        <div className="sidebar-tabs">
          <div className="sidebar-toggle" role="tablist" aria-label="Editor panels">
            {panels.map((panel) => (
              <button
                role="tab"
                aria-selected={activePanel === panel.id}
                className={activePanel === panel.id ? "active" : ""}
                key={panel.id}
                type="button"
                onClick={() => setActivePanel(panel.id)}
              >
                {panel.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-content">
          {activePanel === "chat" ? (
            <ChatPanel
              messages={messages}
              isLoading={chatLoading}
              resetKey={composerResetKey}
              onSubmit={(submission: ChatSubmission) => {
                mentionedIdsRef.current = submission.mentionedDocumentIds;
                void sendMessage({ text: submission.text });
              }}
            />
          ) : null}
          {activePanel === "tracked" ? (
            <TrackedChangesPanel
              editor={editor}
              suggestions={trackedSuggestions}
              reasons={reasonBySuggestionId}
            />
          ) : null}
          {activePanel === "comments" ? (
            <CommentsPanel
              editor={editor}
              provider={provider}
              threads={threads}
              selectedThread={selectedThread}
              showResolved={showResolved}
              onShowResolved={setShowResolved}
              onCreate={createThread}
              onSelect={(id) => {
                setSelectedThread(id);
                editor.chain().selectThread({ id, scrollIntoView: true }).run();
              }}
            />
          ) : null}
          {activePanel === "suggestions" ? (
            <SuggestionsPanel
              suggestions={suggestions}
              loading={suggestionsLoading}
              error={suggestionsError}
            />
          ) : null}
          {activePanel === "documents" ? <SupportingDocumentsPanel /> : null}
        </div>
      </aside>
    </div>
  );
}

function ToolbarButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? "active" : ""}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EditorToolbar({
  editor,
  hasSelection,
  resetting,
  onComment,
  onReset,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>;
  hasSelection: boolean;
  resetting: boolean;
  onComment: () => void;
  onReset: () => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      strike: current.isActive("strike"),
      code: current.isActive("code"),
      bullets: current.isActive("bulletList"),
      numbers: current.isActive("orderedList"),
      quote: current.isActive("blockquote"),
      codeBlock: current.isActive("codeBlock"),
      paragraph: current.isActive("paragraph"),
      h1: current.isActive("heading", { level: 1 }),
      h2: current.isActive("heading", { level: 2 }),
      h3: current.isActive("heading", { level: 3 }),
      link: current.isActive("link"),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
      tracking: Boolean(
        (current.storage as { trackedChanges?: { enabled?: boolean } }).trackedChanges?.enabled,
      ),
    }),
  });
  const run = () => editor.chain().focus();
  const toggleLink = () => {
    const href = window.prompt("Enter link URL", editor.getAttributes("link").href ?? "");
    if (href === null) return;
    if (!href.trim()) run().unsetLink().run();
    else run().setLink({ href: href.trim() }).run();
  };
  return (
    <nav className="editor-toolbar" aria-label="Document formatting">
      <ToolbarButton active={state.paragraph} onClick={() => run().setParagraph().run()}>
        Paragraph
      </ToolbarButton>
      <ToolbarButton active={state.h1} onClick={() => run().toggleHeading({ level: 1 }).run()}>
        H1
      </ToolbarButton>
      <ToolbarButton active={state.h2} onClick={() => run().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton active={state.h3} onClick={() => run().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <ToolbarButton active={state.bold} onClick={() => run().toggleBold().run()}>
        Bold
      </ToolbarButton>
      <ToolbarButton active={state.italic} onClick={() => run().toggleItalic().run()}>
        Italic
      </ToolbarButton>
      <ToolbarButton active={state.strike} onClick={() => run().toggleStrike().run()}>
        Strike
      </ToolbarButton>
      <ToolbarButton active={state.code} onClick={() => run().toggleCode().run()}>
        Code
      </ToolbarButton>
      <ToolbarButton active={state.link} onClick={toggleLink}>
        Link
      </ToolbarButton>
      <ToolbarButton active={state.bullets} onClick={() => run().toggleBulletList().run()}>
        Bullets
      </ToolbarButton>
      <ToolbarButton active={state.numbers} onClick={() => run().toggleOrderedList().run()}>
        Numbered
      </ToolbarButton>
      <ToolbarButton active={state.quote} onClick={() => run().toggleBlockquote().run()}>
        Quote
      </ToolbarButton>
      <ToolbarButton active={state.codeBlock} onClick={() => run().toggleCodeBlock().run()}>
        Code block
      </ToolbarButton>
      <ToolbarButton onClick={() => run().setHorizontalRule().run()}>Divider</ToolbarButton>
      <ToolbarButton active={state.tracking} onClick={() => editor.commands.toggleTrackedChanges()}>
        Track changes {state.tracking ? "on" : "off"}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const content = window.prompt("Text to insert");
          if (content?.trim())
            editor.commands.addTrackedInsertion({
              from: editor.state.selection.from,
              content: content.trim(),
            });
        }}
      >
        Add insertion
      </ToolbarButton>
      <ToolbarButton
        disabled={!hasSelection}
        onClick={() => {
          const { from, to } = editor.state.selection;
          editor.commands.addTrackedDeletion({ from, to });
        }}
      >
        Add deletion
      </ToolbarButton>
      <ToolbarButton
        disabled={!hasSelection}
        onClick={() => {
          const content = window.prompt("Replacement text");
          const { from, to } = editor.state.selection;
          if (content?.trim())
            editor.commands.addTrackedReplacement({ from, to, content: content.trim() });
        }}
      >
        Add replacement
      </ToolbarButton>
      <ToolbarButton disabled={!hasSelection} onClick={onComment}>
        Comment
      </ToolbarButton>
      <ToolbarButton disabled={!state.canUndo} onClick={() => run().undo().run()}>
        Undo
      </ToolbarButton>
      <ToolbarButton disabled={!state.canRedo} onClick={() => run().redo().run()}>
        Redo
      </ToolbarButton>
      <ToolbarButton disabled={resetting} onClick={onReset}>
        {resetting ? "Resetting…" : "Reset app"}
      </ToolbarButton>
    </nav>
  );
}
