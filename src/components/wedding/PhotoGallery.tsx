import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { getOptimizedImageUrl, getImageSrcSet } from "@/lib/imageUtils";

interface GalleryImage {
  id: string;
  image_url: string;
}

interface PhotoGalleryProps {
  images?: GalleryImage[];
}

const PhotoGallery = ({ images }: PhotoGalleryProps) => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const items = images ?? [];

  const getSpan = (i: number) => {
    const pattern = [4, 3, 3, 3, 4, 3];
    return pattern[i % pattern.length];
  };

  if (items.length === 0) return null;

  return (
    <>
      <section className="wedding-section bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="wedding-label mb-4">CAPTURED MOMENTS</p>
            <h2 className="wedding-heading">Gallery</h2>
          </motion.div>

          <div className="columns-2 md:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {items.map((img, i) => {
              const srcSet = getImageSrcSet(img.image_url);
              const optimizedSrc = getOptimizedImageUrl(img.image_url, "medium");

              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  className="break-inside-avoid overflow-hidden cursor-pointer group relative"
                  onClick={() => setLightbox(img.image_url)}
                >
                  <div className={`${getSpan(i) === 4 ? "aspect-[3/4]" : "aspect-square"}`}>
                    <img
                      src={optimizedSrc}
                      srcSet={srcSet || undefined}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      alt={`Wedding gallery ${i + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox — loads full resolution */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={getOptimizedImageUrl(lightbox, "full")}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </>
  );
};

export default PhotoGallery;
