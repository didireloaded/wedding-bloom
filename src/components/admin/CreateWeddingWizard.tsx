import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WeddingService } from "@/services";
import { toast } from "sonner";
import {
  X, Sparkles, Calendar, MapPin, Users, KeyRound,
  CheckCircle2, ArrowRight, ArrowLeft, Palette, Globe,
  ShieldCheck, Heart, Wand2, Loader2, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CreateWeddingWizardProps {
  onClose: () => void;
  onCreated: (wedding: any) => void;
}

const templateLibrary = [
  {
    name: "Classic Wedding",
    color: "#C5A059",
    tagline: "Timeless elegance & champagne tones",
    image: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Luxury Wedding",
    color: "#2B2723",
    tagline: "Obsidian glassmorphic modern luxury",
    image: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Garden Wedding",
    color: "#7A9E7E",
    tagline: "Lush botanical florals & organic charm",
    image: "https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Beach Wedding",
    color: "#5F8CA3",
    tagline: "Breezy coastal minimalism & sunset hues",
    image: "https://images.pexels.com/photos/28584778/pexels-photo-28584778.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Luminous Grace",
    color: "#D4AF37",
    tagline: "Stitch-inspired gold foil & ivory velvet",
    image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Sunset Rose",
    color: "#D98880",
    tagline: "Romantic terracotta & warm candlelight",
    image: "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

function generateCoupleCode(names: string): string {
  const cleanName = (names.split(/[\s&+,]+/)[0] || "VOW").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || "VOW"}${digits}`;
}

export const CreateWeddingWizard: React.FC<CreateWeddingWizardProps> = ({ onClose, onCreated }) => {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [coupleNames, setCoupleNames] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [slugModified, setSlugModified] = useState<boolean>(false);
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [venue, setVenue] = useState<string>("");
  const [template, setTemplate] = useState<string>("Classic Wedding");
  const [guestCount, setGuestCount] = useState<string>("120");
  const [accessCode, setAccessCode] = useState<string>("");
  const [codeModified, setCodeModified] = useState<boolean>(false);

  // Auto-generate slug and access code when couple names change
  const handleNamesChange = (val: string) => {
    setCoupleNames(val);
    if (!slugModified) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);
      setSlug(autoSlug);
    }
    if (!codeModified) {
      setAccessCode(generateCoupleCode(val));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!coupleNames.trim()) {
        toast.error("Please enter the couple's names");
        return;
      }
      if (!slug.trim()) {
        toast.error("Please provide a URL slug");
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!coupleNames.trim() || !slug.trim()) {
      toast.error("Please complete the required basic details");
      return;
    }

    setSubmitting(true);
    toast.info("Initializing celebration workspace & generating default assets...");

    try {
      const selectedTpl = templateLibrary.find((t) => t.name === template) || templateLibrary[0];
      const finalAccessCode = accessCode.trim().toUpperCase() || generateCoupleCode(coupleNames);

      const { data: wedding, error } = await WeddingService.createWeddingWithDefaults(
        {
          slug: slug.trim(),
          couple_names: coupleNames.trim(),
          wedding_date: weddingDate || null,
          ceremony_time: "16:00",
          ceremony_venue: venue.trim() || "The Grand Conservatory",
          cover_image: selectedTpl.image,
          hero_image: selectedTpl.image,
          access_code: finalAccessCode,
          guest_count: Number(guestCount) || 100,
        },
        template
      );

      if (error || !wedding) {
        toast.error(error || "Failed to create celebration workspace");
        setSubmitting(false);
        return;
      }

      toast.success(`🎉 Wedding created successfully! Access Code: ${wedding.access_code}`);
      onCreated(wedding);
    } catch (err: any) {
      toast.error(err?.message || "An error occurred during wedding creation");
      setSubmitting(false);
    }
  };

  const selectedTpl = templateLibrary.find((t) => t.name === template) || templateLibrary[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl glass-obsidian rounded-[32px] border border-white/[0.15] shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Wizard Header */}
        <div className="p-6 sm:p-8 border-b border-white/[0.1] bg-gradient-to-r from-white/[0.05] via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Wand2 size={20} />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-[#D4AF37] font-bold">
                Celebration Architect
              </div>
              <h2 className="display text-[24px] sm:text-[28px] font-bold text-white leading-tight">
                Create Wedding Celebration
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition flex items-center justify-center text-[#A8A29E] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 sm:px-8 py-4 bg-black/40 border-b border-white/[0.06] flex items-center justify-between">
          {[
            { id: 1, label: "Basics", icon: Heart },
            { id: 2, label: "Style & Theme", icon: Palette },
            { id: 3, label: "Guests & Access", icon: ShieldCheck },
            { id: 4, label: "Review & Launch", icon: Sparkles },
          ].map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                      isActive
                        ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        : isDone
                        ? "bg-[#7A9E7E] text-white"
                        : "bg-white/[0.08] text-[#78716C]"
                    }`}
                  >
                    {isDone ? <Check size={14} /> : s.id}
                  </div>
                  <span
                    className={`text-[12px] font-medium hidden sm:inline ${
                      isActive ? "text-white font-semibold" : isDone ? "text-[#7A9E7E]" : "text-[#78716C]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 3 && <div className="flex-1 h-[1px] bg-white/[0.08] mx-2 sm:mx-4" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[60vh] sm:max-h-[550px]">
          <AnimatePresence mode="wait">
            {/* STEP 1: BASICS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-[20px] font-bold text-white mb-1">Essential Details</h3>
                  <p className="text-[13px] text-[#A8A29E]">
                    Enter the couple's names and set up their dedicated web address and date.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-mono tracking-wider uppercase text-[#D4AF37] mb-2 font-semibold">
                      Couple Names *
                    </label>
                    <input
                      required
                      value={coupleNames}
                      onChange={(e) => handleNamesChange(e.target.value)}
                      placeholder="e.g. Elara & Julian"
                      className="fv-input !text-[16px] !py-3.5 bg-white/[0.04] border-white/[0.15] focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-mono tracking-wider uppercase text-[#A8A29E] mb-2 font-semibold flex items-center gap-1.5">
                        <Globe size={14} className="text-[#D4AF37]" /> URL Slug *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#78716C] text-[13px] select-none font-mono">
                          /wedding/
                        </span>
                        <input
                          required
                          value={slug}
                          onChange={(e) => {
                            setSlug(e.target.value);
                            setSlugModified(true);
                          }}
                          placeholder="elara-julian"
                          className="fv-input !pl-[90px] font-mono text-[13px] bg-white/[0.04] border-white/[0.15] focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-mono tracking-wider uppercase text-[#A8A29E] mb-2 font-semibold flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#D4AF37]" /> Wedding Date
                      </label>
                      <input
                        type="date"
                        value={weddingDate}
                        onChange={(e) => setWeddingDate(e.target.value)}
                        className="fv-input text-[14px] bg-white/[0.04] border-white/[0.15] focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-mono tracking-wider uppercase text-[#A8A29E] mb-2 font-semibold flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#D4AF37]" /> Primary Ceremony Venue
                    </label>
                    <input
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Villa Rose, Lake Como"
                      className="fv-input bg-white/[0.04] border-white/[0.15] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: STYLE & THEME */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-[20px] font-bold text-white mb-1">Aesthetic & Design Template</h3>
                  <p className="text-[13px] text-[#A8A29E]">
                    Select a curated luxury theme and color palette. This will configure the invitation, hero imagery, and typography.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templateLibrary.map((t) => {
                    const isSelected = template === t.name;
                    return (
                      <div
                        key={t.name}
                        onClick={() => setTemplate(t.name)}
                        className={`group relative rounded-[20px] border overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/40 bg-white/[0.06] shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                            : "border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.2]"
                        }`}
                      >
                        <div className="h-32 w-full relative overflow-hidden">
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                            <span className="text-[14px] font-bold text-white">{t.name}</span>
                            <div
                              className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                              style={{ backgroundColor: t.color }}
                            />
                          </div>
                        </div>
                        <div className="p-3.5 flex items-center justify-between">
                          <span className="text-[12px] text-[#A8A29E] truncate">{t.tagline}</span>
                          {isSelected && (
                            <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 ml-2 animate-bounce" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: GUESTS & ACCESS */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-[20px] font-bold text-white mb-1">Guests & Security Access</h3>
                  <p className="text-[13px] text-[#A8A29E]">
                    Set expected guest numbers and customize the security code required for couple cockpit login and guest RSVP verification.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-mono tracking-wider uppercase text-[#A8A29E] mb-2 font-semibold flex items-center gap-1.5">
                      <Users size={14} className="text-[#D4AF37]" /> Expected Guest Count
                    </label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="fv-input max-w-[200px] bg-white/[0.04] border-white/[0.15] focus:border-[#D4AF37]"
                    />
                    <p className="text-[11px] text-[#78716C] mt-1.5">
                      Used to calculate venue capacity, check-in percentages, and floor plan table recommendations.
                    </p>
                  </div>

                  <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/[0.1] space-y-3">
                    <label className="block text-[12px] font-mono tracking-wider uppercase text-[#D4AF37] font-bold flex items-center gap-1.5">
                      <KeyRound size={15} /> Couple Access Code (PIN / Password)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        value={accessCode}
                        onChange={(e) => {
                          setAccessCode(e.target.value.toUpperCase());
                          setCodeModified(true);
                        }}
                        placeholder="VOW2026"
                        className="fv-input font-mono uppercase text-[16px] tracking-widest font-bold !py-3 bg-black/40 border-white/[0.2] max-w-[240px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const code = generateCoupleCode(coupleNames);
                          setAccessCode(code);
                          setCodeModified(true);
                          toast.success(`Generated new code: ${code}`);
                        }}
                        className="fv-btn-secondary !py-3 !px-4 text-[12px] bg-white/[0.05] hover:bg-white/[0.1]"
                      >
                        <Sparkles size={14} className="text-[#D4AF37]" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                    <p className="text-[12px] text-[#A8A29E] leading-relaxed">
                      This unique code allows the couple to securely sign into their Day-Of Cockpit, manage RSVPs, and broadcast live alerts without needing complex passwords.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & LAUNCH */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-[20px] font-bold text-white mb-1">Review & Launch Celebration</h3>
                  <p className="text-[13px] text-[#A8A29E]">
                    Please verify the details below. Once launched, default sample events, gallery items, and tasks will be initialized automatically.
                  </p>
                </div>

                <GlassCard variant="obsidian" padding="lg" className="border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1714] to-[#0C0A09] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                    <div>
                      <span className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                        Ready for Launch
                      </span>
                      <h4 className="display text-[22px] font-bold text-white mt-0.5">{coupleNames || "The Couple"}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      {template}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[13px]">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#78716C] block">URL Address</span>
                      <span className="text-white font-mono font-medium">/wedding/{slug}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#78716C] block">Wedding Date</span>
                      <span className="text-white font-medium">{weddingDate || "Not Specified (TBD)"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#78716C] block">Primary Venue</span>
                      <span className="text-white font-medium">{venue || "The Grand Conservatory"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#78716C] block">Expected Guests</span>
                      <span className="text-white font-medium">{guestCount} Guests</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[11px] font-mono uppercase text-[#78716C] block">Couple Access Code</span>
                      <span className="text-[#D4AF37] font-mono font-bold text-[16px] tracking-wider">
                        {accessCode || generateCoupleCode(coupleNames)}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                <div className="p-4 rounded-[16px] bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center gap-3">
                  <Sparkles size={20} className="text-[#D4AF37] shrink-0" />
                  <p className="text-[12px] text-[#FAF7F2] leading-relaxed font-serif">
                    Launching will create the couple workspace, pre-populate standard wedding day timeline events, configure RSVP forms, and activate geo-fenced guest check-in radar.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer / Controls */}
        <div className="p-6 sm:p-8 bg-black/40 border-t border-white/[0.08] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="fv-btn-secondary !py-2.5 !px-5 text-[13px] flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1]"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="fv-btn-ghost !py-2.5 !px-5 text-[13px] text-[#A8A29E] hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="fv-btn-primary !py-2.5 !px-6 text-[13px] flex items-center gap-2 bg-[#D4AF37] text-black hover:bg-[#ffe088] font-bold"
              >
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="fv-btn-primary !py-3 !px-8 text-[14px] flex items-center gap-2.5 bg-gradient-to-r from-[#D4AF37] to-[#e9c349] text-black hover:opacity-90 font-bold shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Launching Celebration...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Create & Launch Wedding</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
