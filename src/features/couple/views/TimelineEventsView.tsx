import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar, Clock, MapPin, Plus, Trash2, Edit3, Sparkles,
  ChevronRight, AlertCircle, CheckCircle2, ArrowUpDown
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, WeddingEvent } from "@/types/wedding";

interface TimelineEventsViewProps {
  wedding: Wedding;
  events: WeddingEvent[];
  onAddEvent: (eventData: Partial<WeddingEvent>) => void;
  onRemoveEvent: (id: string) => void;
  onRefresh?: () => void;
}

export function TimelineEventsView({
  wedding,
  events,
  onAddEvent,
  onRemoveEvent
}: TimelineEventsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDate, setNewDate] = useState(wedding.wedding_date || "");
  const [newTime, setNewTime] = useState("16:00");
  const [newDescription, setNewDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddEvent({
      title: newTitle.trim(),
      location: newLocation.trim() || null,
      event_date: newDate || null,
      event_time: newTime || null,
      description: newDescription.trim() || null,
    });
    setNewTitle("");
    setNewLocation("");
    setNewDescription("");
    setShowForm(false);
  };

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = `${a.event_date || "9999-12-31"}T${a.event_time || "00:00"}`;
    const timeB = `${b.event_date || "9999-12-31"}T${b.event_time || "00:00"}`;
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Calendar size={13} className="text-primary-container" />
            <span>Master Schedule & Milestones</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Timeline Events
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Curate the sequence of celebrations across your wedding journey, from welcome cocktails to final farewell brunch.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-lg hover:shadow-primary-container/20"
        >
          <Plus size={15} />
          <span>{showForm ? "Close Form" : "Add Timeline Event"}</span>
        </button>
      </div>

      {/* Add Event Form Modal / Drawer Card */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Create New Milestone</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Event Title *</label>
              <input
                required
                placeholder="e.g. Sunset Champagne Reception & Canapés"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Location / Room</label>
              <input
                placeholder="e.g. Grand Terrace / Villa Serbelloni Garden"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Description & Guest Instructions</label>
              <textarea
                rows={3}
                placeholder="Dress code reminders, shuttle departure notes, or musical prelude details..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="fv-input w-full resize-none text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Publish Event
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Events Timeline Grid / List */}
      {sortedEvents.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <div className="w-14 h-14 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto text-primary-container mb-4">
            <Calendar size={26} />
          </div>
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Timeline Events Yet</h3>
          <p className="text-sm text-ivory/60 max-w-md mx-auto mb-6">
            Begin staging your itinerary. Events created here will automatically synchronize with your published guest website and invitation schedule.
          </p>
          <button onClick={() => setShowForm(true)} className="fv-btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2">
            <Plus size={15} /> Add First Event
          </button>
        </GlassCard>
      ) : (
        <div className="relative pl-4 sm:pl-8 border-l border-white/[0.12] space-y-8 my-6">
          {sortedEvents.map((ev, index) => {
            const eventDateStr = ev.event_date ? format(new Date(ev.event_date), "EEEE, MMMM d, yyyy") : "Date TBD";
            return (
              <div key={ev.id} className="relative group">
                {/* Timeline Marker Circle */}
                <div className="absolute -left-4 sm:-left-8 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-obsidian border-2 border-primary-container flex items-center justify-center text-primary-container shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-110 transition duration-300 z-10">
                  <span className="font-mono text-[11px] font-bold">{index + 1}</span>
                </div>

                <GlassCard
                  variant="obsidian"
                  padding="lg"
                  className="border border-white/[0.08] hover:border-primary-container/40 transition duration-300 shadow-xl ml-2 sm:ml-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-3 py-1 rounded-full bg-primary-container/15 text-primary-container font-mono font-medium border border-primary-container/20 flex items-center gap-1.5">
                          <Clock size={12} />
                          {ev.event_time || "Time TBD"}
                        </span>
                        <span className="text-ivory/60 font-medium">{eventDateStr}</span>
                      </div>
                      <h3 className="font-headline-sm text-2xl text-ivory group-hover:text-primary-container transition duration-200">
                        {ev.title}
                      </h3>
                      {ev.location && (
                        <div className="flex items-center gap-1.5 text-xs text-[#E8C97A] font-medium pt-0.5">
                          <MapPin size={14} className="shrink-0" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveEvent(ev.id)}
                      className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-ivory/50 hover:text-rose-400 border border-white/[0.06] hover:border-rose-500/30 flex items-center justify-center transition shrink-0 self-end sm:self-start"
                      title="Delete Event"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {ev.description && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] text-sm text-ivory/75 leading-relaxed">
                      {ev.description}
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
