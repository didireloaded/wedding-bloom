import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Camera, Check, X, Upload, Image as ImageIcon } from "lucide-react";

interface PhotoManagerProps {
  weddingId: string;
  galleryImages: any[];
  guestPhotos: any[];
  onRefresh: () => void;
}

const PhotoManager = ({ weddingId, galleryImages, guestPhotos, onRefresh }: PhotoManagerProps) => {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${weddingId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("wedding-assets").upload(path, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
        await supabase.from("gallery").insert({ image_url: publicUrl, wedding_id: weddingId, uploaded_by: "couple" });
      }
    }
    toast.success("Photos uploaded!");
    setUploading(false);
    onRefresh();
  };

  const approvePhoto = async (photoId: string) => {
    const { error } = await supabase
      .from("guest_photos")
      .update({ approved: true })
      .eq("id", photoId);
    if (!error) {
      toast.success("Photo approved!");
      onRefresh();
    }
  };

  const deletePhoto = async (photoId: string, table: "gallery" | "guest_photos") => {
    const { error } = await supabase.from(table).delete().eq("id", photoId);
    if (!error) {
      toast.success("Photo removed");
      onRefresh();
    }
  };

  const pendingPhotos = guestPhotos.filter((p) => !p.approved);
  const approvedPhotos = guestPhotos.filter((p) => p.approved);

  return (
    <div className="border border-border bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-wedding-gold" />
          <h3 className="font-body text-xs tracking-[0.15em] uppercase">Photos</h3>
        </div>
        <label className={`inline-flex items-center gap-2 px-3 py-2 bg-foreground text-background cursor-pointer font-body text-[10px] tracking-[0.15em] uppercase min-h-[36px] ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
        {/* Pending Guest Uploads */}
        {pendingPhotos.length > 0 && (
          <div>
            <p className="font-body text-[10px] tracking-[0.15em] uppercase text-wedding-gold mb-3">
              Pending Approval ({pendingPhotos.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {pendingPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-square relative group overflow-hidden border-2 border-wedding-gold/50"
                >
                  <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => approvePhoto(photo.id)}
                      className="p-2 bg-wedding-sage text-background rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id, "guest_photos")}
                      className="p-2 bg-destructive text-destructive-foreground rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {photo.guest_name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                      <p className="font-body text-[9px] text-white truncate">{photo.guest_name}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div>
            <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Your Gallery ({galleryImages.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {galleryImages.map((img) => (
                <div key={img.id} className="aspect-square relative group overflow-hidden">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => deletePhoto(img.id, "gallery")}
                      className="p-2 bg-destructive text-white rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Guest Photos */}
        {approvedPhotos.length > 0 && (
          <div>
            <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Guest Photos ({approvedPhotos.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {approvedPhotos.map((photo) => (
                <div key={photo.id} className="aspect-square relative group overflow-hidden">
                  <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {galleryImages.length === 0 && guestPhotos.length === 0 && (
          <div className="py-8 text-center">
            <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
            <p className="font-body text-sm text-muted-foreground">No photos yet</p>
            <p className="font-body text-xs text-muted-foreground/70 mt-1">
              Upload photos or wait for guest submissions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoManager;
