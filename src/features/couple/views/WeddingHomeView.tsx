import React from "react";
import { format, differenceInDays } from "date-fns";
import {
  Users, DollarSign, Clock, CheckCircle2, Mail, Sparkles,
  Calendar, ArrowRight, ExternalLink, ShieldCheck, Heart, Camera
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type {
  Wedding, RSVP, GalleryItem, GuestPhoto, GuestMoment,
  Accommodation, WeddingUpdate, WeddingEvent, TaskItem
} from "@/types/wedding";
import type { TabId } from "@/components/nav/CoupleWorkspaceShell";
import {
  CountdownWidget, HealthWidget, SummaryGrid, QuickActionsWidget,
  ActivityTimeline, InsightsWidget, CommandCenter
} from "@/features/couple/widgets";

interface WeddingHomeViewProps {
  wedding: Wedding;
  rsvps: RSVP[];
  moments: GuestMoment[];
  guestPhotos: GuestPhoto[];
  gallery: GalleryItem[];
  events: WeddingEvent[];
  accommodations: Accommodation[];
  updates: WeddingUpdate[];
  tasks: TaskItem[];
  onNavigate: (tab: TabId) => void;
  onOpenOnboarding: () => void;
  onCopyLink: () => void;
}

export function WeddingHomeView({
  wedding,
  rsvps,
  moments,
  guestPhotos,
  gallery,
  events,
  accommodations,
  updates,
  tasks,
  onNavigate,
  onOpenOnboarding,
  onCopyLink
}: WeddingHomeViewProps) {
  // Calculate countdown days
  const daysToGo = wedding.wedding_date
    ? differenceInDays(new Date(wedding.wedding_date), new Date())
    : 0;
  const formattedDate = wedding.wedding_date
    ? format(new Date(wedding.wedding_date), "MMMM d, yyyy")
    : "Date not set";

  // Task checklist metrics
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const taskProgress = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  // RSVP metrics
  const totalInvited = rsvps.reduce((sum, r) => sum + (r.guest_count || 1), 0) || 1;
  const attendingGuests = rsvps
    .filter(r => r.attending === "confirmed")
    .reduce((sum, r) => sum + (r.guest_count || 1), 0);
  const rsvpProgress = Math.min(100, Math.round((attendingGuests / totalInvited) * 100));

  // Default hero image if couple hasn't uploaded one
  const heroImage = wedding.cover_image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cinematic Hero & Countdown (Stitch Design Specification) */}
      <section className="relative w-full h-[380px] md:h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-white/[0.12] flex flex-col justify-end group">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={heroImage}
            alt="Wedding Ceremony Setup"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>
        {/* Glassmorphic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 md:px-12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-label-md text-[12px] text-primary-fixed tracking-[0.25em] uppercase px-3 py-1 bg-primary-container/20 rounded-full border border-primary-container/30">
              The Big Day
            </span>
            <h1 className="font-display-lg text-3xl md:text-5xl text-ivory font-bold tracking-tight">
              {daysToGo > 0 ? `${daysToGo} Days to Go` : daysToGo === 0 ? "It's Today! 🎉" : "Happily Ever After"}
            </h1>
            <p className="font-headline-sm text-lg text-muted italic">
              {formattedDate} {wedding.ceremony_venue ? `• ${wedding.ceremony_venue}` : ""}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onCopyLink}
              className="fv-btn-ghost !py-2.5 !px-5 text-xs flex items-center gap-2 border-white/[0.2] bg-obsidian/60 backdrop-blur-md cursor-pointer"
            >
              <ExternalLink size={14} className="text-primary-container" />
              <span>Share Guest Site</span>
            </button>
            <button
              onClick={() => onNavigate("overview")}
              className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Edit Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar (Stitch Design Specification) */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
        <button
          onClick={() => onNavigate("rsvp")}
          className="snap-start shrink-0 bg-primary-container text-obsidian px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md cursor-pointer"
        >
          <Users size={15} />
          <span>Guest List ({rsvps.length})</span>
        </button>
        <button
          onClick={() => onNavigate("budget")}
          className="snap-start shrink-0 bg-white/[0.06] text-ivory px-5 py-2.5 rounded-full border border-white/[0.1] text-xs font-semibold flex items-center gap-2 hover:bg-white/[0.1] transition-colors shadow-sm cursor-pointer"
        >
          <DollarSign size={15} className="text-primary-fixed" />
          <span>Budget & Vendors</span>
        </button>
        <button
          onClick={() => onNavigate("run_sheet")}
          className="snap-start shrink-0 bg-white/[0.06] text-ivory px-5 py-2.5 rounded-full border border-white/[0.1] text-xs font-semibold flex items-center gap-2 hover:bg-white/[0.1] transition-colors shadow-sm cursor-pointer"
        >
          <Clock size={15} className="text-sage-light" />
          <span>Day-of Run Sheet</span>
        </button>
        <button
          onClick={() => onNavigate("tables")}
          className="snap-start shrink-0 bg-white/[0.06] text-ivory px-5 py-2.5 rounded-full border border-white/[0.1] text-xs font-semibold flex items-center gap-2 hover:bg-white/[0.1] transition-colors shadow-sm cursor-pointer"
        >
          <Users size={15} className="text-rose-light" />
          <span>Seating Chart</span>
        </button>
        <button
          onClick={() => onNavigate("gallery")}
          className="snap-start shrink-0 bg-white/[0.06] text-ivory px-5 py-2.5 rounded-full border border-white/[0.1] text-xs font-semibold flex items-center gap-2 hover:bg-white/[0.1] transition-colors shadow-sm cursor-pointer"
        >
          <Camera size={15} className="text-primary-container" />
          <span>Media Vault</span>
        </button>
      </div>

      {/* Progress Cards (Stitch Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist Progress Bento Card */}
        <GlassCard variant="frost" padding="lg" className="border border-white/[0.1] flex flex-col justify-between min-h-[180px] hover-lift">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary-container">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-headline-sm text-lg text-ivory font-bold">Delegation Checklist</h3>
                <p className="text-xs text-muted">Track wedding prep milestones</p>
              </div>
            </div>
            <span className="text-xs font-mono text-primary-fixed bg-primary-container/15 px-3 py-1 rounded-full border border-primary-container/30 font-bold">
              {taskProgress}%
            </span>
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-center text-xs text-muted font-medium">
              <span>{completedTasks} of {tasks.length || 0} tasks completed</span>
              <button
                onClick={() => onNavigate("tasks")}
                className="text-primary-fixed hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Board</span>
                <ArrowRight size={12} />
              </button>
            </div>
            {/* Thin Elegant Progress Bar */}
            <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-container to-primary-fixed rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* RSVP Summary Bento Card */}
        <GlassCard variant="frost" padding="lg" className="border border-white/[0.1] flex flex-col justify-between min-h-[180px] hover-lift">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sage/20 flex items-center justify-center text-sage">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-headline-sm text-lg text-ivory font-bold">RSVP Summary</h3>
                <p className="text-xs text-muted">Real-time attendance tracking</p>
              </div>
            </div>
            <span className="text-xs font-mono text-sage-light bg-sage/15 px-3 py-1 rounded-full border border-sage/30 font-bold">
              {attendingGuests} / {totalInvited}
            </span>
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-center text-xs text-muted font-medium">
              <span>Attending guests confirmed</span>
              <button
                onClick={() => onNavigate("rsvp")}
                className="text-sage-light hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage RSVPs</span>
                <ArrowRight size={12} />
              </button>
            </div>
            {/* Thin Elegant Progress Bar */}
            <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sage to-sage-light rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${rsvpProgress}%` }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Live Command Center & Intelligence Widgets */}
      <CommandCenter
        wedding={wedding}
        rsvps={rsvps}
        moments={moments}
        guestPhotos={guestPhotos}
        onOpenOnboarding={onOpenOnboarding}
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SummaryGrid
            rsvps={rsvps}
            moments={moments}
            guestPhotos={guestPhotos}
            wedding={wedding}
            onNavigate={onNavigate}
          />
          <QuickActionsWidget
            wedding={wedding}
            onNavigate={onNavigate}
            onCopyLink={onCopyLink}
            onOpenOnboarding={onOpenOnboarding}
          />
          <ActivityTimeline
            rsvps={rsvps}
            moments={moments}
            guestPhotos={guestPhotos}
            updates={updates}
          />
        </div>
        <div className="space-y-8">
          <CountdownWidget wedding={wedding} />
          <HealthWidget
            wedding={wedding}
            gallery={gallery}
            events={events}
            accommodations={accommodations}
          />
          <InsightsWidget
            wedding={wedding}
            rsvps={rsvps}
            guestPhotos={guestPhotos}
            moments={moments}
          />
        </div>
      </div>
    </div>
  );
}
