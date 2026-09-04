import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Sparkles, MessageSquare, CalendarPlus } from "lucide-react";
import { generateICS } from "@/lib/calendarUtils";
import { saveGuestSessionToken } from "@/lib/guestSession";

interface RSVPSectionProps {
  weddingId?: string;
  weddingDate?: string | null;
  ceremonyTime?: string | null;
  venue?: string;
  coupleNames?: string;
  rsvpDeadline?: string | null;
  whatsappGroupUrl?: string | null;
  maxGuests?: number | null;
  rsvpImage?: string | null;
}

const DIETARY_OPTIONS = [
  "No preference",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten free",
  "Other",
];

const RSVPSection = ({ weddingId, weddingDate, ceremonyTime, venue, coupleNames, rsvpDeadline, whatsappGroupUrl, maxGuests, rsvpImage }: RSVPSectionProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    attending: "",
    guestCount: "1",
    dietaryPreference: "",
    dietaryNote: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attendingStatus, setAttendingStatus] = useState("");
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  const [naturalInput, setNaturalInput] = useState("");
  const [parsingAI, setParsingAI] = useState(false);
  const [aiParsedHint, setAiParsedHint] = useState(false);

  const parseNaturalLanguage = async () => {
    if (!naturalInput.trim()) { toast.error("Please type your RSVP message."); return; }
    setParsingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "parse_natural_rsvp", message: naturalInput },
      });
      if (error) throw error;
      if (data?.result) {
        const parsed = data.result;
        setForm((prev) => ({
          ...prev,
          attending: parsed.attending ? "accept" : "decline",
          guestCount: String(parsed.guest_count || 1),
          dietaryPreference: parsed.dietary_preferences?.[0] || "",
          message: naturalInput,
        }));
        setUseNaturalLanguage(false);
        setAiParsedHint(true);
        toast.success(`Got it! ${parsed.attending ? "Attending" : "Not attending"} with ${parsed.guest_count} guest(s). Please review and submit.`);
      }
    } catch {
      toast.error("Couldn't understand that. Please try the form instead.");
    }
    setParsingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.attending) { toast.error("Please select whether you will attend."); return; }
    if (!form.name.trim()) { toast.error("Please enter your name."); return; }
    setSubmitting(true);
    if (weddingId) {
      // Check capacity before accepting
      if (form.attending === "accept" && maxGuests) {
        const { data: currentRsvps } = await supabase
          .from("rsvps")
          .select("guest_count")
          .eq("wedding_id", weddingId)
          .eq("attending", true);
        const currentTotal = (currentRsvps || []).reduce((s, r) => s + r.guest_count, 0);
        if (currentTotal + parseInt(form.guestCount) > maxGuests) {
          toast.error(`Sorry, the event has reached its capacity of ${maxGuests} guests.`);
          setSubmitting(false);
          return;
        }
      }
      // Check for duplicate RSVP
      const { data: existing } = await supabase
        .from("rsvps")
        .select("id")
        .eq("wedding_id", weddingId)
        .eq("guest_name", form.name.trim())
        .maybeSingle();
      if (existing) {
        // Update existing RSVP instead of creating duplicate
        const { error } = await supabase.from("rsvps").update({
          attending: form.attending === "accept",
          guest_count: parseInt(form.guestCount),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          dietary_preference: form.dietaryPreference || null,
          dietary_note: form.dietaryNote.trim() || null,
          message: form.message.trim() || null,
        }).eq("id", existing.id);
        if (error) { toast.error("Something went wrong. Please try again."); setSubmitting(false); return; }
        toast.success("Your RSVP has been updated!");
        const session = await supabase.functions.invoke("create-guest-session", { body: { wedding_id: weddingId, rsvp_id: existing.id, guest_name: form.name.trim(), email: form.email.trim() } });
        if (session.data?.guest_session) saveGuestSessionToken(weddingId, session.data.guest_session);
      } else {
        const { data: created, error } = await supabase.from("rsvps").insert({
          wedding_id: weddingId,
          guest_name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          attending: form.attending === "accept",
          guest_count: parseInt(form.guestCount),
          dietary_preference: form.dietaryPreference || null,
          dietary_note: form.dietaryNote.trim() || null,
          message: form.message.trim() || null,
        } as any);
        if (error) { toast.error("Something went wrong. Please try again."); setSubmitting(false); return; }
        toast.success("Thank you! Your RSVP has been submitted.");
        const session = await supabase.functions.invoke("create-guest-session", { body: { wedding_id: weddingId, rsvp_id: created?.id, guest_name: form.name.trim(), email: form.email.trim() } });
        if (session.data?.guest_session) saveGuestSessionToken(weddingId, session.data.guest_session);
      }
    }
    setAttendingStatus(form.attending);
    setSubmitted(true);
    setSubmitting(false);
  };

  const isPastDeadline = rsvpDeadline && new Date(rsvpDeadline + "T23:59:59") < new Date();

  if (isPastDeadline && !submitted) {
    return (
      <section id="rsvp" className="wedding-section bg-wedding-blush/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <Heart className="w-10 h-10 mx-auto mb-6 text-muted-foreground/40" strokeWidth={1} />
          <h2 className="mb-4 font-body text-3xl font-semibold sm:text-4xl">RSVPs are closed</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            The RSVP deadline was {new Date(rsvpDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Please contact the couple directly.
          </p>
        </motion.div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section id="rsvp" className="wedding-section bg-wedding-blush/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <Heart className="w-10 h-10 mx-auto mb-6 text-wedding-gold" strokeWidth={1} />
          <h2 className="mb-4 font-body text-3xl font-semibold sm:text-4xl">Thank you</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Your response has been received. We can't wait to celebrate with you!
          </p>
          {weddingDate && (
            <button
              onClick={() => generateICS(coupleNames || "", weddingDate, ceremonyTime || null, venue || "", window.location.href)}
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-foreground px-6 py-3.5 font-body text-xs font-semibold text-background transition-opacity hover:opacity-85"
            >
              <CalendarPlus className="w-3.5 h-3.5" /> ADD TO CALENDAR
            </button>
          )}
          {whatsappGroupUrl && attendingStatus === "accept" && (
            <motion.a
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex min-h-[52px] items-center gap-3 rounded-full bg-[#25D366] px-6 py-4 font-body text-xs font-semibold text-white transition-colors hover:bg-[#1ebe5d]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Join the Wedding Group
            </motion.a>
          )}
        </motion.div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="wedding-section bg-wedding-blush/50">
      <div className="max-w-xl mx-auto">
        {/* RSVP Featured Image */}
        {rsvpImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 overflow-hidden rounded-[24px] shadow-lg shadow-foreground/5"
          >
            <img
              src={rsvpImage}
              alt="Join us on our special day"
              className="w-full h-64 sm:h-80 object-cover"
              loading="lazy"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="mb-3 font-body text-xs font-semibold text-muted-foreground">Your RSVP</p>
          <h2 className="mb-3 font-body text-3xl font-semibold">Will you be there?</h2>
          <p className="font-body text-sm leading-6 text-muted-foreground">
            Let the couple know who is coming and anything they should prepare for.
          </p>
        </motion.div>

        {/* AI Natural Language Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() => setUseNaturalLanguage(!useNaturalLanguage)}
            className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border font-body text-xs font-semibold transition-all duration-300 ${
              useNaturalLanguage
                ? "bg-wedding-champagne border-wedding-gold/40 text-foreground"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {useNaturalLanguage ? "Use Form Instead" : "Just type what you want to say"}
          </button>
        </motion.div>

        {useNaturalLanguage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 rounded-[28px] border border-black/10 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-2 text-wedding-gold">
              <MessageSquare className="w-5 h-5" />
              <p className="wedding-label">TYPE NATURALLY</p>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              Type naturally, like "I'll be there with my partner" or "Sorry, I can't make it"
            </p>
            <textarea
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="Type your RSVP message here..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-black/10 bg-black/[0.025] p-4 font-body text-sm outline-none transition focus:border-black/30 placeholder:text-muted-foreground/50"
            />
            <button
              type="button"
              onClick={parseNaturalLanguage}
              disabled={parsingAI || !naturalInput.trim()}
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 font-body text-xs font-semibold text-background disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {parsingAI ? "Understanding..." : "Submit"}
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-7 rounded-[28px] border border-black/5 bg-white p-5 shadow-sm sm:p-8"
          >
            {/* 1. Attendance — FIRST and biggest */}
            <div>
              <label className="wedding-label block mb-4">
                Will you attend?
                {aiParsedHint && <span className="ml-2 text-wedding-gold text-[9px]">✨ Filled from your message</span>}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "accept", label: "Joyfully Accept" },
                  { key: "decline", label: "Regretfully Decline" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => { setForm({ ...form, attending: option.key }); setAiParsedHint(false); }}
                    className={`min-h-[58px] rounded-2xl border py-4 font-body text-xs font-semibold transition-all duration-300 ${
                      form.attending === option.key
                        ? "bg-foreground text-background border-foreground shadow-md"
                        : "border-foreground/15 hover:border-foreground/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Name */}
            <div>
              <label className="wedding-label block mb-3">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 font-body text-sm outline-none transition focus:border-black/30 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* 3. Guest count (only if attending) */}
            {form.attending === "accept" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <label className="wedding-label block mb-3">
                  Number of guests
                  {aiParsedHint && <span className="ml-2 text-wedding-gold text-[9px]">✨ Filled from your message</span>}
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { setForm({ ...form, guestCount: String(n) }); setAiParsedHint(false); }}
                      className={`h-12 w-12 rounded-full border font-body text-sm font-semibold transition-all duration-300 ${
                        form.guestCount === String(n)
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground/15 hover:border-foreground/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. Dietary (only if attending) */}
            {form.attending === "accept" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                <div>
                  <label className="wedding-label block mb-3">Dietary preference</label>
                  <select
                    value={form.dietaryPreference}
                    onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value, dietaryNote: e.target.value !== "Other" ? "" : form.dietaryNote })}
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 font-body text-sm outline-none transition focus:border-black/30"
                  >
                    <option value="">Select if applicable</option>
                    {DIETARY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {form.dietaryPreference === "Other" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="wedding-label block mb-3">Please specify</label>
                    <input
                      type="text"
                      value={form.dietaryNote}
                      onChange={(e) => setForm({ ...form, dietaryNote: e.target.value })}
                      placeholder="Allergies or dietary requirements..."
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 font-body text-sm outline-none transition focus:border-black/30 placeholder:text-muted-foreground/50"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* 5. Contact (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="wedding-label block mb-3">Email <span className="text-muted-foreground/50 text-[9px] font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 font-body text-sm outline-none transition focus:border-black/30 placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="wedding-label block mb-3">Phone <span className="text-muted-foreground/50 text-[9px] font-normal">(optional)</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                  className="w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 font-body text-sm outline-none transition focus:border-black/30 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* 6. Message */}
            <div>
              <label className="wedding-label block mb-3">Message for the couple</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                placeholder="Share your wishes..."
                className="w-full resize-none rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 font-body text-sm outline-none transition focus:border-black/30 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[56px] w-full rounded-full bg-foreground py-5 font-body text-xs font-semibold text-background shadow-lg shadow-foreground/10 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "SENDING..." : "SEND RSVP"}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default RSVPSection;
