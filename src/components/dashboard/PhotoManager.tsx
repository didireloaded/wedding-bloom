import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Camera, Check, X, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PhotoManagerProps {
  weddingId: string;
  galleryImages: any[];
  guestPhotos: any[];
  onRefresh: () => void;
}

const PhotoManager = ({ weddingId, galleryImages, guestPhotos, onRefresh }: PhotoManagerProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user) return;
    setUploading(true);
    let uploadedCount = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `couples/${user.id}/${weddingId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("wedding-images").upload(path, file, { contentType: file.type });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("wedding-images").getPublicUrl(path);
        const { error: galleryError } = await supabase.from("gallery").insert({ image_url: publicUrl, wedding_id: weddingId, uploaded_by: "couple" });
        if (!galleryError) uploadedCount += 1;
      }
    }
    if (uploadedCount > 0) toast.success(`${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} added.`);
    else toast.error("We could not upload those photos.");
    setUploading(false);
    onRefresh();
  };

  const approvePhoto = async (photoId: string) => {
    const { error } = await supabase
      .from("guest_photos")
      .update({ approved: true })
      .eq("id", photoId).eq("wedding_id", weddingId).select("id").single();
    if (error) toast.error("Photo could not be approved. Please try again.");
    if (!error) {
      toast.success("Photo approved!");
      onRefresh();
    }
  };

  const deletePhoto = async (photoId: string, table: "gallery" | "guest_photos") => {
    const { error } = await supabase.from(table).delete().eq("id", photoId).eq("wedding_id", weddingId).select("id").single();
    if (error) toast.error("Photo could not be removed. Please try again.");
    if (!error) {
      toast.success("Photo removed");
      onRefresh();
    }
  };

  const pendingPhotos = guestPhotos.filter((p) => !p.approved);
  const approvedPhotos = guestPhotos.filter((p) => p.approved);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-white"><Camera className="h-4 w-4" /></span>
          <div><h3 className="font-body text-base font-semibold">Photo library</h3><p className="font-body text-xs text-muted-foreground">Your photos and guest uploads</p></div>
        </div>
        <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-foreground px-4 py-2 font-body text-xs font-semibold text-background ${uploading ? "pointer-events-none opacity-50" : ""}`}>
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="mt-5 space-y-7">
        {/* Pending Guest Uploads */}
        {pendingPhotos.length > 0 && (
          <div>
            <p className="mb-3 font-body text-xs font-semibold text-amber-700">
              Waiting for approval ({pendingPhotos.length})
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pendingPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
                >
                  <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute right-2 top-2 flex items-center gap-2">
                    <button
                      onClick={() => approvePhoto(photo.id)}
                      className="flex min-h-9 min-w-9 items-center justify-center rounded-full bg-card text-emerald-700 shadow"
                      aria-label="Approve photo"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id, "guest_photos")}
                      className="flex min-h-9 min-w-9 items-center justify-center rounded-full bg-card text-destructive shadow"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {photo.guest_name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-muted px-3 py-2 backdrop-blur-sm">
                      <p className="truncate font-body text-[10px] font-medium text-white">{photo.guest_name}</p>
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
            <p className="mb-3 font-body text-xs font-semibold">Your gallery ({galleryImages.length})</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryImages.map((img) => (
                <div key={img.id} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <button
                      onClick={() => deletePhoto(img.id, "gallery")}
                      className="flex min-h-9 min-w-9 items-center justify-center rounded-full bg-card text-destructive shadow"
                      aria-label="Remove photo"
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
            <p className="mb-3 font-body text-xs font-semibold">From your guests ({approvedPhotos.length})</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {approvedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {galleryImages.length === 0 && guestPhotos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-black/[0.02] py-10 text-center">
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
