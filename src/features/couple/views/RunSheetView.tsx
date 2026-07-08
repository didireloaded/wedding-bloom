import React, { useState } from "react";
import {
  Clock, MapPin, UserCheck, Plus, Trash2, Printer, AlertCircle,
  Sparkles, CheckCircle2, ShieldCheck, FileText, Layers
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, RunSheetItem } from "@/types/wedding";

interface RunSheetViewProps {
  wedding: Wedding;
  runSheetItems: RunSheetItem[];
  onAddRunSheetItem: (itemData: Partial<RunSheetItem>) => void;
  onRemoveRunSheetItem: (id: string) => void;
}

export function RunSheetView({
  wedding,
  runSheetItems,
  onAddRunSheetItem,
  onRemoveRunSheetItem
}: RunSheetViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState("30m");
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) return;
    onAddRunSheetItem({
      time: time.trim(),
      duration: duration.trim() || null,
      title: title.trim(),
      owner: owner.trim() || null,
      location: location.trim() || null,
      notes: notes.trim() || null
    });
    setTitle("");
    setOwner("");
    setLocation("");
    setNotes("");
    setShowForm(false);
  };

  const sortedItems = [...runSheetItems].sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08] print:hidden">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-primary-container" />
            <span>Minute-By-Minute Day-Of Choreography</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Master Operations Run Sheet
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Strict timing choreography for wedding planners, vendors, and coordinators. Ensure every arrival, soundcheck, and transition executes flawlessly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="fv-btn-ghost !py-2.5 !px-4 text-xs inline-flex items-center gap-2"
          >
            <Printer size={15} />
            <span>Print Production Sheet</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 shadow-lg"
          >
            <Plus size={15} />
            <span>{showForm ? "Close Form" : "Add Choreography Step"}</span>
          </button>
        </div>
      </div>

      {/* Add Run Sheet Step Drawer */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300 print:hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Log Production Step</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Start Time (24h or AM/PM) *</label>
              <input
                required
                placeholder="e.g. 14:30 or 2:30 PM"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Estimated Duration</label>
              <input
                placeholder="e.g. 45m or 1h 15m"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Assigned Owner / Vendor</label>
              <input
                placeholder="e.g. DJ Marcus / Wedding Coordinator / Florist"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Activity / Milestone Title *</label>
              <input
                required
                placeholder="e.g. String Quartet Soundcheck & Floral Arches Setup"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Exact Location / Zone</label>
              <input
                placeholder="e.g. Grand Conservatory Balcony"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Operational Instructions & Contingency Notes</label>
              <textarea
                rows={2}
                placeholder="Microphone check required with officiant prior to arrival. If raining, move string quartet to indoor atrium portico..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="fv-input w-full resize-none text-sm"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Insert Step
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Production Run Sheet Table */}
      {sortedItems.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <FileText size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Choreography Steps Logged</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto mb-6">
            Build your day-of production sequence. Vendor leads and coordinators rely on this ledger to maintain exact synchronization.
          </p>
          <button onClick={() => setShowForm(true)} className="fv-btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2">
            <Plus size={15} /> Add First Production Step
          </button>
        </GlassCard>
      ) : (
        <GlassCard variant="obsidian" padding="none" className="border border-white/[0.08] overflow-hidden rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-ivory/60">
                  <th className="py-4 px-5 w-32">Time / Duration</th>
                  <th className="py-4 px-5">Activity & Operational Description</th>
                  <th className="py-4 px-4 w-48">Location / Room</th>
                  <th className="py-4 px-4 w-48">Assigned Lead</th>
                  <th className="py-4 px-4 w-12 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm text-ivory/85">
                {sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition duration-150 group">
                    <td className="py-4 px-5 align-top font-mono">
                      <div className="text-base font-bold text-primary-container">{item.time}</div>
                      {item.duration && (
                        <div className="text-[11px] text-ivory/50 mt-0.5">{item.duration}</div>
                      )}
                    </td>
                    <td className="py-4 px-5 align-top space-y-1">
                      <div className="font-bold text-ivory text-base">{item.title}</div>
                      {item.notes && (
                        <p className="text-xs text-ivory/70 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06] mt-2">
                          {item.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top">
                      {item.location ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-[#E8C97A]">
                          <MapPin size={14} className="shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ivory/30 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top">
                      {item.owner ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-container/10 border border-primary-container/20 text-xs font-mono text-primary-container w-fit">
                          <UserCheck size={13} className="shrink-0" />
                          <span>{item.owner}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ivory/30 font-mono">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top text-right print:hidden">
                      <button
                        onClick={() => onRemoveRunSheetItem(item.id)}
                        className="p-1.5 rounded-lg text-ivory/30 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove Step"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
