import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Heart, Users, Award, Navigation, Compass, Calendar, CheckCircle2,
  Share2, X, ArrowRight, ArrowLeft, ShieldCheck, FileText, Radio, QrCode,
  Check, Eye, Zap, Layers, Car, Gift, Clock
} from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

export interface CoupleOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  coupleNames: string;
  weddingId: string;
  onNavigate?: (tab: string) => void;
}

interface SlideContent {
  id: string;
  category: string; // Curly bracket annotation e.g. "Why Forever Vow"
  disciplineName: string; // e.g. "SANCTUARY", "GUESTS", "VENDORS", "RADAR", "COMMAND"
  disciplineColor: string; // e.g. #0ae448 (green), #ff8709 (orange), #fec5fb (pink), #9d95ff (violet), #00bae2 (blue)
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
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

  // GSAP Dark Canvas 5-discipline color taxonomy:
  // Green (#0ae448): Brand mark / Sanctuary
  // Orange (#ff8709): SVG / Guests & RSVPs
  // Pink (#fec5fb): Scroll / Financial & Planning
  // Violet (#9d95ff): Text / Day-Of Radar & Execution
  // Blue (#00bae2): UI / Dashboard Tour & Overview
  const slides: SlideContent[] = [
    {
      id: "vision",
      category: "Why Forever Vow",
      disciplineName: "SANCTUARY",
      disciplineColor: "#0ae448", // Shockingly Green
      title: `Welcome, ${coupleNames || "Celebrants"}`,
      subtitle: "Your Luxury Digital Wedding Operating System",
      description: "Forever Vow replaces chaotic group chats, fragmented spreadsheets, and endless email threads with one unified, dark-canvas sanctuary for your entire celebration.",
      icon: <Heart size={36} className="text-[#0ae448] animate-pulse" />,
      features: [
        { icon: <Sparkles size={18} className="text-[#0ae448]" />, label: "Unified Sanctuary", detail: "All your guest lists, vendors, budgets, and timelines live in one synchronized dashboard." },
        { icon: <ShieldCheck size={18} className="text-[#abff84]" />, label: "Privacy-First Luxury", detail: "Bank-grade Supabase security with bespoke access codes for your invited guests." },
        { icon: <Zap size={18} className="text-[#0ae448]" />, label: "Real-Time Sync", detail: "Live updates across all devices without page reloads or data lag." }
      ]
    },
    {
      id: "guests",
      category: "Guest Operations",
      disciplineName: "GUESTS",
      disciplineColor: "#ff8709", // Orangey
      title: "Effortless Guest Operations",
      subtitle: "From Digital RSVPs to Dietary Intelligence",
      description: "Collect instant RSVPs through your beautiful public wedding website. Forever Vow automatically aggregates dietary preferences, party sizes, and special song requests.",
      icon: <Users size={36} className="text-[#ff8709]" />,
      features: [
        { icon: <Check size={18} className="text-[#ff8709]" />, label: "Live RSVP Verification", detail: "Track confirmed, declined, and pending responses instantly." },
        { icon: <Layers size={18} className="text-[#ff8709]" />, label: "Dietary Aggregator", detail: "Automatic tally of vegan, gluten-free, halal, and allergy requirements for caterers." },
        { icon: <Users size={18} className="text-[#ff8709]" />, label: "Household Grouping", detail: "Manage couples, families, and plus-ones with ease." }
      ]
    },
    {
      id: "vendors",
      category: "Financial Mastery",
      disciplineName: "PLANNING",
      disciplineColor: "#fec5fb", // Pink
      title: "Vendor CRM & Budget Mastery",
      subtitle: "Complete Financial Alignment & Creative Control",
      description: "Keep your wedding finances crystal clear. Track estimated vs. actual expenses, log deposit due dates, and store important vendor contracts in one organized vault.",
      icon: <Award size={36} className="text-[#fec5fb]" />,
      features: [
        { icon: <FileText size={18} className="text-[#fec5fb]" />, label: "Vendor Vault", detail: "Store contact emails, phone numbers, and contract PDFs for every supplier." },
        { icon: <Zap size={18} className="text-[#fec5fb]" />, label: "Budget Burn-Rate", detail: "Visual indicators showing paid deposits vs. pending invoices." },
        { icon: <Sparkles size={18} className="text-[#fec5fb]" />, label: "Interactive Mood Boards", detail: "Curate color palettes and inspiration photos to share with planners." }
      ]
    },
    {
      id: "dayof",
      category: "Day-0 Operations",
      disciplineName: "RADAR",
      disciplineColor: "#9d95ff", // Lilac / Violet
      title: "100m Geofenced Arrival Radar",
      subtitle: "State-of-the-Art Live Coordination",
      description: "On the morning of your wedding, opted-in guests and key vendors trigger automatic geofence check-ins when entering the 100-meter radius around your venue.",
      icon: <Navigation size={36} className="text-[#9d95ff]" />,
      features: [
        { icon: <Radio size={18} className="text-[#9d95ff] animate-pulse" />, label: "Live Radar Feed", detail: "See exactly who is en route, arriving, or parked at the venue in real time." },
        { icon: <Car size={18} className="text-[#9d95ff]" />, label: "Automatic Welcome Screen", detail: "Guests' phones automatically switch to display parking directions upon arrival." },
        { icon: <ShieldCheck size={18} className="text-[#9d95ff]" />, label: "100% Opt-In Privacy", detail: "GPS tracking self-terminates the moment the guest arrives at the gate." }
      ]
    },
    {
      id: "tour-overview",
      category: "Dashboard Tour • 1 of 4",
      disciplineName: "COMMAND",
      disciplineColor: "#00bae2", // Blue
      title: "The Command Center",
      subtitle: "Your High-Level Pulse & Overview",
      description: "The Overview tab is your daily starting point. Monitor your countdown clock, check RSVP completion rates, review recent guest messages, and view live photo uploads.",
      icon: <Compass size={36} className="text-[#00bae2]" />,
      features: [
        { icon: <Eye size={18} className="text-[#00bae2]" />, label: "KPI Summary Grid", detail: "Instant metrics on guest counts, revenue, and pending tasks." },
        { icon: <Sparkles size={18} className="text-[#00bae2]" />, label: "Live Activity Timeline", detail: "Real-time feed of RSVPs, photo uploads, and guestbook messages." },
        { icon: <Zap size={18} className="text-[#00bae2]" />, label: "Quick Action Shortcuts", detail: "One-click access to copy invitation links or broadcast updates." }
      ],
      actionLabel: "Explore Overview",
      targetTab: "overview"
    },
    {
      id: "tour-planning",
      category: "Dashboard Tour • 2 of 4",
      disciplineName: "SUITE",
      disciplineColor: "#fec5fb", // Pink
      title: "The Planning Suite",
      subtitle: "Curate, Budget, and Organize",
      description: "Switch to the Planning Suite tab to dive into deep organization. Here you will manage your budget categories, vendor CRM, mood board palettes, and post-wedding thank-you notes.",
      icon: <Calendar size={36} className="text-[#fec5fb]" />,
      features: [
        { icon: <FileText size={18} className="text-[#fec5fb]" />, label: "Budget Tracker", detail: "Add expense items, track payment statuses, and monitor totals." },
        { icon: <Award size={18} className="text-[#fec5fb]" />, label: "Vendor Directory", detail: "Keep photographers, florists, caterers, and DJs organized." },
        { icon: <Gift size={18} className="text-[#fec5fb]" />, label: "Thank-You Tracker", detail: "Log gifts received and track which appreciation cards have been sent." }
      ],
      actionLabel: "Explore Planning Suite",
      targetTab: "planning"
    },
    {
      id: "tour-execution",
      category: "Dashboard Tour • 3 of 4",
      disciplineName: "EXECUTE",
      disciplineColor: "#9d95ff", // Lilac / Violet
      title: "The Execution Suite",
      subtitle: "Flawless Day-Of Coordination",
      description: "The Execution Suite is your operational powerhouse. Build minute-by-minute master run sheets, design reception table layouts, assign tasks, and broadcast SMS/Email announcements.",
      icon: <CheckCircle2 size={36} className="text-[#9d95ff]" />,
      features: [
        { icon: <Clock size={18} className="text-[#9d95ff]" />, label: "Master Run Sheet", detail: "Schedule ceremony times, toasts, and cake cutting with assigned owners." },
        { icon: <Users size={18} className="text-[#9d95ff]" />, label: "Interactive Floor Planner", detail: "Create round or rectangular tables and assign guests to seats." },
        { icon: <Radio size={18} className="text-[#9d95ff]" />, label: "Live Broadcast Hub", detail: "Send instant SMS or email alerts to guests (e.g. shuttle departures)." }
      ],
      actionLabel: "Explore Execution Suite",
      targetTab: "execution"
    },
    {
      id: "tour-share",
      category: "Dashboard Tour • 4 of 4",
      disciplineName: "LAUNCH",
      disciplineColor: "#0ae448", // Shockingly Green
      title: "Share Your Invitation",
      subtitle: "Invite Your Loved Ones in Style",
      description: "Your celebration website is ready! Guests can visit your unique link or scan your bespoke QR code to RSVP, view accommodation recommendations, and read your story.",
      icon: <QrCode size={36} className="text-[#0ae448]" />,
      features: [
        { icon: <Share2 size={18} className="text-[#0ae448]" />, label: "Unique Celebration Link", detail: "Copy and send your link via WhatsApp, iMessage, or email." },
        { icon: <QrCode size={18} className="text-[#0ae448]" />, label: "Bespoke QR Code", detail: "Download high-resolution QR codes to print on physical paper invitations." },
        { icon: <Sparkles size={18} className="text-[#abff84]" />, label: "You're All Set!", detail: "Your clean slate command center is ready. Let's create unforgettable memories." }
      ],
      actionLabel: "Enter Sanctuary 🚀",
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
    <div className="fixed inset-0 z-50 bg-[#0e100f]/95 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl my-auto">
        {/* Soft Ambient 3D Wash in Discipline Hue */}
        <div 
          className="absolute -top-12 -left-12 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ background: slide.disciplineColor }}
        />
        <div 
          className="absolute -bottom-12 -right-12 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
          style={{ background: slide.disciplineColor }}
        />

        {/* GSAP Dark Canvas Card: #191919 Off-Black surface with #42433d hairline border */}
        <div className="relative rounded-[20px] sm:rounded-[32px] border border-[#42433d] shadow-2xl overflow-hidden bg-[#191919] text-[#fffce1] transition-all duration-500">
          
          {/* Top Header Section */}
          <div className="p-4 sm:p-10 border-b border-[#42433d] flex items-start justify-between gap-3 sm:gap-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
              {/* Tool Accent Shape */}
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] bg-[#0e100f] border border-[#42433d] flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden group"
                style={{ borderColor: `${slide.disciplineColor}40` }}
              >
                <div 
                  className="absolute inset-0 opacity-15 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${slide.disciplineColor}, transparent)` }}
                />
                <div className="relative z-10">
                  {slide.icon}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Curly-Bracket Annotation */}
                  <span className="text-[14px] sm:text-[16px] text-[#7c7c6f] font-mono tracking-normal">
                    {"{ "}<span className="text-[#fffce1]">{slide.category}</span>{" }"}
                  </span>

                  {/* Discipline Color Label */}
                  <span 
                    className="text-[13px] sm:text-[14px] font-mono font-bold tracking-widest uppercase px-3 py-0.5 rounded-full bg-[#0e100f] border border-[#42433d]"
                    style={{ color: slide.disciplineColor, borderColor: `${slide.disciplineColor}50` }}
                  >
                    {slide.disciplineName}
                  </span>
                </div>

                {/* Massive Hero Display Typography */}
                <h2 className="text-[22px] sm:text-[42px] font-bold text-[#fffce1] tracking-[-0.03em] leading-[0.95]">
                  {slide.title}
                </h2>

                <p 
                  className="text-[15px] sm:text-[17px] font-medium tracking-tight transition-colors duration-500"
                  style={{ color: slide.disciplineColor }}
                >
                  {slide.subtitle}
                </p>
              </div>
            </div>

            {/* Borderless Ghost Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#0e100f] hover:bg-[#42433d]/40 border border-[#42433d] flex items-center justify-center text-[#7c7c6f] hover:text-[#fffce1] transition shrink-0"
              title="Close Walkthrough"
            >
              <X size={18} />
            </button>
          </div>

          {/* Infinite Scrolling GSAP Discipline & Luxury Feature Marquee */}
          <div className="border-b border-[#42433d] bg-[#0e100f]/80 py-3 overflow-hidden">
            <Marquee pauseOnHover className="[--duration:35s] [--gap:1.5rem]">
              <span className="text-[11px] sm:text-[12px] font-mono tracking-widest uppercase text-[#fffce1] flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border border-[#0ae448]/40 bg-[#0ae448]/10 shadow-sm whitespace-nowrap"><Sparkles size={13} className="text-[#0ae448]" /> SANCTUARY • Zero Spreadsheets</span>
              <span className="text-[11px] sm:text-[12px] font-mono tracking-widest uppercase text-[#fffce1] flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border border-[#ff8709]/40 bg-[#ff8709]/10 shadow-sm whitespace-nowrap"><Users size={13} className="text-[#ff8709]" /> GUESTS • Live RSVP Verification</span>
              <span className="text-[11px] sm:text-[12px] font-mono tracking-widest uppercase text-[#fffce1] flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border border-[#fec5fb]/40 bg-[#fec5fb]/10 shadow-sm whitespace-nowrap"><Award size={13} className="text-[#fec5fb]" /> PLANNING • Vendor Vault & Budgets</span>
              <span className="text-[11px] sm:text-[12px] font-mono tracking-widest uppercase text-[#fffce1] flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border border-[#9d95ff]/40 bg-[#9d95ff]/10 shadow-sm whitespace-nowrap"><Radio size={13} className="text-[#9d95ff]" /> RADAR • 100m Geofence Arrival</span>
              <span className="text-[11px] sm:text-[12px] font-mono tracking-widest uppercase text-[#fffce1] flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border border-[#00bae2]/40 bg-[#00bae2]/10 shadow-sm whitespace-nowrap"><Clock size={13} className="text-[#00bae2]" /> COMMAND • Live Run-Sheet Sync</span>
              <span className="text-[11px] sm:text-[12px] font-mono tracking-widest uppercase text-[#fffce1] flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border border-[#abff84]/40 bg-[#abff84]/10 shadow-sm whitespace-nowrap"><ShieldCheck size={13} className="text-[#abff84]" /> PRIVACY • Bank-Grade Supabase RLS</span>
            </Marquee>
          </div>

          {/* Slide Body */}
          <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 min-h-[280px] sm:min-h-[340px] flex flex-col justify-between bg-[#0e100f]/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Warm Cream Chalk Typography */}
                <p className="text-[15px] sm:text-[20px] text-[#fffce1] leading-[1.4] sm:leading-[1.35] tracking-[-0.01em] font-normal max-w-3xl">
                  {slide.description}
                </p>

                {/* 1px Hairline Divider */}
                <div className="w-full h-px bg-[#42433d]" />

                {/* Tool Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {slide.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] bg-[#0e100f] border border-[#42433d] hover:border-[#fffce1]/40 transition-all duration-300 flex flex-col justify-between gap-2 sm:gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-xl bg-[#191919] border border-[#42433d] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                          style={{ borderColor: `${slide.disciplineColor}40` }}
                        >
                          {feat.icon}
                        </div>
                        <h4 className="font-semibold text-[15px] text-[#fffce1] tracking-tight leading-snug">
                          {feat.label}
                        </h4>
                      </div>
                      <p className="text-[12.5px] sm:text-[13.5px] text-[#7c7c6f] leading-relaxed font-normal">
                        {feat.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls & Outlined Pill Buttons */}
            <div className="pt-5 sm:pt-8 border-t border-[#42433d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              {/* Left: Step Pill Dots & Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        i === currentSlide
                          ? "w-10"
                          : "w-2.5 bg-[#42433d] hover:bg-[#7c7c6f]"
                      }`}
                      style={{
                        backgroundColor: i === currentSlide ? slide.disciplineColor : undefined
                      }}
                      title={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none text-[11px] sm:text-[13px] text-[#7c7c6f] hover:text-[#fffce1] transition font-mono">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-[#42433d] bg-[#0e100f] text-[#0ae448] focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span>{"{ Don't show automatically on login }"}</span>
                </label>
              </div>

              {/* Right: Outlined Cream Pill Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`rounded-full border border-[#42433d] text-[#fffce1] hover:border-[#fffce1] px-4 sm:px-5 py-2 sm:py-2.5 text-[13px] sm:text-[14px] font-medium transition flex items-center gap-2 ${
                    currentSlide === 0 ? "opacity-25 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  <ArrowLeft size={15} /> Back
                </button>

                <button
                  onClick={nextSlide}
                  className={`rounded-full px-5 sm:px-7 py-2 sm:py-2.5 text-[13px] sm:text-[15px] font-semibold tracking-[-0.01em] transition flex items-center gap-2 sm:gap-2.5 shadow-lg ${
                    currentSlide === slides.length - 1
                      ? "border-2 border-[#0ae448] text-[#0e100f] bg-gradient-to-r from-[#0ae448] to-[#abff84] hover:opacity-90 font-bold"
                      : "border border-[#fffce1] text-[#fffce1] bg-transparent hover:bg-[#fffce1]/10"
                  }`}
                >
                  <span>{currentSlide === slides.length - 1 ? (slide.actionLabel || "Finish") : "Next"}</span>
                  {currentSlide === slides.length - 1 ? <Sparkles size={16} className="text-[#0e100f]" /> : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
