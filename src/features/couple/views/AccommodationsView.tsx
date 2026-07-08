import React, { useState } from "react";
import {
  Home, Hotel, Plus, Trash2, MapPin, DollarSign, Phone,
  ExternalLink, Sparkles, ShieldCheck, CheckCircle2, Bed
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, Accommodation } from "@/types/wedding";

interface AccommodationsViewProps {
  wedding: Wedding;
  accommodations: Accommodation[];
  onAddAccommodation: (data: Partial<Accommodation>) => void;
  onRemoveAccommodation: (id: string) => void;
}

export function AccommodationsView({
  wedding,
  accommodations,
  onAddAccommodation,
  onRemoveAccommodation
}: AccommodationsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [distance, setDistance] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddAccommodation({
      name: name.trim(),
      price: price.trim() || null,
      distance: distance.trim() || null,
      phone: phone.trim() || null,
      booking_url: bookingUrl.trim() || null,
      photo_url: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800"
    });
    setName("");
    setPrice("");
    setDistance("");
    setPhone("");
    setBookingUrl("");
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Hotel size={13} className="text-primary-container" />
            <span>Lodging & Room Block Concierge</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Guest Accommodations
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Curate partner hotels, negotiated block group rates, and direct booking links for out-of-town attendees.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Plus size={15} />
          <span>{showForm ? "Close Form" : "Add Hotel / Room Block"}</span>
        </button>
      </div>

      {/* Add Accommodation Form Drawer */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Record Hotel Block Option</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Hotel / Villa Name *</label>
              <input
                required
                placeholder="e.g. Grand Hotel Tremezzo or Villa Serbelloni"
                value={name}
                onChange={e => setName(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Negotiated Group Rate / Price</label>
              <input
                placeholder="e.g. $280 / night (Discount code: VOW2026)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Distance to Venue</label>
              <input
                placeholder="e.g. 5 minutes shuttle or 1.2 miles"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Concierge Phone</label>
              <input
                placeholder="+39 0344 42491"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Direct Booking Portal URL</label>
              <input
                type="url"
                placeholder="https://www.grandhoteltremezzo.com/booking..."
                value={bookingUrl}
                onChange={e => setBookingUrl(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Stash Hotel Option
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Accommodations Grid */}
      {accommodations.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <Hotel size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Room Blocks Configured</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto mb-6">
            Help out-of-town guests book their stay by listing recommended lodging options, discount codes, and travel distances.
          </p>
          <button onClick={() => setShowForm(true)} className="fv-btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2">
            <Plus size={15} /> Add First Hotel Option
          </button>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accommodations.map((acc) => (
            <GlassCard
              key={acc.id}
              variant="obsidian"
              padding="none"
              className="border border-white/[0.08] hover:border-primary-container/40 transition duration-300 rounded-2xl overflow-hidden group flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-white/[0.02]">
                  <img
                    src={acc.photo_url || "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800"}
                    alt={acc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-obsidian/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono text-[#E8C97A] flex items-center gap-1">
                    <Bed size={12} /> Partner Hotel
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-headline-sm text-xl text-ivory font-bold leading-tight group-hover:text-primary-container transition">
                      {acc.name}
                    </h4>
                    <button
                      onClick={() => onRemoveAccommodation(acc.id)}
                      className="text-ivory/40 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition shrink-0"
                      title="Remove Option"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-ivory/70 pt-1">
                    {acc.price && (
                      <div className="flex items-center gap-2 text-primary-container font-semibold">
                        <DollarSign size={13} className="shrink-0" />
                        <span>{acc.price}</span>
                      </div>
                    )}
                    {acc.distance && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-ivory/40 shrink-0" />
                        <span>{acc.distance}</span>
                      </div>
                    )}
                    {acc.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-ivory/40 shrink-0" />
                        <span>{acc.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-white/[0.06] bg-white/[0.01]">
                {acc.booking_url ? (
                  <a
                    href={acc.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fv-btn-primary w-full !py-2 text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Book Group Block Room</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <div className="text-center py-2 text-xs font-mono text-ivory/40">
                    Direct booking via phone only
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
