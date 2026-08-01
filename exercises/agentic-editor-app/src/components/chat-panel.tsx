"use client";

import Document from "@tiptap/extension-document";
import type { JSONContent } from "@tiptap/core";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import type { UIMessage } from "ai";
import { Bot, LoaderCircle, MessageSquare, Send, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { createSupportingDocumentMention } from "./mention-extension";

export type ChatSubmission = { text: string; mentionedDocumentIds: string[] };

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export function extractMentionIds(json: JSONContent) {
  const ids = new Set<string>();
  const visit = (node: JSONContent) => {
    if (node.type === "mention" && typeof node.attrs?.id === "string") ids.add(node.attrs.id);
    node.content?.forEach(visit);
  };
  visit(json);
  return [...ids];
}

export function ChatPanel({
  messages,
  isLoading,
  resetKey,
  onSubmit,
}: {
  messages: UIMessage[];
  isLoading: boolean;
  resetKey: number;
  onSubmit: (submission: ChatSubmission) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [Document, Paragraph, Text, createSupportingDocumentMention()],
    content: "",
    editorProps: {
      attributes: {
        class: "chat-composer-editor",
        "aria-label": "Ask the AI to edit the document",
        role: "textbox",
      },
    },
  });

  const submit = () => {
    if (!editor || isLoading) return;
    const text = editor.getText().trim();
    if (!text) return;
    onSubmit({ text, mentionedDocumentIds: extractMentionIds(editor.getJSON()) });
    editor.commands.clearContent();
  };

  useEffect(() => {
    editor?.commands.clearContent();
  }, [editor, resetKey]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div className="chat-panel">
      <div className="chat-messages" ref={scrollRef} aria-live="polite">
        {!messages.length && !isLoading ? (
          <div className="empty-state">
            <MessageSquare size={24} />
            <p>Send a message to start</p>
            <span>Type @ to mention supporting documents.</span>
          </div>
        ) : null}
        {messages.map((message) => {
          const text = messageText(message);
          if (!text) return null;
          const isUser = message.role === "user";
          return (
            <div className={`chat-message${isUser ? " is-user" : ""}`} key={message.id}>
              <span className="chat-avatar">{isUser ? <User size={14} /> : <Bot size={14} />}</span>
              <div>{text}</div>
            </div>
          );
        })}
        {isLoading ? (
          <div className="chat-message">
            <span className="chat-avatar">
              <Bot size={14} />
            </span>
            <div className="thinking">
              <i />
              <i />
              <i />
            </div>
          </div>
        ) : null}
      </div>
      <div className="chat-composer">
        <div
          className="chat-composer-frame"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !document.querySelector(".mention-popover")
            ) {
              event.preventDefault();
              submit();
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
        <button className="primary-button" type="button" disabled={isLoading} onClick={submit}>
          {isLoading ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
          {isLoading ? "Processing…" : "Send"}
        </button>
      </div>
    </div>
  );
}
