"use client";

import { useState } from "react";
import { Bot, Send, Loader2, Check, Copy } from "lucide-react";

interface AIAssistantProps {
  code: string;
  language: string;
  onApplyCode: (code: string) => void;
}

const AIAssistant = ({ code, language, onApplyCode }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const askAI = async (customPrompt?: string) => {
    const finalPrompt = customPrompt ?? prompt;

    if (!finalPrompt.trim()) {
      return;
    }

    setLoading(true);
    setResponse("");
    setApplied(false);

    try {
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

      setResponse(data.response);
    } catch (error) {
      console.error(error);

      setResponse(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // Extract code from markdown code blocks
  const extractCode = (text: string) => {
    const match = text.match(/```(?:[\w+-]+)?\s*([\s\S]*?)```/);

    if (match?.[1]) {
      return match[1].trim();
    }

    return text.trim();
  };

  const handleApplyCode = () => {
    if (!response) return;

    const extractedCode = extractCode(response);

    onApplyCode(extractedCode);
    setApplied(true);
  };

  const handleCopy = async () => {
    if (!response) return;

    await navigator.clipboard.writeText(response);
  };

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex h-12 items-center gap-2 border-b px-4">
        <Bot className="h-4 w-4" />

        <span className="text-sm font-semibold">AI Assistant</span>
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

      {/* Response */}
      <div className="flex-1 overflow-y-auto p-4">
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

            {/* Actions */}
            <div className="flex gap-2 border-t pt-3">
              <button
                type="button"
                onClick={handleApplyCode}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:opacity-90"
              >
                {applied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Applied
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Apply to Editor
                  </>
                )}
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
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask CodeSync AI about your current file.
          </p>
        )}
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
                askAI();
              }
            }}
            placeholder="Ask about your code..."
            className="min-h-20 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1"
          />

          <button
            type="button"
            onClick={() => askAI()}
            disabled={loading || !prompt.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AIAssistant;
