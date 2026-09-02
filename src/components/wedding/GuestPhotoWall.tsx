import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from "lucide-react";

interface GuestPhotoWallProps {
  weddingId: string;
}

const GuestPhotoWall = ({ weddingId }: GuestPhotoWallProps) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    fetchPhotos();
    const channel = supabase
      .channel(`guest-photos-${weddingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_photos", filter: `wedding_id=eq.${weddingId}` },
        () => fetchPhotos()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [weddingId]);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("guest_photos")
      .select("*")
      .eq("wedding_id", weddingId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (data) setPhotos(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${weddingId}/guest-photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("wedding-assets").upload(path, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
        await supabase.from("guest_photos").insert({
          image_url: publicUrl,
          wedding_id: weddingId,
          guest_name: guestName || "Guest",
        });
      }
    }
    toast.success("Photos uploaded! They'll appear after approval.");
    setUploading(false);
    e.target.value = "";
  };

  return (
    <section className="wedding-section bg-wedding-blush/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <p className="wedding-label mb-4">MEMORIES</p>
          <h2 className="wedding-heading">Share Your Photos</h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground font-light mt-3 max-w-md mx-auto">
            Upload photos you captured during the celebration. They'll appear here after approval.
          </p>
        </motion.div>

        {/* Upload area — first, prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto mb-16 space-y-5"
        >
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-transparent border-b border-foreground/15 py-3 font-body text-sm text-center focus:outline-none focus:border-wedding-gold transition-colors placeholder:text-muted-foreground/40"
          />
          <label className="block w-full border-2 border-dashed border-foreground/15 p-8 sm:p-12 text-center cursor-pointer hover:border-wedding-gold/40 hover:bg-wedding-champagne/10 transition-all">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
            <p className="font-display text-lg font-light mb-2">
              {uploading ? "Uploading..." : "Tap to upload your photos"}
            </p>
            <p className="font-body text-xs text-muted-foreground">JPG, PNG or HEIC · Multiple files welcome</p>
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="sr-only" />
          </label>
        </motion.div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
            {photos.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="break-inside-avoid overflow-hidden relative group"
              >
                <img src={p.image_url} alt={`By ${p.guest_name}`} className="w-full object-cover" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-body text-[10px] tracking-widest uppercase text-white">{p.guest_name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GuestPhotoWall;
