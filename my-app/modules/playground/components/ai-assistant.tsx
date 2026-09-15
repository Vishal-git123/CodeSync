"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Send,
  Loader2,
  Check,
  Copy,
  Plus,
  Trash2,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";

import {
  createAIConversation,
  getAIConversations,
  getAIConversation,
  saveAIMessage,
  deleteAIConversation,
} from "../actions";

interface AIMessage {
  id: string;
  role: string;
  content: string;
  createdAt?: Date;
}

interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface AIAssistantProps {
  code: string;
  language: string;
  playgroundId: string;
  onApplyCode: (code: string) => void;
}

const AIAssistant = ({
  code,
  language,
  playgroundId,
  onApplyCode,
}: AIAssistantProps) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);

  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  const [messages, setMessages] = useState<AIMessage[]>([]);

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  // ==========================================
  // LOAD CHAT HISTORY
  // ==========================================

  const loadConversations = async () => {
    try {
      setHistoryLoading(true);

      const data = await getAIConversations(playgroundId);

      setConversations(data as AIConversation[]);
    } catch (error) {
      console.error("Failed to load AI conversations:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [playgroundId]);

  // ==========================================
  // NEW CHAT
  // ==========================================

  const handleNewChat = async () => {
    try {
      const conversation = await createAIConversation(
        playgroundId,
        "New AI Chat",
      );

      const newConversation: AIConversation = {
        ...conversation,
        messages: [],
      };

      setConversations((current) => [newConversation, ...current]);

      setCurrentConversationId(conversation.id);

      setMessages([]);
      setResponse("");
      setPrompt("");
      setApplied(false);
      setShowHistory(false);
    } catch (error) {
      console.error("Failed to create AI conversation:", error);
    }
  };

  // ==========================================
  // OPEN EXISTING CHAT
  // ==========================================

  const handleOpenConversation = async (conversationId: string) => {
    try {
      const conversation = await getAIConversation(
        playgroundId,
        conversationId,
      );

      if (!conversation) {
        return;
      }

      setCurrentConversationId(conversation.id);

      setMessages(conversation.messages as AIMessage[]);

      const lastAIMessage = conversation.messages
        .filter((message) => message.role === "assistant")
        .at(-1);

      setResponse(lastAIMessage?.content ?? "");

      setPrompt("");
      setApplied(false);
      setShowHistory(false);
    } catch (error) {
      console.error("Failed to open AI conversation:", error);
    }
  };

  // ==========================================
  // DELETE CHAT
  // ==========================================

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmed = window.confirm("Delete this AI conversation?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteAIConversation(playgroundId, conversationId);

      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId),
      );

      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
        setResponse("");
        setPrompt("");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // ==========================================
  // ENSURE CHAT EXISTS
  // ==========================================

  const ensureConversation = async () => {
    if (currentConversationId) {
      return currentConversationId;
    }

    const conversation = await createAIConversation(
      playgroundId,
      "New AI Chat",
    );

    const newConversation: AIConversation = {
      ...conversation,
      messages: [],
    };

    setConversations((current) => [newConversation, ...current]);

    setCurrentConversationId(conversation.id);

    return conversation.id;
  };

  // ==========================================
  // ASK AI
  // ==========================================

  const askAI = async (customPrompt?: string) => {
    const finalPrompt = customPrompt ?? prompt;

    if (!finalPrompt.trim()) {
      return;
    }

    setLoading(true);
    setResponse("");
    setApplied(false);

    try {
      const conversationId = await ensureConversation();

      // Save user message
      const savedUserMessage = await saveAIMessage(
        conversationId,
        "user",
        finalPrompt,
      );

      setMessages((current) => [...current, savedUserMessage as AIMessage]);

      const result = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          code,
          language,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || "AI request failed");
      }

      const aiResponse = data.response;

      setResponse(aiResponse);

      // Save AI message
      const savedAIMessage = await saveAIMessage(
        conversationId,
        "assistant",
        aiResponse,
      );

      setMessages((current) => [...current, savedAIMessage as AIMessage]);

      // Update local history preview
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  savedUserMessage as AIMessage,
                  savedAIMessage as AIMessage,
                ],
              }
            : conversation,
        ),
      );

      setPrompt("");
    } catch (error) {
      console.error("AI error:", error);

      setResponse(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EXTRACT CODE
  // ==========================================

  const extractCode = (text: string) => {
    const match = text.match(/```(?:[\w+-]+)?\s*([\s\S]*?)```/);

    if (match?.[1]) {
      return match[1].trim();
    }

    return text.trim();
  };

  // ==========================================
  // APPLY AI CODE
  // ==========================================

  const handleApplyCode = () => {
    if (!response) {
      return;
    }

    const extractedCode = extractCode(response);

    onApplyCode(extractedCode);

    setApplied(true);
  };

  // ==========================================
  // COPY RESPONSE
  // ==========================================

  const handleCopy = async () => {
    if (!response) {
      return;
    }

    await navigator.clipboard.writeText(response);
  };

  // ==========================================
  // HISTORY VIEW
  // ==========================================

  if (showHistory) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-l bg-background">
        <div className="flex h-12 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />

            <span className="text-sm font-semibold">AI History</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b p-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {historyLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet.
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted ${
                    conversation.id === currentConversationId ? "bg-muted" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenConversation(conversation.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-sm">{conversation.title}</div>

                    <div className="text-[10px] text-muted-foreground">
                      {conversation.messages.length} messages
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ==========================================
  // MAIN AI PANEL
  // ==========================================

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />

          <span className="text-sm font-semibold">AI Assistant</span>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="rounded-md p-1.5 hover:bg-muted"
          title="Chat history"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="border-b p-2">
        <button
          type="button"
          onClick={handleNewChat}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 border-b p-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => askAI("Explain this code step by step.")}
          className="rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
        >
          Explain
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            askAI("Find bugs in this code and provide the corrected code.")
          }
          className="rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
        >
          Fix
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            askAI("Refactor this code and provide the complete improved code.")
          }
          className="rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
        >
          Refactor
        </button>
      </div>

      {/* Conversation Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 && (
          <div className="mb-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-md p-3 ${
                  message.role === "user"
                    ? "ml-4 bg-muted"
                    : "mr-2 border bg-background"
                }`}
              >
                <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
                  {message.role === "user" ? "You" : "CodeSync AI"}
                </div>

                <pre className="whitespace-pre-wrap text-xs leading-5">
                  {message.content}
                </pre>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        ) : response ? (
          <div className="space-y-3">
            <pre className="whitespace-pre-wrap text-sm leading-6">
              {response}
            </pre>

            <div className="flex gap-2 border-t pt-3">
              <button
                type="button"
                onClick={handleApplyCode}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" />

                {applied ? "Applied" : "Apply to Editor"}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask CodeSync AI about your current file.
          </p>
        ) : null}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                if (!loading) {
                  askAI();
                }
              }
            }}
            placeholder="Ask about your code..."
            className="min-h-20 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1"
          />

          <button
            type="button"
            onClick={() => askAI()}
            disabled={loading || !prompt.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AIAssistant;
