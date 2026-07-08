import React, { useState } from "react";
import {
  Image as ImageIcon, Upload, Plus, Trash2, Eye, Sparkles,
  Download, Share2, ShieldCheck, CheckCircle2, Heart, Layers
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, GalleryItem } from "@/types/wedding";

interface CuratedPortfolioViewProps {
  wedding: Wedding;
  gallery: GalleryItem[];
  onAddGalleryItem: (itemData: { url: string; caption?: string }) => void;
  onRemoveGalleryItem: (id: string) => void;
}

export function CuratedPortfolioView({
  wedding,
  gallery,
  onAddGalleryItem,
  onRemoveGalleryItem
}: CuratedPortfolioViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [activeCollection, setActiveCollection] = useState<"all" | "engagement" | "ceremony" | "reception">("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAddGalleryItem({
      url: url.trim(),
      caption: caption.trim() || undefined
    });
    setUrl("");
    setCaption("");
    setShowForm(false);
  };

  const totalPhotos = gallery.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <ImageIcon size={13} className="text-primary-container" />
            <span>High-Definition Cinematic Memories</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Curated Portfolio & Gallery
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Curate professional photography and promoted guest candid shots. These high-res frames define your public celebration story.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Upload size={15} />
          <span>{showForm ? "Close Uploader" : "Upload High-Res Media"}</span>
        </button>
      </div>

      {/* Storage & Collection Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.08] flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Storage Allocation</span>
            <div className="font-display-lg text-3xl text-ivory font-bold mt-1">{totalPhotos * 15} MB / 10 GB</div>
            <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, totalPhotos * 1.5)}%` }} />
            </div>
          </div>
          <p className="text-[11px] font-mono text-ivory/40 mt-3">{totalPhotos} Master Frames • High-Bitrate Storage</p>
        </GlassCard>

        <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.08] flex items-center justify-between gap-4 md:col-span-2">
          <div className="space-y-1.5">
            <h3 className="font-headline-sm text-lg text-ivory flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <span>Automatic Gallery Synchronization</span>
            </h3>
            <p className="text-xs text-ivory/65 max-w-lg leading-relaxed">
              Every photo pinned to this portfolio automatically syncs with the "Our Story" section of your published guest portal and digital memory book.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end shrink-0 font-mono text-xs text-primary-container border-l border-white/[0.08] pl-6">
            <span>CDN Acceleration: Active</span>
            <span className="text-[11px] text-ivory/50">WebP / AVIF Optimized</span>
          </div>
        </GlassCard>
      </div>

      {/* Upload Form Drawer */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Stash High-Resolution Frame</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Direct Image URL (CDN / Storage) *</label>
              <input
                required
                type="url"
                placeholder="https://images.pexels.com/photos/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Cinematic Caption / Story Context</label>
              <input
                placeholder="e.g. Golden hour walk through the olive groves at Villa Balbianello"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Publish to Master Gallery
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Collections Bento Grid (Stitch Inspiration) */}
      <div className="space-y-4">
        <h3 className="font-headline-sm text-xl text-ivory">Master Collections</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "all" as const, name: "All Master Frames", count: totalPhotos, image: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { id: "engagement" as const, name: "Engagement & Prologue", count: Math.ceil(totalPhotos * 0.4), image: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { id: "ceremony" as const, name: "Cathedral & Vows", count: Math.ceil(totalPhotos * 0.35), image: "https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { id: "reception" as const, name: "Evening Gala & Reception", count: Math.floor(totalPhotos * 0.25), image: "https://images.pexels.com/photos/28584778/pexels-photo-28584778.jpeg?auto=compress&cs=tinysrgb&w=800" },
          ].map((col) => (
            <div
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className={`group relative h-40 rounded-2xl overflow-hidden cursor-pointer border transition duration-300 shadow-xl ${
                activeCollection === col.id ? "border-primary-container ring-2 ring-primary-container/30" : "border-white/[0.08] hover:border-white/[0.25]"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${col.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent flex flex-col justify-end p-4">
                <span className="font-headline-sm text-base text-ivory font-bold group-hover:text-primary-container transition">{col.name}</span>
                <span className="font-mono text-[11px] text-ivory/70">{col.count} Items</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Masonry Photo Grid */}
      {gallery.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <ImageIcon size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Curated Photos in Portfolio</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto mb-6">
            Upload your engagement shoot frames or promote candid snapshots from the Guest Photo Vault to showcase them here.
          </p>
          <button onClick={() => setShowForm(true)} className="fv-btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2">
            <Upload size={15} /> Upload First Frame
          </button>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <GlassCard
              key={item.id}
              variant="obsidian"
              padding="none"
              className="border border-white/[0.08] hover:border-primary-container/40 transition duration-300 rounded-2xl overflow-hidden group flex flex-col justify-between shadow-xl"
            >
              <div className="relative h-64 w-full overflow-hidden bg-white/[0.02]">
                <img
                  src={item.url || item.image_url}
                  alt={item.caption || "Wedding moment"}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                  {item.caption && (
                    <p className="text-xs text-ivory leading-tight font-medium mb-3">{item.caption}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-primary-container bg-obsidian/80 px-2 py-0.5 rounded border border-white/10">
                      Master Frame
                    </span>
                    <button
                      onClick={() => onRemoveGalleryItem(item.id)}
                      className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition"
                      title="Remove from Portfolio"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
              {item.caption && (
                <div className="p-3 text-xs text-ivory/75 truncate border-t border-white/[0.06] bg-white/[0.01]">
                  {item.caption}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
