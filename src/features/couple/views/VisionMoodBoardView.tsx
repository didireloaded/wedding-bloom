import React, { useState } from "react";
import {
  Sparkles, Palette, Image as ImageIcon, Plus, Trash2, Eye,
  Wand2, Check, ExternalLink, Layers, Heart, Download
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, MoodItem } from "@/types/wedding";

interface VisionMoodBoardViewProps {
  wedding: Wedding;
  moodItems: MoodItem[];
  onAddMoodItem: (itemData: Partial<MoodItem>) => void;
  onRemoveMoodItem: (id: string) => void;
}

const luxuryPalettes = [
  { name: "Obsidian & Imperial Gold", colors: ["#1B1C1C", "#D4AF37", "#F0EBE0", "#3D3E3D"], style: "Ultra-Luxury / Formal Evening" },
  { name: "Champagne & Sage Velvet", colors: ["#FAF7F2", "#E5DCCB", "#7B8A62", "#2E3A2F"], style: "Botanical / Garden Villa" },
  { name: "Amalfi Terracotta & Azure", colors: ["#D97757", "#EAA879", "#5F8CA3", "#1F3A4B"], style: "Coastal / Mediterranean" },
  { name: "Pearl Ivory & Rose Quartz", colors: ["#FFFFFF", "#F8EEEE", "#E5B8B8", "#6D4C4C"], style: "Romantic / Classic Cathedral" },
];

export function VisionMoodBoardView({
  wedding,
  moodItems,
  onAddMoodItem,
  onRemoveMoodItem
}: VisionMoodBoardViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "palette" | "photo">("all");
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<"palette" | "photo">("photo");
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newValue.trim()) return;
    onAddMoodItem({
      type: newType,
      title: newTitle.trim(),
      value: newValue.trim(),
      notes: newNotes.trim() || null
    });
    setNewTitle("");
    setNewValue("");
    setNewNotes("");
    setShowForm(false);
  };

  const filteredItems = moodItems.filter(item => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Palette size={13} className="text-primary-container" />
            <span>Aesthetic Studio & Inspiration Engine</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Vision & Mood Board
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Curate bespoke color harmonies, floral direction, and architectural textures that govern your celebration’s sensory identity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 shadow-lg hover:shadow-primary-container/20"
          >
            <Plus size={15} />
            <span>{showForm ? "Close Drawer" : "Add Inspiration Asset"}</span>
          </button>
        </div>
      </div>

      {/* Add Inspiration Form */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Pin Inspiration Asset</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={newType === "photo"}
                  onChange={() => setNewType("photo")}
                  className="accent-primary-container"
                />
                <span className="text-sm text-ivory font-medium">Inspiration Photo / Render URL</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={newType === "palette"}
                  onChange={() => setNewType("palette")}
                  className="accent-primary-container"
                />
                <span className="text-sm text-ivory font-medium">Color Swatch (Hex Code e.g. #D4AF37)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Asset Title / Concept *</label>
              <input
                required
                placeholder="e.g. Floral Arch Inspiration at Villa Balbianello or #D4AF37 Imperial Gold"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">
                {newType === "photo" ? "Image URL (Unsplash/Pinterest/Pexels) *" : "Color Hex Code (e.g. #D4AF37) *"}
              </label>
              <input
                required
                placeholder={newType === "photo" ? "https://images.pexels.com/..." : "#D4AF37"}
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Design Direction & Notes</label>
              <textarea
                rows={2}
                placeholder="Where should this element be featured? Notes for florist or lighting designer..."
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="fv-input w-full resize-none text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Save to Mood Board
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Curated Luxury Color Palettes (Bento Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-xl text-ivory flex items-center gap-2">
            <Wand2 size={18} className="text-primary-container" />
            <span>Curated Architectural Color Palettes</span>
          </h3>
          <span className="text-xs font-mono text-ivory/50">Click swatch to pin color</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {luxuryPalettes.map((pal) => (
            <GlassCard
              key={pal.name}
              variant="obsidian"
              padding="md"
              className="border border-white/[0.08] hover:border-primary-container/30 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-primary-container uppercase tracking-wider">{pal.style}</span>
                </div>
                <h4 className="font-headline-sm text-base text-ivory font-bold mb-3 group-hover:text-primary-container transition">
                  {pal.name}
                </h4>
                <div className="flex h-12 rounded-xl overflow-hidden border border-white/[0.1] shadow-inner mb-3">
                  {pal.colors.map((color) => (
                    <div
                      key={color}
                      className="flex-1 transition transform hover:scale-110 relative group/swatch cursor-pointer flex items-end justify-center pb-1"
                      style={{ backgroundColor: color }}
                      onClick={() => onAddMoodItem({ type: "palette", title: `${pal.name} Swatch`, value: color, notes: "Selected from Curated Luxury Library" })}
                      title={`Pin ${color}`}
                    >
                      <span className="text-[9px] font-mono bg-obsidian/80 text-white px-1 rounded opacity-0 group-hover/swatch:opacity-100 transition">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-ivory/50">Click any swatch bar to instantly add to your board.</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Mood Board Items Navigation Tabs */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08]">
          {[
            { id: "all" as const, label: "All Items", count: moodItems.length },
            { id: "photo" as const, label: "Visual Renders", count: moodItems.filter(m => m.type === "photo").length },
            { id: "palette" as const, label: "Color Swatches", count: moodItems.filter(m => m.type === "palette").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                activeTab === tab.id ? "bg-primary-container text-obsidian font-bold shadow-sm" : "text-ivory/60 hover:text-ivory"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory/60"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Masonry / Grid Display of Pinned Mood Board Assets */}
      {filteredItems.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <ImageIcon size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Inspiration Assets Found</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto mb-6">
            Pin photos from Unsplash/Pinterest or color hex codes to build your personalized luxury mood board.
          </p>
          <button onClick={() => setShowForm(true)} className="fv-btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2">
            <Plus size={15} /> Add First Inspiration Item
          </button>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isPhoto = item.type === "photo";
            return (
              <GlassCard
                key={item.id}
                variant="obsidian"
                padding="none"
                className="border border-white/[0.08] hover:border-primary-container/40 transition duration-300 rounded-2xl overflow-hidden group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Asset Display */}
                  {isPhoto ? (
                    <div className="relative h-56 w-full overflow-hidden bg-white/[0.02]">
                      <img
                        src={item.value}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-obsidian/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono text-primary-container">
                        Visual Concept
                      </div>
                    </div>
                  ) : (
                    <div
                      className="h-44 w-full flex flex-col justify-end p-5 relative transition duration-300 group-hover:brightness-110"
                      style={{ backgroundColor: item.value.startsWith("#") ? item.value : "#D4AF37" }}
                    >
                      <div className="bg-obsidian/85 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-ivory">
                        <span className="font-mono text-base font-bold">{item.value}</span>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-primary-container">Color Token</span>
                      </div>
                    </div>
                  )}

                  {/* Details & Notes */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-headline-sm text-lg text-ivory font-bold leading-tight group-hover:text-primary-container transition">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => onRemoveMoodItem(item.id)}
                        className="text-ivory/40 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition shrink-0"
                        title="Remove from board"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-ivory/70 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-ivory/40">
                  <span>Pin ID: #{item.id.slice(0, 6)}</span>
                  <span>Curated Asset</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
