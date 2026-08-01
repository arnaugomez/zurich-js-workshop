"use client";

import type { Editor } from "@tiptap/react";
import { hoverOffThread, hoverThread } from "@tiptap-pro/extension-comments";
import type { Suggestion } from "@tiptap-pro/extension-tracked-changes";
import type { TiptapCollabProvider } from "@tiptap-pro/provider";
import { Lightbulb } from "lucide-react";
import { supportingDocuments } from "@/data/supporting-documents";
import { getSuggestionPreview } from "@/lib/suggestion-utils";

export type CommentThread = {
  id: string;
  resolvedAt?: string | null;
  data?: Record<string, string>;
  comments?: Array<{ content?: string | null; data?: Record<string, string> }>;
};

export function TrackedChangesPanel({
  editor,
  suggestions,
  reasons,
}: {
  editor: Editor;
  suggestions: Suggestion[];
  reasons: Record<string, string>;
}) {
  return (
    <div className="panel-layout">
      <div className="panel-heading">
        <div>
          <h2>Tracked changes ({suggestions.length})</h2>
          <p>Review pending edits.</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            disabled={!suggestions.length}
            onClick={() => editor.commands.acceptAllSuggestions()}
          >
            Accept all
          </button>
          <button
            type="button"
            disabled={!suggestions.length}
            onClick={() => editor.commands.rejectAllSuggestions()}
          >
            Reject all
          </button>
        </div>
      </div>
      <div className="panel-scroll">
        {!suggestions.length ? <p className="panel-empty">No pending suggestions.</p> : null}
        {suggestions.map((suggestion) => (
          <article className={`review-card is-${suggestion.type}`} key={suggestion.id}>
            {reasons[suggestion.id] ? <p className="reason">{reasons[suggestion.id]}</p> : null}
            <code>{getSuggestionPreview(suggestion)}</code>
            <div className="button-row">
              <button
                type="button"
                onClick={() => editor.commands.acceptSuggestion({ id: suggestion.id })}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => editor.commands.rejectSuggestion({ id: suggestion.id })}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CommentsPanel({
  editor,
  provider,
  threads,
  selectedThread,
  showResolved,
  onSelect,
  onShowResolved,
  onCreate,
}: {
  editor: Editor;
  provider: TiptapCollabProvider;
  threads: CommentThread[];
  selectedThread: string | null;
  showResolved: boolean;
  onSelect: (id: string) => void;
  onShowResolved: (show: boolean) => void;
  onCreate: () => void;
}) {
  const visible = threads.filter((thread) => Boolean(thread.resolvedAt) === showResolved);
  return (
    <div className="panel-layout">
      <div className="panel-heading stacked">
        <div className="heading-row">
          <div>
            <h2>Comments</h2>
            <p>Discuss selected document ranges.</p>
          </div>
          <button type="button" disabled={editor.state.selection.empty} onClick={onCreate}>
            Add comment
          </button>
        </div>
        <div className="segmented two">
          <button
            className={!showResolved ? "active" : ""}
            type="button"
            onClick={() => onShowResolved(false)}
          >
            Open
          </button>
          <button
            className={showResolved ? "active" : ""}
            type="button"
            onClick={() => onShowResolved(true)}
          >
            Resolved
          </button>
        </div>
      </div>
      <div className="panel-scroll">
        {!visible.length ? <p className="panel-empty">No threads.</p> : null}
        {visible.map((thread) => {
          const comment = thread.comments?.find((item) => item.content);
          const author = comment?.data?.userName ?? thread.data?.userName ?? "Comment";
          const preview =
            comment?.content ?? thread.data?.suggestionReason ?? "No comment content.";
          return (
            <article
              className={`review-card${selectedThread === thread.id ? " selected" : ""}`}
              key={thread.id}
              onMouseEnter={() => hoverThread(editor, [thread.id])}
              onMouseLeave={() => hoverOffThread(editor)}
            >
              <button className="comment-select" type="button" onClick={() => onSelect(thread.id)}>
                <strong>{author}</strong>
                <span>{preview}</span>
              </button>
              <div className="button-row">
                <button
                  type="button"
                  onClick={() =>
                    thread.resolvedAt
                      ? editor.commands.unresolveThread({ id: thread.id })
                      : editor.commands.resolveThread({ id: thread.id })
                  }
                >
                  {thread.resolvedAt ? "Reopen" : "Resolve"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.commands.removeThread({ id: thread.id, deleteThread: true });
                    provider.deleteThread(thread.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function SuggestionsPanel({
  suggestions,
  loading,
  error,
}: {
  suggestions: string[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="panel-layout">
      <div className="panel-heading">
        <div>
          <h2>Improvement suggestions</h2>
          <p>Writing support based on recent edits.</p>
        </div>
        {loading ? <span className="spinner" /> : null}
      </div>
      <div className="panel-scroll">
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {!suggestions.length && loading ? (
          <div className="empty-state">
            <span className="spinner large" />
            <p>Reviewing the report…</p>
          </div>
        ) : null}
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={`${index}-${suggestion}`}>
              <Lightbulb size={18} />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SupportingDocumentsPanel() {
  return (
    <div className="panel-layout">
      <div className="panel-heading">
        <div>
          <h2>Supporting documents</h2>
          <p>Read-only evidence available to the AI.</p>
        </div>
      </div>
      <div className="panel-scroll document-cards">
        {supportingDocuments.map((document) => (
          <article className="document-card" key={document.id}>
            <div>
              <strong>{document.student}</strong>
              <time>{document.date}</time>
            </div>
            <h3>{document.activity}</h3>
            <p>{document.summary}</p>
            <span>
              {document.skillArea} · {document.supportLevel}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
