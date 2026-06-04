"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, Users, Bot, Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, timeAgo } from "@/lib/utils";
import type { NoteType } from "@/types";

const NOTE_ICONS: Record<NoteType, React.ReactNode> = {
  meeting: <Users size={14} />,
  call: <Phone size={14} />,
  feedback: <MessageSquare size={14} />,
  system: <Bot size={14} />,
};

const NOTE_COLORS: Record<NoteType, string> = {
  meeting: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  call: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  feedback: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  system: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

export function NotesTimeline({ clientId }: { clientId: string }) {
  const { getNotesForClient, addNote } = useAppStore();
  const notes = getNotesForClient(clientId);
  const [showForm, setShowForm] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>("call");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    addNote({ clientId, matchmakerId: "MM_001", type: noteType, content: content.trim() });
    setContent("");
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} />
          Add Note
        </Button>
      </div>

      {/* Add Note Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                {(["call", "meeting", "feedback"] as NoteType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNoteType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      noteType === type
                        ? NOTE_COLORS[type]
                        : "text-zinc-500 border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    {NOTE_ICONS[type]}
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
              <Textarea
                rows={3}
                placeholder="Write your note here…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} loading={saving} disabled={!content.trim()}>
                  Save Note
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="space-y-0">
        {notes.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-8">No notes yet. Add your first note!</p>
        )}
        {notes.map((note, i) => (
          <div key={note.id} className="flex gap-4 relative">
            {/* Line */}
            {i < notes.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-zinc-800" />
            )}

            {/* Icon */}
            <div className={`relative z-10 h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${NOTE_COLORS[note.type]}`}>
              {NOTE_ICONS[note.type]}
            </div>

            {/* Content */}
            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-zinc-300 capitalize">{note.type}</span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">{timeAgo(note.createdAt)}</span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-600">{formatDate(note.createdAt)}</span>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3">
                <p className="text-sm text-zinc-300 leading-relaxed">{note.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
