"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, RotateCcw, MessageCircle } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { CopilotMessage } from "@/types";

const SUGGESTIONS = [
  "Who needs a follow-up this week?",
  "Which clients are ready to be matched now?",
  "Summarize my active pipeline",
  "What concerns should I discuss with clients?",
  "Draft an introduction email for a match",
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
  const hasMessages = copilotMessages.length > 0;

  useEffect(() => {
    if (copilotOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [copilotMessages, copilotOpen]);

  function buildContext(): string {
    const parts: string[] = [];
    const clientId = copilotContext?.clientId;
    if (clientId) {
      const c = getClient(clientId);
      if (c) parts.push(`VIEWING: ${c.firstName} ${c.lastName}, ${c.age}y, ${c.designation} at ${c.currentCompany}, readiness ${c.relationshipReadinessScore}/100`);
    }
    parts.push(`PIPELINE: ${clients.length} total, ${clients.filter(c => c.clientStatus === "active").length} active, ${clients.filter(c => c.clientStatus === "matched").length} matched`);
    return parts.join("\n");
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: CopilotMessage = {
      id: `${Date.now()}`, role: "user", content: msg, timestamp: new Date().toISOString(),
    };
    const loadingMsg: CopilotMessage = {
      id: `${Date.now()}_l`, role: "assistant", content: "", timestamp: new Date().toISOString(), isLoading: true,
    };
    addCopilotMessage(userMsg);
    addCopilotMessage(loadingMsg);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...copilotMessages, userMsg]
            .filter(m => !m.isLoading)
            .map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      });
      const data = await res.json();
      useAppStore.setState(s => ({
        copilotMessages: s.copilotMessages.filter(m => !m.isLoading).concat({
          id: `${Date.now()}_r`, role: "assistant",
          content: data.message ?? "Sorry, something went wrong.",
          timestamp: new Date().toISOString(),
        }),
      }));
    } catch {
      useAppStore.setState(s => ({
        copilotMessages: s.copilotMessages.filter(m => !m.isLoading).concat({
          id: `${Date.now()}_e`, role: "assistant",
          content: "Network error. Please try again.",
          timestamp: new Date().toISOString(),
        }),
      }));
    }
    setLoading(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat popup */}
      {copilotOpen && (
        <div className="animate-chat-popup w-[calc(100vw-40px)] max-w-90 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-900/15 flex flex-col overflow-hidden"
          style={{ maxHeight: "min(520px, calc(100dvh - 100px))" }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="h-7 w-7 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-tight">AI Assistant</p>
              {copilotContext?.clientId && (
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                  Context: {getClient(copilotContext.clientId)?.firstName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              {hasMessages && (
                <button
                  onClick={clearCopilotMessages}
                  title="Clear chat"
                  className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw size={12} />
                </button>
              )}
              <button
                onClick={() => setCopilotOpen(false)}
                className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages / Suggestions */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!hasMessages ? (
              /* Welcome + suggestion chips */
              <div className="p-4">
                <div className="flex items-start gap-2.5 mb-4">
                  <div className="h-7 w-7 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl rounded-tl-sm px-3.5 py-2.5">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Hi! I'm your matchmaking assistant. I can help you manage clients, evaluate matches, and draft communications. What would you like to know?
                    </p>
                  </div>
                </div>

                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-0.5">
                  Suggested questions
                </p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-xs text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg px-3 py-2 transition-colors leading-snug"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation */
              <div className="p-4 space-y-3">
                {copilotMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    {msg.role === "assistant" && (
                      <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={11} className="text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[84%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-gray-900 text-white rounded-tr-sm"
                        : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm"
                    )}>
                      {msg.isLoading ? (
                        <div className="flex gap-1 py-0.5 items-center">
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">
                          {msg.content.split(/(\*\*.*?\*\*)/g).map((p, i) =>
                            p.startsWith("**") && p.endsWith("**")
                              ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
                              : <span key={i}>{p}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 shrink-0">
            <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none min-h-5 max-h-20"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="h-7 w-7 rounded-lg bg-gray-900 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={12} className="text-white" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setCopilotOpen(!copilotOpen)}
        className={cn(
          "h-14 w-14 rounded-full bg-gray-900 text-white shadow-xl shadow-gray-900/30",
          "flex items-center justify-center hover:bg-gray-800 transition-colors",
          !copilotOpen && "animate-chatbot-bounce"
        )}
        title="AI Assistant"
        aria-label="Open AI Assistant"
      >
        {copilotOpen
          ? <X size={20} />
          : <MessageCircle size={22} className="fill-white/15" />
        }
      </button>
    </div>
  );
}
