import React from "react";
import { format } from "date-fns";
import {
  Calendar, MapPin, ArrowRight, Heart, Images, BookOpen, Clock,
  Navigation, FileText, Sparkles, Send, CheckCircle2, Share2, Compass
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, WeddingEvent, Accommodation, VenueMarker, GalleryItem, WeddingUpdate, RSVP } from "@/types/wedding";

interface GuestHomeViewProps {
  wedding: Wedding;
  events: WeddingEvent[];
  accommodations: Accommodation[];
  markers: VenueMarker[];
  gallery: GalleryItem[];
  updates: WeddingUpdate[];
  countdown: { days: number; hours: number; minutes: number; seconds: number } | null;
  guestRSVP?: RSVP | null;
  onNavigateToRSVP: () => void;
  onNavigateToTimeline: () => void;
  onNavigateToVenue: () => void;
  onNavigateToGallery: () => void;
  onNavigateToMoments: () => void;
  onGenerateICS: () => void;
  isPreview?: boolean;
}

export function GuestHomeView({
  wedding,
  events,
  accommodations,
  markers,
  gallery,
  updates,
  countdown,
  guestRSVP,
  onNavigateToRSVP,
  onNavigateToTimeline,
  onNavigateToVenue,
  onNavigateToGallery,
  onNavigateToMoments,
  onGenerateICS,
  isPreview = false,
}: GuestHomeViewProps) {
  const weddingDateFormatted = wedding.wedding_date
    ? format(new Date(wedding.wedding_date), "MMMM d, yyyy")
    : "Upcoming Celebration";

  const heroImg = wedding.cover_image || wedding.hero_image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80";
  const storyImg = wedding.story_image || heroImg;

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-500 pb-16">
      {/* Cinematic Hero Section with Integrated Countdown (Stitch Design Specification) */}
      <section className="relative w-full h-[540px] md:h-[640px] rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/[0.12]">
        <img
          src={heroImg}
          alt={wedding.couple_names}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col justify-end text-ivory z-10">
          <p className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-primary-fixed mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-primary-fixed animate-pulse" />
            You Are Invited
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ivory mb-3 leading-[1.05]">
            {wedding.couple_names}
          </h1>
          <p className="text-sm md:text-base text-ivory/80 flex flex-wrap items-center gap-3 font-mono tracking-wider uppercase mb-6">
            <span className="flex items-center gap-1.5"><Calendar size={15} className="text-primary-fixed" /> {weddingDateFormatted}</span>
            {wedding.ceremony_venue && (
              <>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-primary-fixed" /> {wedding.ceremony_venue}</span>
              </>
            )}
          </p>

          {/* Countdown Glass Card */}
          {countdown && (
            <div className="glass-obsidian rounded-2xl p-4 md:p-6 w-max border border-white/[0.15] shadow-2xl inline-flex items-center gap-4 md:gap-8 backdrop-blur-2xl">
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl md:text-3xl font-bold text-ivory">{String(countdown.days).padStart(2, "0")}</span>
                <span className="text-[10px] md:text-xs font-mono text-ivory/70 uppercase tracking-widest mt-0.5">Days</span>
              </div>
              <div className="w-px h-10 bg-white/[0.15]" />
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl md:text-3xl font-bold text-ivory">{String(countdown.hours).padStart(2, "0")}</span>
                <span className="text-[10px] md:text-xs font-mono text-ivory/70 uppercase tracking-widest mt-0.5">Hours</span>
              </div>
              <div className="w-px h-10 bg-white/[0.15]" />
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl md:text-3xl font-bold text-ivory">{String(countdown.minutes).padStart(2, "0")}</span>
                <span className="text-[10px] md:text-xs font-mono text-ivory/70 uppercase tracking-widest mt-0.5">Mins</span>
              </div>
              <div className="w-px h-10 bg-white/[0.15] hidden sm:block" />
              <div className="flex flex-col items-center hidden sm:flex">
                <span className="font-serif text-2xl md:text-3xl font-bold text-ivory">{String(countdown.seconds).padStart(2, "0")}</span>
                <span className="text-[10px] md:text-xs font-mono text-ivory/70 uppercase tracking-widest mt-0.5">Secs</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Essential Details Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
            <h2 className="font-serif text-2xl font-bold text-ivory flex items-center gap-2.5">
              <Compass className="text-primary-fixed" size={22} /> Essential Details
            </h2>
            <button
              onClick={onGenerateICS}
              className="text-xs font-mono text-primary-fixed hover:underline flex items-center gap-1"
            >
              <Calendar size={13} /> Add to Calendar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Schedule Card */}
            <GlassCard
              variant="obsidian"
              hoverEffect
              onClick={onNavigateToTimeline}
              className="cursor-pointer group border border-white/[0.1] hover:border-primary-fixed/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary-fixed group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <ArrowRight size={20} className="text-muted group-hover:text-primary-fixed transition-colors group-hover:translate-x-1" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ivory mb-1.5">Event Schedule</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Explore the timeline for welcome drinks, ceremony vows, cocktail hour, and the reception celebration.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-primary-fixed">
                <span>{events.length || 3} Events Planned</span>
                <span>View Replay &amp; Map →</span>
              </div>
            </GlassCard>

            {/* Venue Directions Card */}
            <GlassCard
              variant="obsidian"
              hoverEffect
              onClick={onNavigateToVenue}
              className="cursor-pointer group border border-white/[0.1] hover:border-primary-fixed/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7A9E7E]/20 flex items-center justify-center text-[#7A9E7E] group-hover:scale-110 transition-transform">
                    <MapPin size={24} />
                  </div>
                  <ArrowRight size={20} className="text-muted group-hover:text-primary-fixed transition-colors group-hover:translate-x-1" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ivory mb-1.5">Venue &amp; Travel</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Navigate to {wedding.ceremony_venue || "the estate"}. View interactive maps, parking details, and hotel accommodations.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#7A9E7E]">
                <span>{accommodations.length || 2} Hotels Listed</span>
                <span>Get Directions →</span>
              </div>
            </GlassCard>
          </div>

          {/* RSVP Status Wide Card */}
          <GlassCard
            variant="obsidian"
            className="border border-primary-fixed/30 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-7 shadow-2xl bg-gradient-to-r from-obsidian via-primary-container/10 to-obsidian"
          >
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary-fixed font-bold">
                  {guestRSVP ? "RSVP Confirmed" : "RSVP Requested"}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-ivory">
                {guestRSVP ? `Attending (${guestRSVP.guest_count} ${guestRSVP.guest_count === 1 ? "Guest" : "Guests"})` : "Will You Be Joining Us?"}
              </h3>
              <p className="text-xs text-muted max-w-md leading-relaxed">
                {guestRSVP
                  ? `Meal selection confirmed: ${guestRSVP.dietary_preference || "Standard Entrée"}. We cannot wait to celebrate with you!`
                  : "Please submit your RSVP and dietary requirements so we can finalize our celebration arrangements."}
              </p>
            </div>

            <button
              onClick={onNavigateToRSVP}
              className="z-10 fv-btn-primary px-6 py-3.5 rounded-full font-bold text-xs shrink-0 flex items-center gap-2 shadow-xl hover:scale-105 transition duration-300"
            >
              <Send size={15} />
              {guestRSVP ? "Update RSVP" : "RSVP Now"}
            </button>
          </GlassCard>
        </div>

        {/* Announcements & Quick Links */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <h3 className="font-serif text-xl font-bold text-ivory border-b border-white/[0.1] pb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-primary-fixed" /> Latest Updates
          </h3>

          <GlassCard variant="obsidian" padding="none" className="border border-white/[0.1] overflow-hidden divide-y divide-white/[0.06]">
            {updates && updates.length > 0 ? (
              updates.slice(0, 3).map((up) => (
                <div key={up.id} className="p-5 hover:bg-white/[0.02] transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary-fixed font-bold">{up.title}</span>
                    <span className="text-[10px] text-muted font-mono">{format(new Date(up.created_at), "MMM d")}</span>
                  </div>
                  <p className="text-xs text-ivory/90 leading-relaxed line-clamp-3">{up.message}</p>
                </div>
              ))
            ) : (
              <>
                <div className="p-5 hover:bg-white/[0.02] transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary-fixed font-bold">Welcome Note</span>
                    <span className="text-[10px] text-muted font-mono">Recent</span>
                  </div>
                  <p className="text-xs text-ivory/90 leading-relaxed">
                    Welcome to our official wedding celebration portal! We will post important schedule updates and weather reminders here.
                  </p>
                </div>
                <div className="p-5 hover:bg-white/[0.02] transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A9E7E] font-bold">Accommodation</span>
                    <span className="text-[10px] text-muted font-mono">Reminder</span>
                  </div>
                  <p className="text-xs text-ivory/90 leading-relaxed">
                    Please remember to book your hotel stay early using our special group discount code found in the travel section.
                  </p>
                </div>
              </>
            )}
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={onNavigateToGallery}
              className="glass-obsidian rounded-2xl p-5 border border-white/[0.1] hover:border-primary-fixed/50 shadow-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center text-primary-fixed mb-3 group-hover:scale-110 transition-transform">
                <Images size={22} />
              </div>
              <span className="text-xs font-bold text-ivory">Photo Gallery</span>
              <span className="text-[10px] text-muted mt-0.5">{gallery.length || 0} Photos</span>
            </div>

            <div
              onClick={onNavigateToMoments}
              className="glass-obsidian rounded-2xl p-5 border border-white/[0.1] hover:border-primary-fixed/50 shadow-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center text-[#7A9E7E] mb-3 group-hover:scale-110 transition-transform">
                <BookOpen size={22} />
              </div>
              <span className="text-xs font-bold text-ivory">Guestbook</span>
              <span className="text-[10px] text-muted mt-0.5">Share Wishes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter I: A Love Story (Editorial Layout from welcome_our_story) */}
      {wedding.story && (
        <section className="py-12 md:py-20 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 border border-primary-fixed/30 text-primary-fixed text-[11px] font-mono uppercase tracking-widest font-bold">
              <Heart size={13} fill="currentColor" /> Chapter I • Our Journey
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-ivory tracking-tight">A Love Story</h2>
            <div className="space-y-4 text-sm md:text-base text-ivory/80 leading-relaxed font-light">
              <p className="first-letter:font-serif first-letter:text-4xl first-letter:text-primary-fixed first-letter:mr-2 first-letter:float-left">
                {wedding.story}
              </p>
              <p className="text-muted text-xs italic">
                &ldquo;We have built a life anchored in mutual respect, shared passions, and an unwavering commitment to each other&rsquo;s dreams. We invite you to be part of the most important day of our lives.&rdquo;
              </p>
            </div>
          </div>

          <div className="md:col-span-6 relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/[0.15] aspect-[4/5] relative z-10">
              <img src={storyImg} alt="Our Story" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-36 sm:w-48 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-obsidian z-20 hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80"
                alt="Rings"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* A Note to Our Guests */}
      <section className="py-12 text-center max-w-3xl mx-auto">
        <GlassCard variant="obsidian" className="p-8 md:p-14 border border-white/[0.1] relative overflow-hidden space-y-6">
          <div className="absolute -top-10 -right-10 opacity-5 text-primary-fixed pointer-events-none">
            <Heart size={160} />
          </div>
          <FileText size={32} className="text-primary-fixed mx-auto" />
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-ivory">A Note to Our Guests</h3>
          <p className="font-serif italic text-lg md:text-2xl text-ivory/90 leading-relaxed">
            &ldquo;Your presence in our lives is a gift we cherish deeply. We have designed this celebration not just to honor our union, but to celebrate the wonderful village of family and friends who have shaped us.&rdquo;
          </p>
          <div className="flex justify-center items-center gap-4 pt-4">
            <div className="h-px w-12 bg-white/[0.15]" />
            <span className="font-serif font-bold text-primary-fixed tracking-wider">{wedding.couple_names}</span>
            <div className="h-px w-12 bg-white/[0.15]" />
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
