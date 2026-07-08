import React, { useState } from "react";
import {
  MapPin, Plus, Trash2, Edit3, Compass, Layers, Sparkles,
  ExternalLink, Navigation, Eye, Check, AlertCircle, ShieldCheck
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, VenueMarker } from "@/types/wedding";

interface InteractiveMapViewProps {
  wedding: Wedding;
  markers: VenueMarker[];
  onAddMarker: (markerData: Partial<VenueMarker>) => void;
  onRemoveMarker: (id: string) => void;
}

export function InteractiveMapView({
  wedding,
  markers,
  onAddMarker,
  onRemoveMarker
}: InteractiveMapViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ceremony");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("church");
  const [coordX, setCoordX] = useState(50);
  const [coordY, setCoordY] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddMarker({
      title: title.trim(),
      category,
      description: description.trim() || null,
      icon,
      x: coordX,
      y: coordY
    });
    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Compass size={13} className="text-primary-container" />
            <span>Geospatial Estate & Venue Choreography</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Interactive Venue Map
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Stash pins across your celebration estate grounds. Guide arriving guests to exact shuttle pickups, cocktail gardens, and restroom suites.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Plus size={15} />
          <span>{showForm ? "Close Editor" : "Pin New Landmark"}</span>
        </button>
      </div>

      {/* Add Landmark Form */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Create Estate Landmark Pin</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Landmark Title *</label>
              <input
                required
                placeholder="e.g. Sunset Champagne Terrace"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="fv-input w-full text-sm bg-obsidian text-ivory"
              >
                <option value="ceremony">Ceremony Main Site</option>
                <option value="reception">Reception & Dining Hall</option>
                <option value="transport">Shuttle / Valet Drop-off</option>
                <option value="amenity">Restrooms / Coat Check / Bar</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Pin Icon Style</label>
              <select
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="fv-input w-full text-sm bg-obsidian text-ivory font-mono"
              >
                <option value="church">⛪ Sanctuary / Arch</option>
                <option value="cocktail">🍸 Cocktail Bar</option>
                <option value="bus">🚌 Shuttle Pickup</option>
                <option value="parking">🅿️ Valet Parking</option>
                <option value="star">⭐ VIP Lounge</option>
              </select>
            </div>
            <div className="md:col-span-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1">
                  Map X-Coordinate ({coordX}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={coordX}
                  onChange={e => setCoordX(Number(e.target.value))}
                  className="w-full accent-primary-container"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1">
                  Map Y-Coordinate ({coordY}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={coordY}
                  onChange={e => setCoordY(Number(e.target.value))}
                  className="w-full accent-primary-container"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Guest Directions & Access Notes</label>
              <input
                placeholder="e.g. Accessible via the stone walkway past the olive grove fountains."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="fv-input w-full text-sm"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Stash Pin on Map
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Simulated Interactive Map Canvas */}
      <GlassCard variant="obsidian" padding="none" className="border border-white/[0.12] overflow-hidden rounded-3xl relative h-[480px] w-full shadow-2xl group">
        {/* Background Canvas Texture / Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-[1.01] opacity-75"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=1400')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

        {/* Top Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-obsidian/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs text-ivory font-mono flex items-center gap-2 shadow-lg">
            <Compass size={14} className="text-primary-container animate-spin" style={{ animationDuration: "16s" }} />
            <span>Estate Blueprint: Villa Balbianello / Main Grounds ({markers.length} Active Landmarks)</span>
          </div>
          <div className="bg-obsidian/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-ivory/70 font-mono">
            Hover pins for details
          </div>
        </div>

        {/* Map Pins Placed at Coordinates */}
        {markers.map((marker, index) => (
          <div
            key={marker.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer transition-transform duration-300 hover:scale-125 hover:z-30"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <div className="relative flex items-center justify-center">
              {/* Radar pulse ring */}
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary-container opacity-40"></span>
              {/* Pin body */}
              <div className="w-8 h-8 rounded-full bg-obsidian border-2 border-primary-container text-white flex items-center justify-center text-sm shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                {index + 1}
              </div>

              {/* Tooltip Card on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-2xl bg-obsidian/95 backdrop-blur-xl border border-primary-container/40 text-ivory opacity-0 pointer-events-none group-hover/pin:opacity-100 group-hover/pin:pointer-events-auto transition duration-200 shadow-2xl">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 text-[10px] font-mono text-primary-container uppercase">
                  <span>{marker.category}</span>
                  <span>Pin #{index + 1}</span>
                </div>
                <div className="font-bold text-xs text-ivory">{marker.title}</div>
                {marker.description && (
                  <p className="text-[11px] text-ivory/70 mt-1 leading-tight">{marker.description}</p>
                )}
                <div className="mt-2 pt-1 border-t border-white/10 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveMarker(marker.id); }}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Remove Pin
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state overlay if zero markers */}
        {markers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
            <div className="w-16 h-16 rounded-full bg-obsidian/80 border border-primary-container/40 flex items-center justify-center text-primary-container mb-3 backdrop-blur-md">
              <MapPin size={28} />
            </div>
            <h3 className="font-headline-sm text-xl text-ivory font-bold mb-1">No Estate Pins Stashed Yet</h3>
            <p className="text-xs text-ivory/70 max-w-sm">
              Click "Pin New Landmark" above to place ceremony sites, shuttle stops, and dinner halls onto your interactive estate map.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Marker Ledger Table */}
      {markers.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-headline-sm text-xl text-ivory">Landmark Directory ({markers.length})</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markers.map((marker, idx) => (
              <GlassCard key={marker.id} variant="obsidian" padding="md" className="border border-white/[0.08] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container font-mono text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-primary-container uppercase">{marker.category}</span>
                    <h4 className="font-semibold text-sm text-ivory">{marker.title}</h4>
                    {marker.description && (
                      <p className="text-xs text-ivory/60 mt-1 leading-snug">{marker.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveMarker(marker.id)}
                  className="text-ivory/30 hover:text-rose-400 p-1 rounded transition"
                >
                  <Trash2 size={14} />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
