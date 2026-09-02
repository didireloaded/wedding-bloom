import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Upload, MessageCircle } from "lucide-react";

interface GuestbookProps {
  weddingId: string;
  coupleNames?: string;
}

const Guestbook = ({ weddingId, coupleNames }: GuestbookProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", message: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [weddingId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("guestbook")
      .select("*")
      .eq("wedding_id", weddingId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (data) setMessages(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Please fill in your name and message.");
      return;
    }
    if (form.name.length > 100 || form.message.length > 1000) {
      toast.error("Name or message is too long.");
      return;
    }

    setSubmitting(true);
    let photoUrl: string | null = null;

    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${weddingId}/guestbook/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("wedding-assets").upload(path, photo);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
        photoUrl = publicUrl;
      }
    }

    let autoApprove = false;
    try {
      const moderationRes = await supabase.functions.invoke("ai-wedding", {
        body: { type: "moderate_guestbook", guestName: form.name.trim(), message: form.message.trim() },
      });
      if (moderationRes.data?.result?.approved && moderationRes.data?.result?.confidence > 0.8) {
        autoApprove = true;
      }
    } catch {
      // If moderation fails, default to manual approval
    }

    const { error } = await supabase.from("guestbook").insert({
      wedding_id: weddingId,
      guest_name: form.name.trim().slice(0, 100),
      message: form.message.trim().slice(0, 1000),
      photo_url: photoUrl,
      approved: autoApprove,
    } as any);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    toast.success(autoApprove
      ? "Thank you! Your message has been posted."
      : "Thank you! Your message will appear after review."
    );
    setSubmitted(true);
    setSubmitting(false);
    if (autoApprove) fetchMessages();
  };

  const couplePlaceholder = coupleNames
    ? `Something you want ${coupleNames} to remember...`
    : "Write your message to the couple...";

  return (
    <section id="guestbook" className="wedding-section bg-wedding-champagne/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="wedding-label mb-4">GUESTBOOK</p>
          <h2 className="font-display text-3xl sm:text-4xl font-light italic">Leave a Message for the Couple</h2>
          {coupleNames && (
            <p className="font-body text-xs text-muted-foreground mt-4">
              Write something that {coupleNames} will treasure forever.
            </p>
          )}
        </motion.div>

        {/* Message Wall — masonry */}
        {messages.length > 0 && (
          <div className="columns-1 sm:columns-2 gap-4 space-y-4 mb-16">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="break-inside-avoid border border-border/40 bg-wedding-champagne/10 p-6"
              >
                <p className="font-display text-base sm:text-lg font-light italic leading-relaxed">
                  "{msg.message}"
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {msg.photo_url && (
                    <img
                      src={msg.photo_url}
                      alt={`From ${msg.guest_name}`}
                      className="w-[60px] h-[60px] object-cover shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                      {msg.guest_name}
                    </p>
                    <p className="font-body text-[9px] tracking-wider text-muted-foreground/60 mt-0.5">
                      {new Date(msg.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Form */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <MessageCircle className="w-10 h-10 mx-auto mb-5 text-wedding-gold" strokeWidth={1} />
            <h3 className="font-display text-2xl font-light mb-3">Message Sent</h3>
            <p className="font-body text-sm text-muted-foreground">Your message will appear after the couple approves it.</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto bg-background/80 backdrop-blur-sm border border-border/40 p-8 sm:p-10 space-y-6 shadow-lg shadow-foreground/3"
          >
            <div>
              <label className="wedding-label block mb-3">YOUR NAME</label>
              <input
                type="text"
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-transparent border-b border-foreground/15 py-3 font-body text-sm focus:outline-none focus:border-wedding-gold transition-colors placeholder:text-muted-foreground/40"
              />
            </div>

            <div>
              <label className="wedding-label block mb-3">YOUR MESSAGE</label>
              <textarea
                required
                maxLength={1000}
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={couplePlaceholder}
                className="w-full bg-transparent border-b border-foreground/15 py-3 font-body text-sm focus:outline-none focus:border-wedding-gold transition-colors resize-none placeholder:text-muted-foreground/40"
              />
              <p className="font-body text-[9px] text-muted-foreground/50 mt-1 text-right">{form.message.length}/1000</p>
            </div>

            <div>
              <label className="wedding-label block mb-3">ATTACH A PHOTO (OPTIONAL)</label>
              <label className="inline-flex items-center gap-2 px-5 py-3 border border-foreground/15 cursor-pointer font-body text-[10px] tracking-[0.2em] uppercase hover:border-foreground/30 transition-colors min-h-[44px]">
                <Upload className="w-3.5 h-3.5" />
                {photo ? photo.name.slice(0, 20) : "CHOOSE PHOTO"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-foreground text-background font-body text-[10px] sm:text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all duration-300 min-h-[56px] disabled:opacity-50 shadow-lg shadow-foreground/10"
            >
              {submitting ? "SENDING..." : "SEND YOUR WISHES"}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default Guestbook;
