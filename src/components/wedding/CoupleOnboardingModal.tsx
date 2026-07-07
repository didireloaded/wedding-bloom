import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Heart, Users, Award, Navigation, Compass, Calendar, CheckCircle2,
  Share2, X, ArrowRight, ArrowLeft, ShieldCheck, FileText, Radio, QrCode,
  Check, Eye, Zap, Layers, Car, Gift, Clock
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export interface CoupleOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  coupleNames: string;
  weddingId: string;
  onNavigate?: (tab: string) => void;
}

interface SlideContent {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: Array<{ icon: React.ReactNode; label: string; detail: string }>;
  actionLabel?: string;
  targetTab?: string;
}

export function CoupleOnboardingModal({
  open,
  onClose,
  coupleNames,
  weddingId,
  onNavigate
}: CoupleOnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
    }
  }, [open]);

  if (!open) return null;

  const slides: SlideContent[] = [
    {
      id: "vision",
      badge: "Welcome to Forever Vow",
      title: `Welcome, ${coupleNames || "Celebrants"} ✨`,
      subtitle: "Your Luxury Digital Wedding Command Center",
      description: "Forever Vow replaces scattered spreadsheets, chaotic group chats, and fragmented email threads with one unified, real-time sanctuary for your entire celebration.",
      icon: <Heart size={36} className="text-[#E8C97A] animate-pulse" />,
      gradient: "from-[#D4A853]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <Sparkles size={18} className="text-[#D4A853]" />, label: "Unified Sanctuary", detail: "All your guest lists, vendors, budgets, and timelines live in one synchronized dashboard." },
        { icon: <ShieldCheck size={18} className="text-[#7A9E7E]" />, label: "Privacy-First Luxury", detail: "Bank-grade Supabase security with bespoke access codes for your invited guests." },
        { icon: <Zap size={18} className="text-[#E8C97A]" />, label: "Real-Time Sync", detail: "Live updates across all devices without page reloads or data lag." }
      ]
    },
    {
      id: "guests",
      badge: "Core Pillar • Guest Experience",
      title: "Effortless Guest Operations",
      subtitle: "From Digital RSVPs to Dietary Intelligence",
      description: "Collect instant RSVPs through your beautiful public wedding website. Forever Vow automatically aggregates dietary preferences, party sizes, and special song requests.",
      icon: <Users size={36} className="text-[#7A9E7E]" />,
      gradient: "from-[#7A9E7E]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <Check size={18} className="text-[#7A9E7E]" />, label: "Live RSVP Verification", detail: "Track confirmed, declined, and pending responses instantly." },
        { icon: <Layers size={18} className="text-[#D4A853]" />, label: "Dietary Aggregator", detail: "Automatic tally of vegan, gluten-free, halal, and allergy requirements for caterers." },
        { icon: <Users size={18} className="text-[#E8C97A]" />, label: "Household Grouping", detail: "Manage couples, families, and plus-ones with ease." }
      ]
    },
    {
      id: "vendors",
      badge: "Core Pillar • Financial & Planning",
      title: "Vendor CRM & Budget Mastery",
      subtitle: "Complete Financial Alignment & Creative Control",
      description: "Keep your wedding finances crystal clear. Track estimated vs. actual expenses, log deposit due dates, and store important vendor contracts in one organized vault.",
      icon: <Award size={36} className="text-[#D4A853]" />,
      gradient: "from-[#D4A853]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <FileText size={18} className="text-[#D4A853]" />, label: "Vendor Vault", detail: "Store contact emails, phone numbers, and contract PDFs for every supplier." },
        { icon: <Zap size={18} className="text-[#7A9E7E]" />, label: "Budget Burn-Rate", detail: "Visual indicators showing paid deposits vs. pending invoices." },
        { icon: <Sparkles size={18} className="text-[#E8C97A]" />, label: "Interactive Mood Boards", detail: "Curate color palettes and inspiration photos to share with planners." }
      ]
    },
    {
      id: "dayof",
      badge: "Core Pillar • Day-of Execution",
      title: "100m Geofenced Arrival Radar",
      subtitle: "State-of-the-Art Day-0 Operations",
      description: "On the morning of your wedding, opted-in guests and key vendors trigger automatic geofence check-ins when entering the 100-meter radius around your venue.",
      icon: <Navigation size={36} className="text-[#E8C97A]" />,
      gradient: "from-[#E8C97A]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <Radio size={18} className="text-[#E8C97A] animate-pulse" />, label: "Live Radar Feed", detail: "See exactly who is en route, arriving, or parked at the venue in real time." },
        { icon: <Car size={18} className="text-[#7A9E7E]" />, label: "Automatic Welcome Screen", detail: "Guests' phones automatically switch to display parking directions upon arrival." },
        { icon: <ShieldCheck size={18} className="text-[#D4A853]" />, label: "100% Opt-In Privacy", detail: "GPS tracking self-terminates the moment the guest arrives at the gate." }
      ]
    },
    {
      id: "tour-overview",
      badge: "Dashboard Walkthrough • 1 of 4",
      title: "The Command Center",
      subtitle: "Your High-Level Pulse & Overview",
      description: "The Overview tab is your daily starting point. Monitor your countdown clock, check RSVP completion rates, review recent guest messages, and view live photo uploads.",
      icon: <Compass size={36} className="text-[#D4A853]" />,
      gradient: "from-[#D4A853]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <Eye size={18} className="text-[#D4A853]" />, label: "KPI Summary Grid", detail: "Instant metrics on guest counts, revenue, and pending tasks." },
        { icon: <Sparkles size={18} className="text-[#E8C97A]" />, label: "Live Activity Timeline", detail: "Real-time feed of RSVPs, photo uploads, and guestbook messages." },
        { icon: <Zap size={18} className="text-[#7A9E7E]" />, label: "Quick Action Shortcuts", detail: "One-click access to copy invitation links or broadcast updates." }
      ],
      actionLabel: "Explore Overview",
      targetTab: "overview"
    },
    {
      id: "tour-planning",
      badge: "Dashboard Walkthrough • 2 of 4",
      title: "The Planning Suite",
      subtitle: "Curate, Budget, and Organize",
      description: "Switch to the Planning Suite tab to dive into deep organization. Here you will manage your budget categories, vendor CRM, mood board palettes, and post-wedding thank-you notes.",
      icon: <Calendar size={36} className="text-[#7A9E7E]" />,
      gradient: "from-[#7A9E7E]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <FileText size={18} className="text-[#7A9E7E]" />, label: "Budget Tracker", detail: "Add expense items, track payment statuses, and monitor totals." },
        { icon: <Award size={18} className="text-[#D4A853]" />, label: "Vendor Directory", detail: "Keep photographers, florists, caterers, and DJs organized." },
        { icon: <Gift size={18} className="text-[#E8C97A]" />, label: "Thank-You Tracker", detail: "Log gifts received and track which appreciation cards have been sent." }
      ],
      actionLabel: "Explore Planning Suite",
      targetTab: "planning"
    },
    {
      id: "tour-execution",
      badge: "Dashboard Walkthrough • 3 of 4",
      title: "The Execution Suite",
      subtitle: "Flawless Day-Of Coordination",
      description: "The Execution Suite is your operational powerhouse. Build minute-by-minute master run sheets, design reception table layouts, assign tasks, and broadcast SMS/Email announcements.",
      icon: <CheckCircle2 size={36} className="text-[#E8C97A]" />,
      gradient: "from-[#E8C97A]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <Clock size={18} className="text-[#E8C97A]" />, label: "Master Run Sheet", detail: "Schedule ceremony times, toasts, and cake cutting with assigned owners." },
        { icon: <Users size={18} className="text-[#7A9E7E]" />, label: "Interactive Floor Planner", detail: "Create round or rectangular tables and assign guests to seats." },
        { icon: <Radio size={18} className="text-[#D4A853]" />, label: "Live Broadcast Hub", detail: "Send instant SMS or email alerts to guests (e.g. shuttle departures)." }
      ],
      actionLabel: "Explore Execution Suite",
      targetTab: "execution"
    },
    {
      id: "tour-share",
      badge: "Dashboard Walkthrough • 4 of 4",
      title: "Share Your Invitation",
      subtitle: "Invite Your Loved Ones in Style",
      description: "Your celebration website is ready! Guests can visit your unique link or scan your bespoke QR code to RSVP, view accommodation recommendations, and read your story.",
      icon: <QrCode size={36} className="text-[#D4A853]" />,
      gradient: "from-[#D4A853]/20 via-[#1C1814] to-[#0C0A09]",
      features: [
        { icon: <Share2 size={18} className="text-[#D4A853]" />, label: "Unique Celebration Link", detail: "Copy and send your link via WhatsApp, iMessage, or email." },
        { icon: <QrCode size={18} className="text-[#E8C97A]" />, label: "Bespoke QR Code", detail: "Download high-resolution QR codes to print on physical paper invitations." },
        { icon: <Sparkles size={18} className="text-[#7A9E7E]" />, label: "You're All Set!", detail: "Your clean slate command center is ready. Let's create unforgettable memories." }
      ],
      actionLabel: "Finish & Enter Sanctuary 🚀",
      targetTab: "overview"
    }
  ];

  const slide = slides[currentSlide];

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem(`fv_onboarding_completed_${weddingId}`, "true");
    }
    if (slide.targetTab && onNavigate) {
      onNavigate(slide.targetTab);
    }
    onClose();
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl my-auto">
        {/* Background Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#D4A853]/30 via-[#7A9E7E]/20 to-[#E8C97A]/30 rounded-[36px] blur-2xl opacity-75 pointer-events-none" />

        {/* Main Glass Card */}
        <GlassCard variant="obsidian" padding="none" className="relative rounded-[32px] border border-white/[0.18] shadow-2xl overflow-hidden bg-[#141210]/95">
          {/* Top Header Bar */}
          <div className={`p-6 sm:p-8 bg-gradient-to-r ${slide.gradient} border-b border-white/[0.1] flex items-start justify-between gap-4 transition-colors duration-700`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[22px] bg-black/40 border border-white/[0.15] flex items-center justify-center shadow-inner shrink-0">
                {slide.icon}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-[#D4A853] text-[11px] font-mono uppercase tracking-widest font-bold">
                  {slide.badge}
                </span>
                <h2 className="display text-[26px] sm:text-[34px] text-[#FAF7F2] mt-2 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-[14px] text-[#E8C97A] font-medium mt-0.5">
                  {slide.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/[0.1] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2] transition shrink-0"
              title="Close Walkthrough"
            >
              <X size={18} />
            </button>
          </div>

          {/* Slide Body */}
          <div className="p-6 sm:p-8 space-y-8 min-h-[320px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
              >
                <p className="text-[15.5px] text-[#D6D3CD] leading-relaxed font-serif">
                  {slide.description}
                </p>

                {/* Feature Highlight Grid */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  {slide.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition flex flex-col justify-between gap-2 group hover-lift"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          {feat.icon}
                        </div>
                        <h4 className="font-semibold text-[14px] text-[#FAF7F2] leading-snug">
                          {feat.label}
                        </h4>
                      </div>
                      <p className="text-[12px] text-[#A8A29E] leading-normal">
                        {feat.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls & Step Pills */}
            <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: Step Indicators & Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide
                          ? "w-8 bg-[#D4A853]"
                          : "w-2 bg-white/[0.2] hover:bg-white/[0.4]"
                      }`}
                      title={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-[#A8A29E] hover:text-[#FAF7F2] transition">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-white/[0.2] bg-white/[0.05] text-[#D4A853] focus:ring-[#D4A853]/40"
                  />
                  <span>Don&apos;t show automatically on login</span>
                </label>
              </div>

              {/* Right: Navigation Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`fv-btn-ghost !py-2.5 !px-4 text-[13px] flex items-center gap-1.5 ${
                    currentSlide === 0 ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  onClick={nextSlide}
                  className="fv-btn-primary !py-2.5 !px-6 text-[13px] font-semibold flex items-center gap-2 shadow-lg hover:shadow-[#D4A853]/20"
                >
                  <span>{currentSlide === slides.length - 1 ? (slide.actionLabel || "Finish") : "Next"}</span>
                  {currentSlide === slides.length - 1 ? <Sparkles size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
