import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { getGuestSessionToken } from "@/lib/guestSession";

const optimizeImage = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not optimize image")), "image/jpeg", 0.84);
    URL.revokeObjectURL(image.src);
  };
  image.onerror = () => { URL.revokeObjectURL(image.src); reject(new Error("This image could not be opened.")); };
  image.src = URL.createObjectURL(file);
});

interface GuestPhotoWallProps {
  weddingId: string;
}

const GuestPhotoWall = ({ weddingId }: GuestPhotoWallProps) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [guestName, setGuestName] = useState(() => localStorage.getItem(`forevervow-guest-name-${weddingId}`) || "");
  const [caption, setCaption] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

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
    const input = e.target;
    const guestSession = getGuestSessionToken(weddingId);
    if (!guestSession) { toast.error("Please respond to the RSVP before sharing photos."); return; }
    setUploading(true);
    const selectedFiles = Array.from(files).slice(0, 10);
    let uploaded = 0;
    try {
      for (const [index, file] of selectedFiles.entries()) {
        setUploadProgress(`${index + 1} of ${selectedFiles.length}`);
        if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) throw new Error("Choose images smaller than 15 MB.");
        const optimized = await optimizeImage(file);
        const authorization = await supabase.functions.invoke("register-memory-upload", { body: { wedding_id: weddingId, guest_session: guestSession, file_name: file.name, mime_type: "image/jpeg", file_size: optimized.size } });
        if (authorization.error || !authorization.data?.upload_token) throw new Error("Could not authorize your upload.");
        const path = authorization.data.storage_path;
        const { error } = await supabase.storage.from("wedding-assets").uploadToSignedUrl(path, authorization.data.upload_token, optimized, { contentType: "image/jpeg" });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
        const completed = await supabase.functions.invoke("complete-memory-upload", { body: { wedding_id: weddingId, guest_session: guestSession, storage_path: path, image_url: publicUrl, guest_name: guestName.trim() || "Guest", caption: caption.trim() || null } });
        if (completed.error || !completed.data?.id) throw new Error("The photo uploaded but could not be delivered. Please try again.");
        uploaded += 1;
      }
      setCaption("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      if (uploaded) toast.success(`${uploaded} photo${uploaded === 1 ? "" : "s"} sent to the couple. Public after approval.`);
      setUploading(false);
      setUploadProgress("");
      input.value = "";
    }
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
          <h2 className="wedding-heading">Share a Memory</h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground font-light mt-3 max-w-md mx-auto">
            Take a photo from your phone or upload one from your gallery. It will appear here after approval.
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
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            className="w-full bg-transparent border-b border-foreground/15 py-3 font-body text-sm text-center focus:outline-none focus:border-wedding-gold transition-colors placeholder:text-muted-foreground/40"
          />
          <label className="block w-full rounded-3xl border-2 border-dashed border-foreground/15 p-8 sm:p-12 text-center cursor-pointer hover:border-wedding-gold/40 hover:bg-wedding-champagne/10 transition-all">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
            <p className="font-body text-lg font-semibold mb-2">
              {uploading ? `Uploading ${uploadProgress}...` : "Take a Photo"}
            </p>
            <p className="font-body text-xs text-muted-foreground">Camera opens on mobile · Gallery upload also works</p>
            <input type="file" accept="image/*" capture="environment" multiple onChange={handleUpload} disabled={uploading} className="sr-only" />
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
                className="rounded-2xl break-inside-avoid overflow-hidden relative group"
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
