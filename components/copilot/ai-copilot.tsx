"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Send, Sparkles, RotateCcw, Minimize2, ChevronDown
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import type { CopilotMessage } from "@/types";

const QUICK_PROMPTS = [
  "Who are my top priority clients?",
  "Show clients needing follow-up",
  "What makes a great match?",
  "How is readiness score calculated?",
];

export function AICopilot() {
  const {
    copilotOpen, setCopilotOpen, copilotContext,
    copilotMessages, addCopilotMessage, clearCopilotMessages,
    clients, getClient,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (copilotOpen && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [copilotMessages, copilotOpen, minimized]);

  // Build context string for AI
  function buildContext(): string {
    const parts: string[] = [];
    const clientId = copilotContext?.clientId;

    if (clientId) {
      const client = getClient(clientId);
      if (client) {
        parts.push(`CURRENT CLIENT CONTEXT:
Name: ${client.firstName} ${client.lastName}
Age: ${client.age} | City: ${client.city} | Status: ${client.clientStatus}
Career: ${client.designation} at ${client.currentCompany}
Religion: ${client.religion} | Wants Kids: ${client.wantKids} | Relocate: ${client.openToRelocate}
Match Count: ${client.matchCount} | Readiness: ${client.relationshipReadinessScore}/100
Profile: ${client.profileCompleteness}% complete`);
      }
    }

    const activeCount = clients.filter((c) => c.clientStatus === "active").length;
    parts.push(`DASHBOARD CONTEXT:
Total clients: ${clients.length}
Active: ${activeCount}
Matched: ${clients.filter((c) => c.clientStatus === "matched").length}`);

    return parts.join("\n\n");
  }

  async function sendMessage(text?: string) {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    setInput("");

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    addCopilotMessage(userMsg);
    setLoading(true);

    const loadingMsg: CopilotMessage = {
      id: Date.now().toString() + "_loading",
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isLoading: true,
    };
    addCopilotMessage(loadingMsg);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...copilotMessages, userMsg]
            .filter((m) => !m.isLoading)
            .map((m) => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      });
      const data = await res.json();

      const assistantMsg: CopilotMessage = {
        id: Date.now().toString() + "_resp",
        role: "assistant",
        content: data.message || "I'm sorry, I couldn't process that.",
        timestamp: new Date().toISOString(),
      };

      // Replace loading with real response
      useAppStore.setState((state) => ({
        copilotMessages: state.copilotMessages
          .filter((m) => !m.isLoading)
          .concat(assistantMsg),
      }));
    } catch {
      useAppStore.setState((state) => ({
        copilotMessages: state.copilotMessages
          .filter((m) => !m.isLoading)
          .concat({
            id: Date.now().toString() + "_err",
            role: "assistant",
            content: "Something went wrong. Please try again.",
            timestamp: new Date().toISOString(),
          }),
      }));
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button when closed */}
      <AnimatePresence>
        {!copilotOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setCopilotOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-700 text-white shadow-2xl shadow-fuchsia-900/50 flex items-center justify-center hover:scale-105 transition-transform z-40 animate-pulse-glow"
          >
            <Bot size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Copilot panel */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 w-[380px] z-50 flex flex-col"
            style={{ maxHeight: minimized ? "60px" : "600px" }}
          >
            <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden h-full">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-fuchsia-900/20 to-violet-900/20 shrink-0">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-700 flex items-center justify-center">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100">AI Copilot</p>
                  <p className="text-xs text-zinc-500">
                    {copilotContext?.clientId
                      ? `Context: ${getClient(copilotContext.clientId)?.firstName}`
                      : "TDC Matchmaker Assistant"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {copilotMessages.length > 0 && (
                    <button
                      onClick={clearCopilotMessages}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Clear chat"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setMinimized(!minimized)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {minimized ? <ChevronDown size={13} /> : <Minimize2 size={13} />}
                  </button>
                  <button
                    onClick={() => setCopilotOpen(false)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {!minimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {copilotMessages.length === 0 && (
                      <div className="text-center pt-4">
                        <div className="h-12 w-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-600/20 flex items-center justify-center mx-auto mb-3">
                          <Sparkles size={20} className="text-fuchsia-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300 mb-1">How can I help?</p>
                        <p className="text-xs text-zinc-500">Ask me about clients, matches, or get AI insights.</p>
                        <div className="mt-4 space-y-2">
                          {QUICK_PROMPTS.map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => sendMessage(prompt)}
                              className="w-full text-left text-xs px-3 py-2.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {copilotMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-fuchsia-600 to-violet-700 flex items-center justify-center shrink-0">
                            <Bot size={13} className="text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                            msg.role === "user"
                              ? "bg-fuchsia-600/20 border border-fuchsia-600/20 text-zinc-200"
                              : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-200"
                          )}
                        >
                          {msg.isLoading ? (
                            <div className="flex gap-1.5 items-center py-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="h-1.5 w-1.5 bg-fuchsia-500 rounded-full"
                                  animate={{ y: [-3, 3, -3] }}
                                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                                part.startsWith("**") && part.endsWith("**") ? (
                                  <strong key={i} className="text-zinc-100">
                                    {part.slice(2, -2)}
                                  </strong>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-zinc-800 shrink-0">
                    <div className="flex gap-2 items-end bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-fuchsia-500/50 transition-colors">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your clients…"
                        className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 resize-none focus:outline-none max-h-24 min-h-[24px]"
                        style={{ scrollbarWidth: "none" }}
                      />
                      <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="h-7 w-7 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                      >
                        <Send size={13} className="text-white" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1.5 text-center">
                      Enter to send · Shift+Enter for newline
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
