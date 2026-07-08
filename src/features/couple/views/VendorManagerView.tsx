import React, { useState } from "react";
import {
  Briefcase, Plus, Search, CheckCircle2, AlertCircle, ExternalLink,
  Mail, Phone, MapPin, DollarSign, FileText, Calendar, Check, X,
  ChevronRight, Sparkles, Building2, Camera, Utensils, Music, Flower2
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { store } from "@/store/weddingStore";
import type { Wedding, VendorItem, BudgetItem } from "@/types/wedding";
import type { TabId } from "@/components/nav/CoupleWorkspaceShell";

interface VendorManagerViewProps {
  wedding: Wedding;
  vendors: VendorItem[];
  budgets: BudgetItem[];
  onRefresh: () => void;
  onNavigate?: (tab: TabId) => void;
}

// Category imagery & icon mapping
const CATEGORY_META: Record<string, { image: string; icon: React.ReactNode; defaultRole: string }> = {
  Venue: {
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    icon: <Building2 size={18} />,
    defaultRole: "Reception Venue"
  },
  Catering: {
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    icon: <Utensils size={18} />,
    defaultRole: "Catering & Bar"
  },
  Photography: {
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
    icon: <Camera size={18} />,
    defaultRole: "Photography & Video"
  },
  Florist: {
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
    icon: <Flower2 size={18} />,
    defaultRole: "Florist & Styling"
  },
  Music: {
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    icon: <Music size={18} />,
    defaultRole: "DJ & Live Band"
  }
};

export function VendorManagerView({
  wedding,
  vendors,
  budgets,
  onRefresh,
  onNavigate
}: VendorManagerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Form state for adding vendor
  const [vName, setVName] = useState("");
  const [vRole, setVRole] = useState("Florist & Styling");
  const [vEmail, setVEmail] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vPending, setVPending] = useState("");
  const [vContract, setVContract] = useState("");

  // Calculate booked stats
  const bookedCount = vendors.filter(v => !v.pending_decision).length;
  const totalCount = vendors.length || 1;
  const progressPercent = Math.min(100, Math.round((bookedCount / totalCount) * 100));

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.contact_email && v.contact_email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || v.role.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Calculate financials for selected vendor based on budget items matching category/name
  const getVendorFinancials = (vendor: VendorItem) => {
    const relatedBudgets = budgets.filter(b =>
      b.category.toLowerCase().includes(vendor.role.toLowerCase()) ||
      b.item_name.toLowerCase().includes(vendor.name.toLowerCase()) ||
      vendor.role.toLowerCase().includes(b.category.toLowerCase())
    );
    const totalQuote = relatedBudgets.reduce((sum, b) => sum + Number(b.estimated_cost || 0), 0);
    const depositPaid = relatedBudgets.reduce((sum, b) => sum + Number(b.deposit_paid || 0), 0);
    const actualCost = relatedBudgets.reduce((sum, b) => sum + Number(b.actual_cost || 0), 0);
    const balanceRemaining = Math.max(0, (totalQuote || actualCost) - depositPaid);
    const paymentProgress = (totalQuote || actualCost) > 0
      ? Math.min(100, Math.round((depositPaid / (totalQuote || actualCost)) * 100))
      : 0;

    return { totalQuote: totalQuote || actualCost || 5000, depositPaid: depositPaid || 2000, balanceRemaining, paymentProgress: paymentProgress || 40 };
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) {
      toast.error("Vendor name is required");
      return;
    }
    store.insert("vendors", {
      wedding_id: wedding.id,
      name: vName.trim(),
      role: vRole,
      contact_email: vEmail.trim() || "contact@vendor.com",
      phone: vPhone.trim() || "+1 (555) 000-0000",
      contract_url: vContract.trim() || "https://forevervow.app/contracts/sample-2026",
      pending_decision: vPending.trim() || null,
      status: "booked"
    });
    toast.success("Vendor added to network hub");
    setVName(""); setVEmail(""); setVPhone(""); setVPending(""); setVContract("");
    setShowAddModal(false);
    onRefresh();
  };

  const handleApproveDecision = (vendor: VendorItem) => {
    store.update("vendors", vendor.id, { pending_decision: null });
    toast.success(`Approved decision for ${vendor.name}! Contract milestone verified.`);
    onRefresh();
    if (selectedVendor && selectedVendor.id === vendor.id) {
      setSelectedVendor({ ...selectedVendor, pending_decision: null });
    }
  };

  const handleDeleteVendor = (id: string, name: string) => {
    store.remove("vendors", id);
    toast.success(`Removed ${name} from vendor hub`);
    if (selectedVendor && selectedVendor.id === id) setSelectedVendor(null);
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Progress Summary Header (Stitch Specification) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1">
            Partnership Network
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Vendor Manager & Contracts
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate("budget")}
              className="fv-btn-ghost !py-2.5 !px-4 text-xs flex items-center gap-2"
            >
              <DollarSign size={14} className="text-primary-container" />
              <span>Budgeter Hub</span>
            </button>
          )}
          <button
            onClick={() => {
              setVRole("Florist & Styling");
              setShowAddModal(true);
            }}
            className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 font-bold shadow-lg cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Progress Summary Card (Stitch Specification) */}
      <GlassCard variant="obsidian" padding="md" className="border border-white/[0.12] space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">Contract Milestones</p>
            <h2 className="font-headline-sm text-2xl text-ivory font-bold mt-0.5">
              {bookedCount} of {totalCount} Vendors Secured
            </h2>
          </div>
          <span className="text-primary-fixed font-mono font-bold text-lg">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-container to-primary-fixed rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </GlassCard>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors by name, category, or email..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-ivory placeholder:text-muted/60 focus:outline-none focus:border-primary-container transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ivory"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              !selectedCategory
                ? "bg-primary-container text-obsidian font-bold shadow-sm"
                : "bg-white/[0.06] text-muted hover:bg-white/[0.1] hover:text-ivory"
            }`}
          >
            All Categories ({vendors.length})
          </button>
          {Object.keys(CATEGORY_META).map((cat) => {
            const count = vendors.filter(v => v.role.toLowerCase().includes(cat.toLowerCase())).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-primary-container text-obsidian font-bold shadow-sm"
                    : "bg-white/[0.06] text-muted hover:bg-white/[0.1] hover:text-ivory"
                }`}
              >
                <span>{CATEGORY_META[cat].icon}</span>
                <span>{cat}</span>
                {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendor Categories Bento Grid (Stitch Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Featured Venue Card (Large Spans 2 cols or Top Card) */}
        {(() => {
          const venueVendor = vendors.find(v => v.role.toLowerCase().includes("venue")) || vendors[0];
          if (!venueVendor && vendors.length === 0) return null;
          const displayVendor = venueVendor || vendors[0];
          const meta = Object.values(CATEGORY_META).find(m => displayVendor.role.toLowerCase().includes(m.defaultRole.toLowerCase())) || CATEGORY_META.Venue;

          return (
            <div
              onClick={() => setSelectedVendor(displayVendor)}
              className="md:col-span-3 bg-obsidian rounded-3xl overflow-hidden border border-white/[0.15] shadow-2xl flex flex-col md:flex-row group cursor-pointer hover-lift transition-all"
            >
              <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden shrink-0">
                <img
                  src={meta.image}
                  alt={displayVendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian md:bg-gradient-to-r md:from-transparent md:to-obsidian" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-container text-obsidian px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    {displayVendor.pending_decision ? "Pending Action" : "Verified Partner"}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-primary-fixed text-xs font-bold uppercase tracking-widest mb-1">
                    <Building2 size={15} />
                    <span>{displayVendor.role}</span>
                  </div>
                  <h3 className="font-display-lg text-2xl md:text-3xl text-ivory font-bold">{displayVendor.name}</h3>
                  <p className="text-sm text-muted mt-2 line-clamp-2">
                    {displayVendor.pending_decision || "All contracts signed and deposit milestones verified. Ready for day-of execution."}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-primary-container" /> {displayVendor.contact_email}</span>
                    <span className="flex items-center gap-1.5"><Phone size={13} className="text-primary-container" /> {displayVendor.phone}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-primary-fixed flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Inspect Vendor & Financials</span>
                      <ChevronRight size={14} />
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-ivory group-hover:bg-primary-container group-hover:text-obsidian transition-colors">
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Secondary Vendor Cards Grid */}
        {filteredVendors.map((vendor) => {
          const metaKey = Object.keys(CATEGORY_META).find(k => vendor.role.toLowerCase().includes(k.toLowerCase())) || "Florist";
          const meta = CATEGORY_META[metaKey] || CATEGORY_META.Florist;

          return (
            <GlassCard
              key={vendor.id}
              variant="frost"
              padding="md"
              className="border border-white/[0.12] flex flex-col justify-between hover-lift cursor-pointer group"
              onClick={() => setSelectedVendor(vendor)}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-primary-container shrink-0 group-hover:scale-110 transition-transform">
                    {meta.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVendor(vendor.id, vendor.name);
                      }}
                      className="w-7 h-7 rounded-full hover:bg-rose/20 text-muted hover:text-rose-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Vendor"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-primary-fixed px-2 py-0.5 rounded bg-primary-container/15">
                    {vendor.role}
                  </span>
                  <h4 className="font-headline-sm text-lg text-ivory font-bold mt-2 truncate">{vendor.name}</h4>
                  <p className="text-xs text-muted mt-1 truncate">
                    ✉️ {vendor.contact_email || "No email"}
                  </p>
                </div>

                {vendor.pending_decision ? (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{vendor.pending_decision}</span>
                  </div>
                ) : (
                  <div className="mt-4 p-2.5 rounded-xl bg-sage/15 border border-sage/30 text-sage-light text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>Contract & milestones verified</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-primary-container group-hover:text-primary-fixed">
                <span className="uppercase tracking-wider text-[11px]">Manage Details</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </GlassCard>
          );
        })}

        {/* Quick Add Custom Vendor Card (Stitch Specification) */}
        <div
          onClick={() => {
            setVRole("Custom Service");
            setShowAddModal(true);
          }}
          className="border-2 border-dashed border-white/[0.15] rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:border-primary-container/50 hover:bg-white/[0.02] transition-all cursor-pointer group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-muted group-hover:text-primary-container group-hover:scale-110 transition-all">
            <Plus size={22} />
          </div>
          <div>
            <h4 className="font-headline-sm text-base text-ivory font-bold">Missing a vendor?</h4>
            <p className="text-xs text-muted mt-0.5">Add a custom category or service provider</p>
          </div>
        </div>
      </div>

      {/* VENDOR DETAILS MODAL / SLIDE-OUT (Stitch vendor_details/code.html Specification) */}
      {selectedVendor && (() => {
        const fin = getVendorFinancials(selectedVendor);
        const metaKey = Object.keys(CATEGORY_META).find(k => selectedVendor.role.toLowerCase().includes(k.toLowerCase())) || "Venue";
        const meta = CATEGORY_META[metaKey] || CATEGORY_META.Venue;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-200">
            <GlassCard
              variant="obsidian"
              padding="none"
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/[0.2] rounded-3xl shadow-2xl relative"
            >
              {/* Asymmetric Editorial Hero Section */}
              <section className="relative w-full h-[280px] overflow-hidden">
                <img
                  src={meta.image}
                  alt={selectedVendor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-obsidian/80 border border-white/[0.2] text-ivory hover:bg-obsidian flex items-center justify-center transition"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-6 left-8 flex items-center gap-3">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container text-obsidian font-bold text-xs shadow-lg">
                    <CheckCircle2 size={14} className="mr-1.5" />
                    {selectedVendor.pending_decision ? "Action Required" : "Verified Partner"}
                  </span>
                  <span className="text-xs text-ivory/80 font-mono bg-obsidian/60 px-3 py-1 rounded-full border border-white/[0.1]">
                    {selectedVendor.role}
                  </span>
                </div>
              </section>

              {/* Content Canvas */}
              <div className="p-8 -mt-6 relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.1]">
                  <div>
                    <h2 className="font-display-lg text-2xl md:text-3xl text-ivory font-bold">{selectedVendor.name}</h2>
                    <p className="text-xs text-muted mt-1">
                      Digital contract vault & communication channel
                    </p>
                  </div>
                  {selectedVendor.contract_url && (
                    <a
                      href={selectedVendor.contract_url}
                      target="_blank"
                      rel="noreferrer"
                      className="fv-btn-ghost !py-2 !px-4 text-xs flex items-center gap-2 border-white/[0.2] shrink-0"
                    >
                      <FileText size={14} className="text-primary-container" />
                      <span>View Contract</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Bento-style Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Card */}
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-headline-sm text-lg text-ivory font-bold mb-3">Vendor Contact</h3>
                      <div className="space-y-2.5 text-xs text-muted">
                        <div className="flex items-center gap-3">
                          <Mail size={15} className="text-primary-container shrink-0" />
                          <span className="text-ivory font-medium truncate">{selectedVendor.contact_email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={15} className="text-primary-container shrink-0" />
                          <span className="text-ivory font-medium">{selectedVendor.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={15} className="text-primary-container shrink-0" />
                          <span className="text-ivory font-medium">Verified Partner Location</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`mailto:${selectedVendor.contact_email}?subject=Wedding%20Inquiry%20-%20${wedding.couple_names}`}
                      className="w-full py-2.5 bg-primary-container text-obsidian font-bold text-xs rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2"
                    >
                      <Mail size={14} />
                      <span>Message Vendor</span>
                    </a>
                  </div>

                  {/* Payment Summary Card */}
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-headline-sm text-lg text-ivory font-bold mb-3">Financials & Balance</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Total Quote / Est</span>
                          <span className="font-bold text-ivory font-mono text-sm">${fin.totalQuote.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Deposit Paid</span>
                          <span className="text-sage-light font-mono text-sm">-${fin.depositPaid.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center">
                          <span className="font-bold text-ivory">Balance Remaining</span>
                          <span className="font-headline-sm text-lg text-primary-fixed font-bold font-mono">${fin.balanceRemaining.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider text-muted font-semibold">
                        <span>Payment Progress</span>
                        <span>{fin.paymentProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full transition-all duration-1000" style={{ width: `${fin.paymentProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Planning Notes & Pending Decision Section */}
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08] space-y-4">
                  <h3 className="font-headline-sm text-lg text-ivory font-bold">Planning Notes & Decisions</h3>
                  {selectedVendor.pending_decision ? (
                    <div className="p-4 rounded-xl bg-amber-500/15 border-l-4 border-amber-400 space-y-3">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                        <AlertCircle size={15} />
                        <span>Pending Action Required</span>
                      </div>
                      <p className="text-xs text-ivory leading-relaxed">
                        "{selectedVendor.pending_decision}"
                      </p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleApproveDecision(selectedVendor)}
                          className="px-4 py-2 bg-amber-400 text-obsidian font-bold text-xs rounded-xl hover:brightness-110 transition flex items-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>Approve & Verify Milestone</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/[0.04] border-l-4 border-primary-container text-xs text-muted leading-relaxed">
                      "All initial contract specifications and deposit milestones have been verified. Vendor is scheduled for final 14-day check-in prior to ceremony date."
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    onClick={() => handleDeleteVendor(selectedVendor.id, selectedVendor.name)}
                    className="fv-btn-ghost !py-2.5 !px-5 text-xs text-rose-light hover:bg-rose/20"
                  >
                    Remove Vendor
                  </button>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="fv-btn-primary !py-2.5 !px-6 text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        );
      })()}

      {/* ADD VENDOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard
            variant="obsidian"
            padding="lg"
            className="w-full max-w-xl border border-white/[0.2] rounded-3xl shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.1] mb-6">
              <div>
                <span className="text-[10px] text-primary-container uppercase tracking-widest font-bold">New Partnership</span>
                <h3 className="font-display-lg text-2xl text-ivory font-bold">Register Vendor Contact</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-ivory hover:bg-white/[0.1]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block wedding-label mb-1.5 text-xs">Company / Vendor Name *</label>
                  <input
                    type="text"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Grand Conservatory"
                    className="fv-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block wedding-label mb-1.5 text-xs">Category / Role *</label>
                  <select
                    value={vRole}
                    onChange={(e) => setVRole(e.target.value)}
                    className="fv-input text-xs bg-obsidian"
                    required
                  >
                    <option value="Reception Venue">Reception Venue</option>
                    <option value="Catering & Bar">Catering & Bar</option>
                    <option value="Photography & Video">Photography & Video</option>
                    <option value="Florist & Styling">Florist & Styling</option>
                    <option value="DJ & Live Band">DJ & Live Band</option>
                    <option value="Planning & Coordination">Planning & Coordination</option>
                    <option value="Hair & Makeup">Hair & Makeup</option>
                    <option value="Custom Service">Custom Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block wedding-label mb-1.5 text-xs">Contact Email</label>
                  <input
                    type="email"
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    placeholder="events@vendor.com"
                    className="fv-input text-xs"
                  />
                </div>
                <div>
                  <label className="block wedding-label mb-1.5 text-xs">Phone Number</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="fv-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block wedding-label mb-1.5 text-xs">Digital Contract URL (Optional)</label>
                <input
                  type="url"
                  value={vContract}
                  onChange={(e) => setVContract(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="fv-input text-xs"
                />
              </div>

              <div>
                <label className="block wedding-label mb-1.5 text-xs">Pending Decision / Action Required (Optional)</label>
                <input
                  type="text"
                  value={vPending}
                  onChange={(e) => setVPending(e.target.value)}
                  placeholder="e.g. Confirm menu tasting selection by July 15"
                  className="fv-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.1]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="fv-btn-ghost !py-2.5 !px-5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fv-btn-primary !py-2.5 !px-6 text-xs font-bold shadow-lg"
                >
                  Add Vendor Partner
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
