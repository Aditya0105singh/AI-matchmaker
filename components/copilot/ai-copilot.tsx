"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, RotateCcw, Minus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn, timeAgo } from "@/lib/utils";
import type { CopilotMessage } from "@/types";

const QUICK_PROMPTS = [
  "Who needs follow-up this week?",
  "Which clients are ready to be matched?",
  "Summarize my pipeline",
  "What are common concerns to discuss?",
];

export function AICopilot() {
  const {
    copilotOpen, setCopilotOpen, copilotContext,
    copilotMessages, addCopilotMessage, clearCopilotMessages,
    clients, getClient,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (copilotOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [copilotMessages, copilotOpen]);

  function buildContext(): string {
    const parts: string[] = [];
    const clientId = copilotContext?.clientId;
    if (clientId) {
      const c = getClient(clientId);
      if (c) parts.push(`VIEWING CLIENT: ${c.firstName} ${c.lastName}, ${c.age}y, ${c.city}, ${c.designation} at ${c.currentCompany}, readiness ${c.relationshipReadinessScore}/100, ${c.matchCount} matches`);
    }
    parts.push(`PIPELINE: ${clients.length} total, ${clients.filter(c => c.clientStatus === "active").length} active, ${clients.filter(c => c.clientStatus === "matched").length} matched`);
    return parts.join("\n");
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: CopilotMessage = { id: `${Date.now()}`, role: "user", content: msg, timestamp: new Date().toISOString() };
    const loadingMsg: CopilotMessage = { id: `${Date.now()}_l`, role: "assistant", content: "", timestamp: new Date().toISOString(), isLoading: true };
    addCopilotMessage(userMsg);
    addCopilotMessage(loadingMsg);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...copilotMessages, userMsg].filter(m => !m.isLoading).map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      });
      const data = await res.json();
      useAppStore.setState(s => ({
        copilotMessages: s.copilotMessages.filter(m => !m.isLoading).concat({
          id: `${Date.now()}_r`, role: "assistant", content: data.message ?? "Sorry, something went wrong.", timestamp: new Date().toISOString(),
        }),
      }));
    } catch {
      useAppStore.setState(s => ({
        copilotMessages: s.copilotMessages.filter(m => !m.isLoading).concat({
          id: `${Date.now()}_e`, role: "assistant", content: "Network error. Please try again.", timestamp: new Date().toISOString(),
        }),
      }));
    }
    setLoading(false);
  }

  if (!copilotOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-40"
        onClick={() => setCopilotOpen(false)}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-95 z-50 flex flex-col bg-white border-l border-gray-200 shadow-xl animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gray-900 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
              {copilotContext?.clientId && (
                <p className="text-[10px] text-gray-400">
                  Context: {getClient(copilotContext.clientId)?.firstName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {copilotMessages.length > 0 && (
              <button
                onClick={clearCopilotMessages}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Clear conversation"
              >
                <RotateCcw size={13} />
              </button>
            )}
            <button
              onClick={() => setCopilotOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {copilotMessages.length === 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-900 mb-0.5">How can I help?</p>
              <p className="text-xs text-gray-500 mb-4">Ask about clients, matches, or get operational insights.</p>
              <div className="space-y-1.5">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="w-full text-left text-xs px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {copilotMessages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="h-6 w-6 rounded-md bg-gray-900 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Sparkles size={11} className="text-white" />
                </div>
              )}
              <div className={cn(
                "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              )}>
                {msg.isLoading ? (
                  <div className="flex gap-1 py-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">
                    {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                      ) : <span key={i}>{part}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about your clients…"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none max-h-20 min-h-5"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="h-6 w-6 rounded-md bg-gray-900 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={11} className="text-white" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
