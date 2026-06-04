"use client";
import { useState } from "react";
import { Phone, Users, MessageSquare, Bot, Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatDate, timeAgo } from "@/lib/utils";
import type { NoteType } from "@/types";

const NOTE_META: Record<NoteType, { icon: React.ElementType; label: string; color: string }> = {
  meeting:  { icon: Users,          label: "Meeting",  color: "bg-blue-100 text-blue-600"   },
  call:     { icon: Phone,          label: "Call",     color: "bg-green-100 text-green-600" },
  feedback: { icon: MessageSquare,  label: "Feedback", color: "bg-amber-100 text-amber-600" },
  system:   { icon: Bot,            label: "System",   color: "bg-gray-100 text-gray-500"   },
};

export function NotesTimeline({ clientId }: { clientId: string }) {
  const { getNotesForClient, addNote } = useAppStore();
  const notes = getNotesForClient(clientId);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<NoteType>("call");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    addNote({ clientId, matchmakerId: "MM_001", type, content: content.trim() });
    setContent("");
    setOpen(false);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
          <Plus size={13} /> Add note
        </Button>
      </div>

      {/* Add note form */}
      {open && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex gap-1.5">
            {(["call", "meeting", "feedback"] as NoteType[]).map((t) => {
              const m = NOTE_META[t];
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    type === t
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <m.icon size={11} /> {m.label}
                </button>
              );
            })}
          </div>
          <Textarea rows={3} placeholder="Write your note…" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={save} loading={saving} disabled={!content.trim()}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {notes.length === 0 && !open && (
          <p className="text-sm text-gray-400 py-8 text-center">No notes yet. Add the first note above.</p>
        )}
        {notes.map((note, i) => {
          const m = NOTE_META[note.type];
          return (
            <div key={note.id} className="flex gap-3 relative">
              {i < notes.length - 1 && (
                <div className="absolute left-4 top-9 bottom-0 w-px bg-gray-200" />
              )}
              <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.color}`}>
                <m.icon size={13} />
              </div>
              <div className="flex-1 pb-5 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-700">{m.label}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(note.createdAt)}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{formatDate(note.createdAt)}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3.5 py-2.5">
                  <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
