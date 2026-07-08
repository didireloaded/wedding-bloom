import React, { useState } from "react";
import {
  Users, UserPlus, Search, Mail, Phone, MapPin, Tag,
  Award, Shield, CheckCircle2, MoreHorizontal, Sparkles, Plus, Trash2
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, RSVP } from "@/types/wedding";

interface GuestCrmViewProps {
  wedding: Wedding;
  rsvps: RSVP[];
  onAddGuest?: (guestData: Partial<RSVP>) => void;
  onRemoveGuest?: (id: string) => void;
}

export function GuestCrmView({
  wedding,
  rsvps,
  onAddGuest,
  onRemoveGuest
}: GuestCrmViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterParty, setFilterParty] = useState<"all" | "vip" | "family" | "wedding_party">("all");
  const [showForm, setShowForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newHousehold, setNewHousehold] = useState("Bride's Family");
  const [isVip, setIsVip] = useState(false);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !onAddGuest) return;
    onAddGuest({
      guest_name: newGuestName.trim(),
      email: newEmail.trim() || null,
      phone: newPhone.trim() || null,
      household: newHousehold,
      vip_status: isVip,
      attending: "pending",
      guest_count: 1
    });
    setNewGuestName("");
    setNewEmail("");
    setNewPhone("");
    setIsVip(false);
    setShowForm(false);
  };

  const filteredGuests = rsvps.filter(g => {
    if (filterParty === "vip" && !g.vip_status) return false;
    if (filterParty === "family" && !(g.household || "").toLowerCase().includes("family")) return false;
    if (filterParty === "wedding_party" && !(g.household || "").toLowerCase().includes("party")) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return g.guest_name.toLowerCase().includes(q) || (g.email || "").toLowerCase().includes(q) || (g.household || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Users size={13} className="text-primary-container" />
            <span>Relationship Management & Household Ledger</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Guest CRM & Concierge
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Maintain your master guest dossier, organize household groupings, and tag VIP attendees for priority concierge services.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <UserPlus size={15} />
          <span>{showForm ? "Close Form" : "Add Guest Record"}</span>
        </button>
      </div>

      {/* Add Guest Form Drawer */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Create Master Dossier Entry</h3>
            </div>
          </div>
          <form onSubmit={handleCreateGuest} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Full Guest Name *</label>
              <input
                required
                placeholder="e.g. Lady Genevieve of Kensington"
                value={newGuestName}
                onChange={e => setNewGuestName(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="genevieve@estate.co.uk"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Phone / Mobile</label>
              <input
                placeholder="+44 20 7946 0921"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Household / Cohort Tag</label>
              <input
                placeholder="e.g. Bride's Family / Groom's College Friends"
                value={newHousehold}
                onChange={e => setNewHousehold(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="vip-check"
                checked={isVip}
                onChange={e => setIsVip(e.target.checked)}
                className="accent-primary-container w-4 h-4 rounded"
              />
              <label htmlFor="vip-check" className="text-sm text-ivory font-medium cursor-pointer flex items-center gap-1.5">
                <Award size={16} className="text-primary-container" />
                <span>Mark as VIP Guest (Priority Table Placement & Concierge Support)</span>
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Save Guest Record
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            placeholder="Search directory by name, email, or cohort tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="fv-input w-full pl-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08]">
          {[
            { id: "all" as const, label: "All Directory", count: rsvps.length },
            { id: "vip" as const, label: "VIP Cohort", count: rsvps.filter(r => r.vip_status).length },
            { id: "family" as const, label: "Family Circles", count: rsvps.filter(r => (r.household || "").toLowerCase().includes("family")).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterParty(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                filterParty === tab.id ? "bg-primary-container text-obsidian font-bold shadow-sm" : "text-ivory/60 hover:text-ivory"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterParty === tab.id ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory/60"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Guest Directory Cards Grid */}
      {filteredGuests.length === 0 ? (
        <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
          <Users size={32} className="mx-auto text-ivory/30 mb-3" />
          <h3 className="font-headline-sm text-xl text-ivory mb-2">No Directory Records Found</h3>
          <p className="text-xs text-ivory/50 max-w-md mx-auto mb-6">
            Build your guest list here to synchronize with your invitation delivery engine and RSVP portal.
          </p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((g) => {
            const isVipGuest = g.vip_status;
            return (
              <GlassCard
                key={g.id}
                variant="obsidian"
                padding="lg"
                className="border border-white/[0.08] hover:border-primary-container/40 transition duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline-sm text-xl text-ivory font-bold group-hover:text-primary-container transition">
                          {g.guest_name}
                        </h4>
                        {isVipGuest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-container/20 text-primary-container font-mono border border-primary-container/30 flex items-center gap-1">
                            <Award size={10} /> VIP
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#E8C97A] flex items-center gap-1">
                        <Tag size={12} />
                        <span>{g.household || "General Cohort"}</span>
                      </span>
                    </div>
                    {onRemoveGuest && (
                      <button
                        onClick={() => onRemoveGuest(g.id)}
                        className="text-ivory/40 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition shrink-0"
                        title="Remove Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-xs font-mono text-ivory/70">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-ivory/40 shrink-0" />
                      <span className="truncate">{g.email || "No email on file"}</span>
                    </div>
                    {g.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-ivory/40 shrink-0" />
                        <span>{g.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] ${
                    g.attending === "confirmed" || g.attending === "yes" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                    g.attending === "declined" || g.attending === "no" ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" :
                    "bg-white/10 text-ivory/60"
                  }`}>
                    RSVP: <strong className="capitalize">{g.attending || "Pending"}</strong>
                  </span>
                  <span className="font-mono text-[11px] text-ivory/40">Headcount: {g.guest_count || 1}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
