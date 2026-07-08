import React, { useState } from "react";
import {
  Briefcase, Star, Phone, Mail, CheckCircle2, AlertCircle,
  Clock, Plus, Search, Filter, ExternalLink, ShieldCheck,
  MapPin, DollarSign, FileText, Send, Sparkles, Building2,
  Camera, Utensils, Music, HeartHandshake, Eye
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

export interface AdminVendorDirectoryViewProps {
  weddings: any[];
  onSelectWedding: (wedding: any) => void;
}

interface VendorPartner {
  id: string;
  name: string;
  category: "Venue" | "Photography & Cinema" | "Floral & Design" | "Culinary & Bar" | "Entertainment" | "Concierge & Styling";
  tier: "Platinum Partner" | "Preferred" | "Verified";
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  contractStatus: "Signed & Verified" | "Signature Pending" | "Deposit Due";
  assignedWeddingsCount: number;
  rating: number;
  insuranceValid: boolean;
}

export function AdminVendorDirectoryView({ weddings, onSelectWedding }: AdminVendorDirectoryViewProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState<VendorPartner["category"]>("Photography & Cinema");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");

  const [vendors, setVendors] = useState<VendorPartner[]>([
    {
      id: "vnd_1",
      name: "Lumière & Voile Cinema Studios",
      category: "Photography & Cinema",
      tier: "Platinum Partner",
      contactPerson: "Sebastien Laurent",
      email: "studio@lumierecinema.fr",
      phone: "+33 6 45 12 88 09",
      location: "Paris / Lake Como",
      contractStatus: "Signed & Verified",
      assignedWeddingsCount: Math.max(2, weddings.length),
      rating: 4.98,
      insuranceValid: true
    },
    {
      id: "vnd_2",
      name: "Villa D'Este Grand Celebrations",
      category: "Venue",
      tier: "Platinum Partner",
      contactPerson: "Alessandro Rossi",
      email: "events@villadeste.it",
      phone: "+39 031 3481",
      location: "Lake Como, Italy",
      contractStatus: "Signed & Verified",
      assignedWeddingsCount: 1,
      rating: 5.0,
      insuranceValid: true
    },
    {
      id: "vnd_3",
      name: "Fleuriste Botanique de Luxe",
      category: "Floral & Design",
      tier: "Preferred",
      contactPerson: "Amélie Dupont",
      email: "bonjour@fleuristebotanique.com",
      phone: "+33 1 42 68 55 11",
      location: "Paris / Provence",
      contractStatus: "Signature Pending",
      assignedWeddingsCount: 3,
      rating: 4.92,
      insuranceValid: true
    },
    {
      id: "vnd_4",
      name: "Artisan Gastronomie & Caviar",
      category: "Culinary & Bar",
      tier: "Platinum Partner",
      contactPerson: "Chef Henri Moreau",
      email: "banquets@artisangastronomie.com",
      phone: "+33 6 11 20 44 98",
      location: "Paris / Riviera",
      contractStatus: "Deposit Due",
      assignedWeddingsCount: 2,
      rating: 4.95,
      insuranceValid: true
    },
    {
      id: "vnd_5",
      name: "Symphony Strings & Jazz Quintet",
      category: "Entertainment",
      tier: "Verified",
      contactPerson: "Clara Schumann",
      email: "booking@symphonystrings.eu",
      phone: "+44 20 7946 0912",
      location: "London / Milan",
      contractStatus: "Signed & Verified",
      assignedWeddingsCount: 1,
      rating: 4.88,
      insuranceValid: true
    }
  ]);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                          v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
                          v.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newVendorEmail) {
      toast.error("Please provide vendor name and contact email");
      return;
    }
    const created: VendorPartner = {
      id: `vnd_${Date.now()}`,
      name: newVendorName,
      category: newVendorCategory,
      tier: "Verified",
      contactPerson: newVendorContact || "Principal Concierge",
      email: newVendorEmail,
      phone: "+1 (555) 019-2834",
      location: "Global Studio Network",
      contractStatus: "Signature Pending",
      assignedWeddingsCount: 1,
      rating: 5.0,
      insuranceValid: true
    };
    setVendors([created, ...vendors]);
    setShowAddModal(false);
    setNewVendorName("");
    setNewVendorEmail("");
    setNewVendorContact("");
    toast.success(`Partner added: ${created.name}`);
  };

  const remindContract = (name: string, email: string) => {
    toast.success(`Contract reminder & sign link dispatched to ${email} (${name})`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] relative overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#7A9E7E]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-2">
              <Briefcase size={14} /> Global Partner Portfolio & CRM
            </div>
            <h2 className="display text-[32px] md:text-[40px] text-[#FAF7F2] leading-tight">
              Studio Vendor <span className="script fv-gradient-text">Directory</span>
            </h2>
            <p className="text-[14px] text-[#A8A29E] max-w-xl mt-2">
              Curate and oversee high-tier luxury partners, track contract compliance and COIs (Certificates of Insurance), and orchestrate vendor assignments across celebrations.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="fv-btn-primary self-start md:self-auto !py-3 !px-6 flex items-center gap-2 shadow-xl"
          >
            <Plus size={16} /> Onboard New Partner
          </button>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#D4A853]">{vendors.length}</div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Curated Partners</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#7A9E7E]">
              {vendors.filter(v => v.contractStatus === "Signed & Verified").length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Contracts Verified</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#EAB308]">
              {vendors.filter(v => v.contractStatus !== "Signed & Verified").length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Action Needed</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#A882DD]">100%</div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">COI Compliant</div>
          </div>
        </div>
      </GlassCard>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by vendor, contact person, or city..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-11 pr-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853] transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: "All Categories", value: "all" },
            { label: "Venue", value: "Venue" },
            { label: "Photography & Cinema", value: "Photography & Cinema" },
            { label: "Floral & Design", value: "Floral & Design" },
            { label: "Culinary & Bar", value: "Culinary & Bar" },
            { label: "Entertainment", value: "Entertainment" }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-4 py-2 rounded-full text-[12px] font-medium transition whitespace-nowrap border ${
                categoryFilter === cat.value
                  ? "bg-[#D4A853] text-[#0C0A09] border-[#D4A853]"
                  : "bg-white/[0.04] text-[#FAF7F2] border-white/[0.08] hover:bg-white/[0.08]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(v => (
          <GlassCard key={v.id} variant="frost" padding="lg" className="border border-white/[0.08] hover:border-[#D4A853]/40 transition flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] uppercase font-semibold text-[#D4A853] tracking-wider">
                  {v.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] font-mono font-bold text-[#FAF7F2]">
                  <Star size={13} className="text-[#EAB308] fill-[#EAB308]" /> {v.rating}
                </span>
              </div>

              <h3 className="display text-[22px] text-[#FAF7F2] group-hover:text-[#D4A853] transition leading-snug">{v.name}</h3>
              <div className="text-[12px] text-[#A8A29E] flex items-center gap-1.5 mt-1">
                <MapPin size={13} className="text-[#78716C]" /> {v.location}
              </div>

              <div className="my-5 p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06] space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Contact:</span>
                  <span className="font-medium text-[#FAF7F2]">{v.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Email:</span>
                  <span className="text-[#D4A853] truncate max-w-[180px]">{v.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Tier:</span>
                  <span className="font-semibold text-[#FAF7F2] flex items-center gap-1">
                    <Sparkles size={12} className="text-[#D4A853]" /> {v.tier}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">Contract & COI</span>
                  <span className={`text-[11px] font-semibold ${
                    v.contractStatus === "Signed & Verified" ? "text-[#7A9E7E]" :
                    v.contractStatus === "Signature Pending" ? "text-[#EAB308]" : "text-[#FCA5A5]"
                  }`}>
                    {v.contractStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">Assigned Scope</span>
                  <span className="text-[12px] font-mono font-bold text-[#FAF7F2]">{v.assignedWeddingsCount} Celebrations</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.info(`Viewing COI & Master Agreement for ${v.name}`)}
                  className="flex-1 py-2.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#FAF7F2] text-[12px] font-medium transition text-center min-h-[44px]"
                >
                  View Documents
                </button>
                {v.contractStatus !== "Signed & Verified" ? (
                  <button
                    onClick={() => remindContract(v.name, v.email)}
                    className="py-2.5 px-4 rounded-full bg-[#EAB308] hover:bg-[#FDE047] text-[#09090B] text-[12px] font-semibold transition flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Send size={13} /> Remind
                  </button>
                ) : (
                  <button
                    onClick={() => toast.success(`Calling ${v.name} at ${v.phone}`)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-[#7A9E7E] transition shrink-0"
                    title="Call Partner"
                  >
                    <Phone size={15} />
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg glass-obsidian rounded-[32px] border border-white/[0.15] p-8 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div>
              <div className="wedding-label text-[#D4A853]">Partner Onboarding</div>
              <h3 className="display text-[26px] text-[#FAF7F2] mt-1">Onboard Studio Vendor</h3>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Company / Studio Name</label>
                <input
                  type="text"
                  required
                  value={newVendorName}
                  onChange={e => setNewVendorName(e.target.value)}
                  placeholder="e.g. Lumière & Voile Cinema"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Category</label>
                <select
                  value={newVendorCategory}
                  onChange={e => setNewVendorCategory(e.target.value as VendorPartner["category"])}
                  className="w-full bg-[#181614] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] outline-none focus:border-[#D4A853]"
                >
                  <option value="Venue">Venue & Estate</option>
                  <option value="Photography & Cinema">Photography & Cinema</option>
                  <option value="Floral & Design">Floral & Architectural Design</option>
                  <option value="Culinary & Bar">Culinary & Mixology</option>
                  <option value="Entertainment">Symphony & Live Entertainment</option>
                  <option value="Concierge & Styling">Concierge & Bridal Styling</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Principal Contact</label>
                  <input
                    type="text"
                    value={newVendorContact}
                    onChange={e => setNewVendorContact(e.target.value)}
                    placeholder="e.g. Sebastien L."
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newVendorEmail}
                    onChange={e => setNewVendorEmail(e.target.value)}
                    placeholder="studio@lumiere.com"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="fv-btn-ghost !py-2.5 !px-5 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fv-btn-primary !py-2.5 !px-6 text-[13px] flex items-center gap-2"
                >
                  <CheckCircle2 size={15} /> Save & Invite Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
