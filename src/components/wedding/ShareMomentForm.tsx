import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareMomentFormProps {
  weddingId: string;
  isLiveMode?: boolean;
  onPosted: (moment: any) => void;
}

const ShareMomentForm = ({ weddingId, isLiveMode, onPosted }: ShareMomentFormProps) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  const handleSubmit = async () => {
    if (!name.trim() || (!message.trim() && !photo)) return;
    setUploading(true);

    try {
      let photoUrl: string | null = null;

      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${weddingId}/moments/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("wedding-assets")
          .upload(path, photo, { contentType: photo.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("wedding-assets")
          .getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("wedding_moments")
        .insert({
          wedding_id: weddingId,
          guest_name: name.trim(),
          message: message.trim() || null,
          photo_url: photoUrl,
        } as any)
        .select()
        .single();

      if (error) throw error;

      if (isLiveMode && data) {
        onPosted(data);
      } else {
        toast.success("Your moment has been submitted for approval ✨");
      }

      setName("");
      setMessage("");
      setPhoto(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to post moment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border bg-background p-6 sm:p-8"
    >
      <p className="wedding-label mb-6">SHARE A MOMENT</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-sm focus:outline-none focus:border-foreground mb-6"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write something for everyone to see..."
        rows={3}
        className="w-full bg-transparent border border-foreground/10 p-4 font-body text-sm resize-none focus:outline-none focus:border-foreground/40 mb-4"
      />

      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2 cursor-pointer border border-foreground/15 px-4 py-2.5 font-body text-[10px] tracking-[0.2em] uppercase hover:bg-muted transition-colors min-h-[44px]">
          <Camera className="w-3.5 h-3.5" />
          {photo ? photo.name.slice(0, 20) + "..." : "Add Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="sr-only"
          />
        </label>
        {photo && (
          <button
            onClick={() => setPhoto(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={uploading || (!message.trim() && !photo) || !name.trim()}
        className="w-full py-4 bg-foreground text-background font-body text-[10px] tracking-[0.3em] uppercase hover:bg-foreground/90 transition-colors min-h-[52px] disabled:opacity-40"
      >
        {uploading ? "POSTING..." : "POST MOMENT"}
      </button>

      {!isLiveMode && (
        <p className="font-body text-[10px] text-muted-foreground/60 text-center mt-3">
          Your post will appear after approval by the couple.
        </p>
      )}
    </motion.div>
  );
};

export default ShareMomentForm;
