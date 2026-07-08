import React, { useState } from "react";
import { format } from "date-fns";
import {
  Gift, Send, CheckCircle2, Clock, Plus, Trash2, Edit3,
  Sparkles, Mail, Heart, Filter, AlertCircle, FileText
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, GiftItem } from "@/types/wedding";

interface ThankYouTrackerViewProps {
  wedding: Wedding;
  gifts: GiftItem[];
  onAddGift: (giftData: Partial<GiftItem>) => void;
  onUpdateGiftStatus: (id: string, status: GiftItem["status"], noteText?: string) => void;
  onRemoveGift: (id: string) => void;
}

export function ThankYouTrackerView({
  wedding,
  gifts,
  onAddGift,
  onUpdateGiftStatus,
  onRemoveGift
}: ThankYouTrackerViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "drafted" | "sent">("all");
  const [guestName, setGuestName] = useState("");
  const [giftDescription, setGiftDescription] = useState("");
  const [noteText, setNoteText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !giftDescription.trim()) return;
    onAddGift({
      guest_name: guestName.trim(),
      gift_item: giftDescription.trim(),
      status: noteText.trim() ? "drafted" : "pending",
      note_text: noteText.trim() || null
    });
    setGuestName("");
    setGiftDescription("");
    setNoteText("");
    setShowForm(false);
  };

  const handleSaveNote = (id: string) => {
    onUpdateGiftStatus(id, editNote.trim() ? "drafted" : "pending", editNote.trim() || undefined);
    setEditingId(null);
  };

  const totalGifts = gifts.length;
  const sentNotes = gifts.filter(g => g.status === "sent").length;
  const draftedNotes = gifts.filter(g => g.status === "drafted").length;
  const pendingNotes = gifts.filter(g => g.status === "pending").length;
  const progressPercent = totalGifts > 0 ? Math.round((sentNotes / totalGifts) * 100) : 0;

  const filteredGifts = gifts.filter(g => {
    if (filterStatus === "all") return true;
    return g.status === filterStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Gift size={13} className="text-primary-container" />
            <span>Gratitude & Registry Governance</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Gift & Thank-You Concierge
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Track received presents, compose bespoke gratitude letters, and monitor acknowledgment dispatches across your guest registry.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Plus size={15} />
          <span>{showForm ? "Close Form" : "Log Received Gift"}</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Total Logged Gifts</span>
          <div className="font-display-lg text-3xl text-ivory font-bold">{totalGifts}</div>
          <p className="text-[11px] text-ivory/40">From registry & cash funds</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400/80">Pending Notes</span>
          <div className="font-display-lg text-3xl text-amber-300 font-bold">{pendingNotes}</div>
          <p className="text-[11px] text-amber-400/50">Requires composition</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400/80">Drafted & Ready</span>
          <div className="font-display-lg text-3xl text-blue-300 font-bold">{draftedNotes}</div>
          <p className="text-[11px] text-blue-400/50">Awaiting postal dispatch</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400/80">Dispatched & Sent</span>
          <div className="font-display-lg text-3xl text-emerald-300 font-bold">{sentNotes} ({progressPercent}%)</div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </GlassCard>
      </div>

      {/* Log Gift Form */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Record Gift & Draft Note</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Guest Name(s) *</label>
              <input
                required
                placeholder="e.g. Aunt Eleanor & Uncle Richard"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Gift Item or Contribution *</label>
              <input
                required
                placeholder="e.g. Waterford Crystal Vase or $500 Honeymoon Fund"
                value={giftDescription}
                onChange={e => setGiftDescription(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Thank You Note Draft (Optional)</label>
              <textarea
                rows={3}
                placeholder="Dear Eleanor & Richard, thank you so much for the exquisite crystal vase! We cannot wait to display it..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="fv-input w-full resize-none text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Log Gift
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-2 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08]">
          {[
            { id: "all" as const, label: "All Gifts", count: totalGifts },
            { id: "pending" as const, label: "Pending Notes", count: pendingNotes },
            { id: "drafted" as const, label: "Drafted Notes", count: draftedNotes },
            { id: "sent" as const, label: "Sent / Completed", count: sentNotes },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                filterStatus === tab.id ? "bg-primary-container text-obsidian font-bold shadow-sm" : "text-ivory/60 hover:text-ivory"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === tab.id ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory/60"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gift Items Table / Cards */}
      {filteredGifts.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <Gift size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Gifts Logged in this Status</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto mb-6">
            Log gifts received before, during, or after your celebration to ensure every guest receives a personalized handwritten note.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredGifts.map((gift) => (
            <GlassCard
              key={gift.id}
              variant="obsidian"
              padding="lg"
              className="border border-white/[0.08] hover:border-white/[0.15] transition duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="font-headline-sm text-xl text-ivory font-bold">{gift.guest_name}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 ${
                      gift.status === "sent" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                      gift.status === "drafted" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" :
                      "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}>
                      {gift.status === "sent" && <CheckCircle2 size={13} />}
                      {gift.status === "drafted" && <FileText size={13} />}
                      {gift.status === "pending" && <Clock size={13} />}
                      <span className="capitalize">{gift.status}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#E8C97A] font-medium pt-0.5">
                    <Gift size={15} className="shrink-0" />
                    <span>Gift Contribution: <strong>{gift.gift_item}</strong></span>
                  </div>

                  {/* Note Section / Editor */}
                  {editingId === gift.id ? (
                    <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2">
                      <textarea
                        rows={3}
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        placeholder="Write your note draft..."
                        className="fv-input w-full text-sm resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="fv-btn-ghost !py-1.5 !px-3 text-xs">Cancel</button>
                        <button onClick={() => handleSaveNote(gift.id)} className="fv-btn-primary !py-1.5 !px-4 text-xs">Save Draft</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] text-sm text-ivory/75 leading-relaxed flex items-start justify-between gap-4">
                      <p className="italic">{gift.note_text || "No note drafted yet. Click 'Draft Note' to compose."}</p>
                      <button
                        onClick={() => { setEditingId(gift.id); setEditNote(gift.note_text || ""); }}
                        className="text-xs font-mono text-primary-container hover:underline shrink-0 flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>{gift.note_text ? "Edit Note" : "Draft Note"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
                  {gift.status !== "sent" && (
                    <button
                      onClick={() => onUpdateGiftStatus(gift.id, "sent")}
                      className="fv-btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 w-full justify-center shadow-md"
                    >
                      <Send size={13} />
                      <span>Mark as Sent</span>
                    </button>
                  )}
                  {gift.status === "sent" && (
                    <button
                      onClick={() => onUpdateGiftStatus(gift.id, "drafted")}
                      className="fv-btn-ghost !py-1.5 !px-3 text-xs text-ivory/60 w-full justify-center"
                    >
                      Revert to Draft
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveGift(gift.id)}
                    className="p-2 rounded-xl text-ivory/40 hover:text-rose-400 hover:bg-rose-500/15 transition"
                    title="Remove Gift Record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
