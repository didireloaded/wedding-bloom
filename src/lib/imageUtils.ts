/**
 * Supabase Storage supports image transforms via URL params.
 * This utility generates optimized image URLs.
 *
 * Supabase image transforms: append ?width=X&height=Y&quality=Q&format=webp
 * to the storage URL.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type ImageSize = "thumbnail" | "medium" | "full";

const SIZE_CONFIG: Record<ImageSize, { width: number; quality: number }> = {
  thumbnail: { width: 300, quality: 60 },
  medium: { width: 800, quality: 75 },
  full: { width: 1920, quality: 85 },
};

/**
 * Returns an optimized image URL if the image is from Supabase Storage.
 * For external URLs, returns as-is.
 */
export function getOptimizedImageUrl(
  url: string,
  size: ImageSize = "medium"
): string {
  if (!url) return url;

  // Only transform Supabase storage URLs
  const isSupabaseStorage =
    url.includes("/storage/v1/object/public/") &&
    url.includes(SUPABASE_URL || "supabase");

  if (!isSupabaseStorage) return url;

  const config = SIZE_CONFIG[size];

  // Use Supabase render endpoint for transforms
  const renderUrl = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const separator = renderUrl.includes("?") ? "&" : "?";
  return `${renderUrl}${separator}width=${config.width}&quality=${config.quality}`;
}

/**
 * Generate srcSet for responsive images
 */
export function getImageSrcSet(url: string): string {
  if (!url) return "";

  const isSupabaseStorage =
    url.includes("/storage/v1/object/public/") &&
    url.includes(SUPABASE_URL || "supabase");

  if (!isSupabaseStorage) return "";

  const sizes: [number, ImageSize][] = [
    [300, "thumbnail"],
    [800, "medium"],
    [1920, "full"],
  ];

  return sizes
    .map(([w, size]) => `${getOptimizedImageUrl(url, size)} ${w}w`)
    .join(", ");
}
