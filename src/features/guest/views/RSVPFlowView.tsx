import React, { useState } from "react";
import {
  Mail, Utensils, Info, Send, Heart, CheckCircle2, User, Users,
  MessageSquare, Music, Sparkles, AlertCircle, ArrowLeft, X
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { submitRSVPToBackend } from "@/utils/supabase";
import type { Wedding } from "@/types/wedding";

interface RSVPFlowViewProps {
  wedding: Wedding;
  isPreview?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function RSVPFlowView({
  wedding,
  isPreview = false,
  onComplete,
  onCancel,
}: RSVPFlowViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    email: "",
    attending: "yes" as "yes" | "no",
    guest_count: 1,
    meal: "beef" as "beef" | "salmon" | "vegetarian" | "other",
    custom_meal: "",
    dietary_restrictions: "",
    song_request: "",
    note: "",
  });

  const update = (key: keyof typeof form, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      toast.info("Preview Mode — RSVP submissions are simulated");
      setSubmitted(true);
      return;
    }

    if (!form.guest_name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);

    const mealStr = form.meal === "beef"
      ? "Filet Mignon"
      : form.meal === "salmon"
      ? "Herb-Crusted Salmon"
      : form.meal === "vegetarian"
      ? "Roasted Eggplant Tart (V)"
      : form.custom_meal.trim() || "No preference";

    const payload = {
      wedding_id: wedding.id,
      guest_name: form.guest_name.trim(),
      email: form.email.trim() || null,
      attending: form.attending === "yes" ? "confirmed" : "declined",
      guest_count: form.attending === "yes" ? Number(form.guest_count) || 1 : 0,
      dietary_preference: form.attending === "yes"
        ? [mealStr, form.dietary_restrictions.trim()].filter(Boolean).join(" | ")
        : null,
      message: [
        form.note ? `Note: ${form.note.trim()}` : "",
        form.song_request ? `Song: ${form.song_request.trim()}` : "",
      ].filter(Boolean).join("\n\n") || null,
      submitted_at: new Date().toISOString(),
    };

    try {
      const res = await submitRSVPToBackend(payload);
      if (!res.success) {
        toast.error(res.error || "Could not submit RSVP. Please try again.");
        setLoading(false);
        return;
      }
      setLoading(false);
      setSubmitted(true);
      toast.success(form.attending === "yes" ? "RSVP Confirmed! ✨" : "RSVP Received", {
        description: form.attending === "yes" ? "We can't wait to celebrate with you!" : "Thank you for letting us know.",
      });
      if (onComplete) onComplete();
    } catch (err: any) {
      toast.error("An unexpected error occurred while submitting.");
      setLoading(false);
    }
  };

  const coverImg = wedding.rsvp_image || wedding.cover_image || wedding.hero_image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-500">
        <GlassCard variant="obsidian" className="p-8 md:p-14 text-center border border-primary-fixed/40 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 rounded-full bg-[#7A9E7E]/20 border border-[#7A9E7E]/40 flex items-center justify-center text-[#7A9E7E] mx-auto shadow-inner">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ivory">
              {form.attending === "yes" ? "We Can't Wait to See You!" : "Thank You for Responding"}
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
              {form.attending === "yes"
                ? `Your RSVP for ${form.guest_count} ${form.guest_count === 1 ? "guest" : "guests"} has been recorded. We will send reminders and logistical updates as the date approaches.`
                : "We are sorry you won't be able to make it, but we deeply appreciate you letting us know in advance."}
            </p>
          </div>

          <div className="pt-6 border-t border-white/[0.1] flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-full border border-white/[0.2] text-xs font-mono uppercase tracking-widest text-ivory hover:bg-white/[0.05] transition"
            >
              Submit Another RSVP
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="fv-btn-primary px-6 py-2.5 rounded-full text-xs font-bold"
              >
                Return to Invitation
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  const inputCls = "w-full rounded-2xl border border-white/[0.15] bg-obsidian/60 px-4 py-3.5 outline-none focus:ring-1 focus:ring-primary-fixed focus:border-primary-fixed transition text-sm text-ivory placeholder:text-muted/60";
  const labelCls = "block text-xs font-mono uppercase tracking-widest text-primary-fixed font-bold mb-2";

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4 sm:px-6 space-y-10 animate-in fade-in duration-500">
      {/* Header Image & Intro */}
      <section className="flex flex-col gap-5 text-center items-center">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 border-4 border-white/[0.15] shadow-2xl relative">
          <img src={coverImg} alt="RSVP Invitation" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-primary-fixed font-bold flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-primary-fixed" />
            {wedding.couple_names}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ivory tracking-tight">
            Your Presence is Requested
          </h1>
          <p className="text-sm md:text-base text-muted max-w-md mx-auto leading-relaxed font-light">
            We joyfully invite you to share in our special celebration. Please let us know if you will be joining us.
          </p>
        </div>
      </section>

      {/* RSVP Form Flow */}
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Step 1: Guest Identity */}
        <GlassCard variant="obsidian" className="p-6 md:p-8 space-y-6 border border-white/[0.12] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.1] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-fixed">
                <User size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-ivory">Your Information</h2>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-2 text-muted hover:text-ivory transition rounded-lg hover:bg-white/[0.05]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                required
                value={form.guest_name}
                onChange={(e) => update("guest_name", e.target.value)}
                placeholder="e.g. Eleanor &amp; Arthur Vance"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="hello@example.com"
                className={inputCls}
              />
            </div>
          </div>
        </GlassCard>

        {/* Step 2: Attendance */}
        <GlassCard variant="obsidian" className="p-6 md:p-8 space-y-6 border border-white/[0.12] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/[0.1] pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-fixed">
              <Mail size={20} />
            </div>
            <h2 className="font-serif text-xl font-bold text-ivory">Will You Attend?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="relative cursor-pointer group">
              <input
                type="radio"
                name="attendance"
                value="yes"
                checked={form.attending === "yes"}
                onChange={() => update("attending", "yes")}
                className="sr-only"
              />
              <div className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${
                form.attending === "yes"
                  ? "border-primary-fixed bg-primary-container/15 shadow-lg"
                  : "border-white/[0.15] bg-obsidian/40 hover:bg-white/[0.03]"
              }`}>
                <span className="font-serif text-base font-bold text-ivory">Joyfully Accepts</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  form.attending === "yes" ? "border-primary-fixed" : "border-white/[0.3]"
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-transform ${
                    form.attending === "yes" ? "bg-primary-fixed scale-100" : "bg-transparent scale-0"
                  }`} />
                </div>
              </div>
            </label>

            <label className="relative cursor-pointer group">
              <input
                type="radio"
                name="attendance"
                value="no"
                checked={form.attending === "no"}
                onChange={() => update("attending", "no")}
                className="sr-only"
              />
              <div className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${
                form.attending === "no"
                  ? "border-primary-fixed bg-primary-container/15 shadow-lg"
                  : "border-white/[0.15] bg-obsidian/40 hover:bg-white/[0.03]"
              }`}>
                <span className="font-serif text-base font-bold text-ivory">Regretfully Declines</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  form.attending === "no" ? "border-primary-fixed" : "border-white/[0.3]"
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-transform ${
                    form.attending === "no" ? "bg-primary-fixed scale-100" : "bg-transparent scale-0"
                  }`} />
                </div>
              </div>
            </label>
          </div>

          {form.attending === "yes" && (
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-primary-fixed font-bold">Party Size</label>
                <span className="text-xs text-muted">Number of guests attending (including yourself)</span>
              </div>
              <select
                value={form.guest_count}
                onChange={(e) => update("guest_count", Number(e.target.value))}
                className="rounded-xl border border-white/[0.2] bg-obsidian text-ivory px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-primary-fixed outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </GlassCard>

        {/* Step 3: Meal Selection (Only if Attending) */}
        <div className={`transition-all duration-500 space-y-8 ${form.attending === "no" ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
          <GlassCard variant="obsidian" className="p-6 md:p-8 space-y-6 border border-white/[0.12] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/[0.1] pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-fixed">
                <Utensils size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-ivory">Meal Selection</h2>
            </div>
            <p className="text-xs text-muted">Please select an entrée preference for your celebration dinner.</p>

            <div className="space-y-3.5">
              {[
                { id: "beef", label: "Filet Mignon", desc: "With roasted root vegetables and a red wine reduction." },
                { id: "salmon", label: "Herb-Crusted Salmon", desc: "Served over wild rice pilaf with lemon butter sauce." },
                { id: "vegetarian", label: "Roasted Eggplant Tart", desc: "With goat cheese, heirloom tomatoes, and balsamic glaze. (V)" },
                { id: "other", label: "Other / Custom Dietary Need", desc: "Specify any custom culinary preferences below." },
              ].map((item) => (
                <label key={item.id} className="relative cursor-pointer block">
                  <input
                    type="radio"
                    name="meal"
                    value={item.id}
                    checked={form.meal === item.id}
                    onChange={() => update("meal", item.id)}
                    className="sr-only"
                  />
                  <div className={`border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 ${
                    form.meal === item.id
                      ? "border-primary-fixed bg-primary-container/15 shadow-md"
                      : "border-white/[0.12] bg-obsidian/40 hover:bg-white/[0.03]"
                  }`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      form.meal === item.id ? "border-primary-fixed" : "border-white/[0.3]"
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full transition-transform ${
                        form.meal === item.id ? "bg-primary-fixed scale-100" : "bg-transparent scale-0"
                      }`} />
                    </div>
                    <div>
                      <span className="font-serif text-sm sm:text-base font-bold text-ivory block">{item.label}</span>
                      <span className="text-xs text-muted block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                </label>
              ))}

              {form.meal === "other" && (
                <div className="pt-2">
                  <input
                    value={form.custom_meal}
                    onChange={(e) => update("custom_meal", e.target.value)}
                    placeholder="Please describe your meal preference..."
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </GlassCard>

          {/* Step 4: Dietary Restrictions & Notes */}
          <GlassCard variant="obsidian" className="p-6 md:p-8 space-y-6 border border-white/[0.12] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/[0.1] pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-fixed">
                <Info size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-ivory">Dietary Needs &amp; Wishes</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelCls}>Allergies or Dietary Restrictions</label>
                <input
                  value={form.dietary_restrictions}
                  onChange={(e) => update("dietary_restrictions", e.target.value)}
                  placeholder="e.g. Gluten-free, Nut allergy, Dairy-free"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}><Music size={13} className="inline mr-1" /> Song Request for the Dance Floor</label>
                <input
                  value={form.song_request}
                  onChange={(e) => update("song_request", e.target.value)}
                  placeholder="What song will get you dancing?"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Note for the Couple</label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Share a heartfelt message or congratulatory wish..."
                  className={inputCls}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Submission Area */}
        <div className="pt-6 pb-12 flex flex-col items-center text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[260px] fv-btn-primary py-4 px-10 rounded-full font-bold text-sm flex items-center justify-center gap-3 shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:scale-105 transition duration-300 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                <span>Submitting RSVP...</span>
              </>
            ) : (
              <>
                <span>Submit RSVP</span>
                <Send size={16} />
              </>
            )}
          </button>
          <p className="text-xs font-mono text-muted mt-4">
            Please submit your response by August 1st, 2025.
          </p>
        </div>
      </form>
    </div>
  );
}
