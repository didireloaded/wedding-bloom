import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { store, BudgetItem, VendorItem, MoodItem, GiftItem, RSVP } from "@/store/weddingStore";
import { toast } from "sonner";
import {
  DollarSign, Briefcase, Plus, CheckCircle2, AlertCircle, Share2, Sparkles,
  Gift, Send, Edit3, Trash2, ExternalLink, Palette, Image as ImageIcon,
  Calendar, Check
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 1. INTERACTIVE BUDGET & VENDOR DASHBOARD MODULE                            */
/* -------------------------------------------------------------------------- */
export function BudgetVendorModule({ wedding, budgets, vendors, refresh }: { wedding: any; budgets: BudgetItem[]; vendors: VendorItem[]; refresh: () => void }) {
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Venue & Catering": true,
    "Floral & Decor": true,
    "Photography": true
  });

  // Budget form state
  const [bCat, setBCat] = useState("Venue & Catering");
  const [bItem, setBItem] = useState("");
  const [bEst, setBEst] = useState("");
  const [bAct, setBAct] = useState("");
  const [bDep, setBDep] = useState("");
  const [bDue, setBDue] = useState("2026-08-30");
  const [bStatus, setBStatus] = useState<"pending" | "paid">("pending");

  // Vendor form state
  const [vName, setVName] = useState("");
  const [vRole, setVRole] = useState("Florist & Styling");
  const [vEmail, setVEmail] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vPending, setVPending] = useState("");

  const totalEst = budgets.reduce((acc, b) => acc + Number(b.estimated_cost || 0), 0);
  const totalAct = budgets.reduce((acc, b) => acc + Number(b.actual_cost || 0), 0);
  const remainingFunds = totalEst - totalAct;
  const percentUsed = totalEst > 0 ? Math.min(Math.round((totalAct / totalEst) * 100), 100) : 0;

  // Dynamic progress color rule
  const progressColorClass = percentUsed < 75 ? "bg-emerald-500" : percentUsed <= 90 ? "bg-amber-400" : "bg-rose-500";

  const categories = Array.from(new Set(budgets.map(b => b.category)));

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bItem.trim()) return;
    store.insert("budgets", {
      wedding_id: wedding.id,
      category: bCat,
      item_name: bItem.trim(),
      estimated_cost: Number(bEst) || 0,
      actual_cost: Number(bAct) || Number(bEst) || 0,
      deposit_paid: Number(bDep) || 0,
      due_date: bDue,
      status: bStatus
    });
    toast.success("Budget line item saved");
    setBItem(""); setBEst(""); setBAct(""); setBDep(""); setShowAddBudget(false);
    refresh();
  };

  const handleUpdateItem = (id: string, patch: Partial<BudgetItem>) => {
    store.update("budgets", id, patch);
    refresh();
  };

  const cycleStatus = (item: BudgetItem) => {
    const nextStatus = item.status === "pending" ? (item.deposit_paid > 0 ? "paid" : "paid") : "pending";
    handleUpdateItem(item.id, { status: nextStatus });
    toast.success(`Updated payment status for ${item.item_name}`);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) return;
    store.insert("vendors", {
      wedding_id: wedding.id,
      name: vName.trim(),
      role: vRole,
      contact_email: vEmail.trim() || "vendor@wedding.com",
      phone: vPhone.trim() || "+39 031 555 0000",
      contract_url: "https://forevervow.app/contracts/signed-2026",
      pending_decision: vPending.trim() || null
    });
    toast.success("Vendor added to hub");
    setVName(""); setVEmail(""); setVPending(""); setShowAddVendor(false);
    refresh();
  };

  const approveDecision = (vendor: VendorItem) => {
    store.update("vendors", vendor.id, { pending_decision: null });
    toast.success(`Approved decision for ${vendor.name}! Contract milestone finalized.`);
    refresh();
  };

  const sendPaymentReminders = () => {
    toast.success("Automated payment reminder notifications sent to coordinators & upcoming vendors!");
  };

  return (
    <div className="space-y-8">
      {/* A. Top-Level Summary Dashboard (The "Hero" Section) */}
      <div className="p-7 rounded-[32px] bg-gradient-to-r from-[#EAB308]/15 via-white/[0.03] to-transparent border border-[#EAB308]/30 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="wedding-label text-[#EAB308] flex items-center gap-1.5 mb-1"><DollarSign size={14}/> Executive Treasury</div>
            <h3 className="display text-[28px] text-[#FAFAFA]">Interactive Budget & Financial Tracker</h3>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={sendPaymentReminders} className="fv-btn-ghost !py-2.5 !px-4 text-[12px] flex items-center gap-2">
              Payment Reminders
            </button>
            <button onClick={() => setShowAddBudget(!showAddBudget)} className="fv-btn-primary !py-2.5 !px-5 text-[12.5px] flex items-center gap-2 shadow-xl font-bold">
              <Plus size={15}/> Add Expense
            </button>
          </div>
        </div>

        {/* Three Prominent Stat Cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <GlassCard variant="obsidian" padding="md" className="border border-white/[0.12] rounded-[22px] bg-white/[0.03]">
            <div className="text-[11px] uppercase font-mono tracking-wider text-[#A1A1AA]">Total Budget</div>
            <div className="display text-[32px] text-[#FAFAFA] mt-1.5">${totalEst.toLocaleString()}</div>
          </GlassCard>
          <GlassCard variant="obsidian" padding="md" className="border border-[#EAB308]/40 rounded-[22px] bg-[#EAB308]/5">
            <div className="text-[11px] uppercase font-mono tracking-wider text-[#EAB308]">Actual Spend</div>
            <div className="display text-[32px] text-[#EAB308] mt-1.5">${totalAct.toLocaleString()}</div>
          </GlassCard>
          <GlassCard variant="obsidian" padding="md" className={`border rounded-[22px] ${remainingFunds >= 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5"}`}>
            <div className="text-[11px] uppercase font-mono tracking-wider text-[#A1A1AA]">Remaining Funds</div>
            <div className={`display text-[32px] mt-1.5 ${remainingFunds >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ${remainingFunds.toLocaleString()}
            </div>
          </GlassCard>
        </div>

        {/* Thick Rounded Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[12.5px] font-mono">
            <span className="text-[#A1A1AA]">Total Allocation Utilized</span>
            <span className="text-[#FAFAFA] font-bold">{percentUsed}% ({totalAct > totalEst ? "Over Budget" : "On Track"})</span>
          </div>
          <div className="h-4 w-full rounded-full bg-white/[0.08] overflow-hidden p-0.5 border border-white/[0.12]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColorClass}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>

      {/* D. Add Expense Slide-Out Modal */}
      {showAddBudget && (
        <GlassCard variant="obsidian" padding="lg" className="border border-[#EAB308]/50 rounded-[28px] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.08]">
            <h4 className="font-bold text-[#FAFAFA] text-[17px]">Log New Expense Item</h4>
            <button onClick={() => setShowAddBudget(false)} className="text-[#71717A] hover:text-white">✕</button>
          </div>
          <form onSubmit={handleCreateBudget} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="wedding-label block mb-1">Category</label>
              <select value={bCat} onChange={e => setBCat(e.target.value)} className="fv-input">
                <option value="Venue & Catering">Venue & Catering</option>
                <option value="Floral & Decor">Floral & Decor</option>
                <option value="Photography">Photography & Video</option>
                <option value="Entertainment">Entertainment & Music</option>
                <option value="Hospitality">Shuttles & Hospitality</option>
                <option value="Wardrobe & Styling">Wardrobe & Styling</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Item Name</label>
              <input value={bItem} onChange={e => setBItem(e.target.value)} placeholder="e.g. Bridal Bouquet & Boutonnieres" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Estimated Cost ($)</label>
              <input type="number" value={bEst} onChange={e => setBEst(e.target.value)} placeholder="12000" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Actual Cost ($)</label>
              <input type="number" value={bAct} onChange={e => setBAct(e.target.value)} placeholder="11800" className="fv-input" />
            </div>
            <div>
              <label className="wedding-label block mb-1">Payment Status</label>
              <select value={bStatus} onChange={e => setBStatus(e.target.value as any)} className="fv-input">
                <option value="pending">Deposit Paid / Pending</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button type="button" onClick={() => setShowAddBudget(false)} className="fv-btn-ghost !py-2.5 !px-5 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-[12.5px] font-bold">Save Expense</button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* B. Category Breakdown & C. Line Item Details */}
      <div className="space-y-4">
        <h4 className="font-bold text-[#FAFAFA] text-[17px] tracking-wide">Category Breakdown</h4>
        {categories.map(cat => {
          const catItems = budgets.filter(b => b.category === cat);
          const catEst = catItems.reduce((acc, b) => acc + Number(b.estimated_cost || 0), 0);
          const catAct = catItems.reduce((acc, b) => acc + Number(b.actual_cost || 0), 0);
          const catPercent = catEst > 0 ? Math.min(Math.round((catAct / catEst) * 100), 100) : 0;
          const isExpanded = !!expandedCategories[cat];

          return (
            <GlassCard key={cat} variant="obsidian" padding="none" className="border border-white/[0.1] rounded-[24px] overflow-hidden transition">
              {/* Category Accordion Header */}
              <div
                onClick={() => toggleCategory(cat)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#EAB308]/15 text-[#EAB308] flex items-center justify-center font-bold text-[14px]">
                    {isExpanded ? "▾" : "▸"}
                  </span>
                  <div>
                    <h5 className="font-bold text-[#FAFAFA] text-[16px]">{cat}</h5>
                    <span className="text-[11.5px] text-[#A1A1AA]">{catItems.length} line items logged</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  {/* Mini progress bar for category */}
                  <div className="hidden md:block w-32">
                    <div className="flex justify-between text-[10px] font-mono text-[#A1A1AA] mb-1">
                      <span>{catPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-[#EAB308]" style={{ width: `${catPercent}%` }} />
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[15px] font-bold text-[#FAFAFA]">${catAct.toLocaleString()} <span className="text-[12px] text-[#71717A] font-normal">spent</span></div>
                    <div className="text-[11.5px] text-[#A1A1AA]">Allocated: ${catEst.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Line Item Details (Inside each Category) */}
              {isExpanded && (
                <div className="p-5 pt-2 border-t border-white/[0.08] bg-black/20 space-y-1">
                  <div className="hidden sm:grid grid-cols-12 gap-4 pb-2 px-3 text-[11px] uppercase font-mono text-[#71717A] tracking-wider border-b border-white/[0.06]">
                    <div className="col-span-5">Item Name</div>
                    <div className="col-span-2 text-right">Est. Cost</div>
                    <div className="col-span-2 text-right">Actual Cost</div>
                    <div className="col-span-2 text-center">Payment Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {catItems.map(item => {
                    const isFullyPaid = item.status === "paid";
                    const isDepositPaid = item.deposit_paid > 0 && !isFullyPaid;

                    return (
                      <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center py-3.5 px-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] rounded-xl transition">
                        <div className="sm:col-span-5 font-semibold text-[#FAFAFA] text-[13.5px]">
                          {item.item_name}
                          <div className="sm:hidden text-[11px] text-[#A1A1AA]">Due: {item.due_date}</div>
                        </div>

                        <div className="sm:col-span-2 text-left sm:text-right font-mono text-[13px] text-[#A1A1AA]">
                          <span className="sm:hidden text-[10px] text-[#71717A]">Est: </span>
                          ${Number(item.estimated_cost).toLocaleString()}
                        </div>

                        <div className="sm:col-span-2 text-left sm:text-right font-mono text-[13.5px] font-bold text-[#EAB308]">
                          <span className="sm:hidden text-[10px] text-[#71717A]">Act: </span>
                          ${Number(item.actual_cost).toLocaleString()}
                        </div>

                        {/* Payment Status Pill Badge */}
                        <div className="sm:col-span-2 flex justify-start sm:justify-center">
                          <button
                            onClick={() => cycleStatus(item)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
                              isFullyPaid
                                ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                                : isDepositPaid
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                            }`}
                            title="Click to toggle payment status"
                          >
                            {isFullyPaid ? "✅ Fully Paid" : isDepositPaid ? "💳 Deposit Paid" : "⏳ Pending"}
                          </button>
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            onClick={() => { store.remove("budgets", item.id); toast.success("Removed line item"); refresh(); }}
                            className="p-1.5 text-[#71717A] hover:text-[#EF4444] transition rounded"
                            title="Delete line item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Vendor Hub Section */}
      <div className="pt-6 border-t border-white/[0.1] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="wedding-label text-blue-400 flex items-center gap-1.5 mb-1"><Briefcase size={14}/> Partnership Network</div>
            <h3 className="display text-[26px] text-[#FAFAFA]">Vendor Hub & Pending Decisions</h3>
          </div>
          <button onClick={() => setShowAddVendor(!showAddVendor)} className="fv-btn-primary !py-2.5 !px-4 text-[12px] flex items-center gap-2 shadow-lg">
            <Plus size={14}/> Add Vendor Contact
          </button>
        </div>

        {showAddVendor && (
          <GlassCard variant="obsidian" padding="lg" className="border border-blue-500/40 rounded-[24px]">
            <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Register Partner Vendor</h4>
            <form onSubmit={handleCreateVendor} className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="wedding-label block mb-1">Company / Vendor Name</label>
                <input value={vName} onChange={e => setVName(e.target.value)} placeholder="Studio Flora Como" className="fv-input" required />
              </div>
              <div>
                <label className="wedding-label block mb-1">Role / Category</label>
                <input value={vRole} onChange={e => setVRole(e.target.value)} placeholder="Florist & Styling" className="fv-input" required />
              </div>
              <div>
                <label className="wedding-label block mb-1">Contact Email</label>
                <input type="email" value={vEmail} onChange={e => setVEmail(e.target.value)} placeholder="design@studioflora.com" className="fv-input" required />
              </div>
              <div className="sm:col-span-2">
                <label className="wedding-label block mb-1">Pending Vendor Decision / Action</label>
                <input value={vPending} onChange={e => setVPending(e.target.value)} placeholder="e.g. Approve white orchid table runner centerpiece selection" className="fv-input" />
              </div>
              <div>
                <label className="wedding-label block mb-1">Phone</label>
                <input value={vPhone} onChange={e => setVPhone(e.target.value)} placeholder="+39 031 555 0844" className="fv-input" />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddVendor(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
                <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Add Vendor</button>
              </div>
            </form>
          </GlassCard>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {vendors.map(v => (
            <GlassCard key={v.id} variant="obsidian" padding="lg" className="border border-white/[0.1] rounded-[24px] flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/15">
                      {v.role}
                    </span>
                    <h4 className="font-bold text-[#FAFAFA] text-[17px] mt-2">{v.name}</h4>
                  </div>
                  <button
                    onClick={() => { store.remove("vendors", v.id); toast.success("Vendor removed"); refresh(); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#71717A] hover:text-[#EF4444] transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-[12px] text-[#A1A1AA] space-y-1 mb-4">
                  <div>✉️ {v.contact_email}</div>
                  <div>📞 {v.phone}</div>
                </div>

                {/* Pending Decision Checklist Alert */}
                {v.pending_decision ? (
                  <div className="p-3 rounded-[16px] bg-[#EAB308]/10 border border-[#EAB308]/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#EAB308] uppercase tracking-wider">
                      <AlertCircle size={13}/> Pending Vendor Decision
                    </div>
                    <p className="text-[12px] text-[#FAFAFA] leading-relaxed">{v.pending_decision}</p>
                    <button
                      onClick={() => approveDecision(v)}
                      className="w-full py-1.5 rounded-lg bg-[#EAB308] text-[#09090B] font-bold text-[11px] hover:brightness-110 transition flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Check size={13}/> Approve Decision
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[12px] flex items-center gap-2">
                    <CheckCircle2 size={15}/> All decisions finalized
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11.5px]">
                <a href={v.contract_url || "#"} target="_blank" rel="noreferrer" className="text-[#EAB308] hover:underline flex items-center gap-1">
                  Digital Contract <ExternalLink size={12}/>
                </a>
                <span className="text-[#71717A] font-mono">Verified Partner</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. COLLABORATIVE VISION & MOOD BOARD MODULE                                */
/* -------------------------------------------------------------------------- */
export function MoodBoardModule({ wedding, moodItems, refresh }: { wedding: any; moodItems: MoodItem[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<"photo" | "palette" | "swatch">("palette");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("#D4A853");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.insert("mood_items", {
      wedding_id: wedding.id,
      type,
      title: title.trim(),
      value: value.trim(),
      notes: notes.trim()
    });
    toast.success("Added item to vision canvas");
    setTitle(""); setNotes(""); setShowAdd(false);
    refresh();
  };

  const shareVisionBoard = () => {
    const url = `${window.location.origin}/wedding/${wedding.slug}/vision-pass`;
    navigator.clipboard.writeText(url);
    toast.success("View-Only Collaborative Vision Board link copied to clipboard ready for florist & decorator!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-pink-500/10 via-white/[0.03] to-transparent border border-pink-500/30">
        <div>
          <div className="wedding-label text-pink-400 flex items-center gap-1.5 mb-1"><Palette size={14}/> Creative Direction</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Collaborative Vision & Mood Board</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Curate color swatches, floral aesthetics, and lighting concepts with instant shareable links for creative partners.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={shareVisionBoard} className="fv-btn-ghost !py-2.5 !px-4 text-[12px] flex items-center gap-2">
            <Share2 size={14}/> Share Vision Link
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="fv-btn-primary !py-2.5 !px-4 text-[12px] flex items-center gap-2 shadow-lg">
            <Plus size={14}/> Add Swatch / Photo
          </button>
        </div>
      </div>

      {showAdd && (
        <GlassCard variant="obsidian" padding="lg" className="border border-pink-500/40 rounded-[24px]">
          <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Add Vision Element</h4>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="wedding-label block mb-1">Element Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className="fv-input">
                <option value="palette">Color Palette Hex Code</option>
                <option value="photo">Inspiration Image URL</option>
                <option value="swatch">Fabric Swatch Reference</option>
              </select>
            </div>
            <div>
              <label className="wedding-label block mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sunset Gold Foil" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">{type === "palette" ? "Hex Color Code" : "Image URL"}</label>
              <input value={value} onChange={e => setValue(e.target.value)} placeholder={type === "palette" ? "#D4A853" : "https://..."} className="fv-input" required />
            </div>
            <div className="sm:col-span-3">
              <label className="wedding-label block mb-1">Styling Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Used for stationery emboss and table runner borders." className="fv-input" />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Add to Board</button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Mood Board Canvas Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {moodItems.map(item => (
          <GlassCard key={item.id} variant="obsidian" padding="md" className="border border-white/[0.1] rounded-[24px] overflow-hidden flex flex-col justify-between group">
            <div>
              {item.type === "palette" ? (
                <div
                  className="w-full h-36 rounded-[18px] mb-4 border border-white/[0.15] shadow-inner flex items-end p-3"
                  style={{ backgroundColor: item.value }}
                >
                  <span className="px-2.5 py-1 rounded-md bg-[#09090B]/80 backdrop-blur font-mono text-[12px] font-bold text-[#FAFAFA]">
                    {item.value}
                  </span>
                </div>
              ) : (
                <div className="w-full h-44 rounded-[18px] mb-4 overflow-hidden relative border border-white/[0.1]">
                  <img src={item.value} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              )}

              <span className="text-[10px] uppercase font-mono text-pink-400 font-bold px-2 py-0.5 rounded bg-pink-500/15">
                {item.type}
              </span>
              <h4 className="font-bold text-[#FAFAFA] text-[16px] mt-2">{item.title}</h4>
              <p className="text-[12.5px] text-[#A1A1AA] mt-1">{item.notes}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-[#71717A] font-mono">Vision Token</span>
              <button
                onClick={() => { store.remove("mood_items", item.id); toast.success("Removed element"); refresh(); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#71717A] hover:text-[#EF4444] transition text-[11px]"
              >
                Delete
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. THANK-YOU NOTE TRACKER & REGISTRY MODULE                                */
/* -------------------------------------------------------------------------- */
export function ThankYouTrackerModule({ wedding, gifts, rsvps, refresh }: { wedding: any; gifts: GiftItem[]; rsvps: RSVP[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [guestName, setGuestName] = useState(rsvps[0]?.guest_name || "Alexander Wright");
  const [giftItem, setGiftItem] = useState("");
  const [noteText, setNoteText] = useState("");

  const handleAddGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftItem.trim()) return;
    store.insert("gifts", {
      wedding_id: wedding.id,
      guest_name: guestName,
      gift_item: giftItem.trim(),
      status: noteText.trim() ? "drafted" : "pending",
      note_text: noteText.trim() || null
    });
    toast.success("Gift & thank-you status recorded");
    setGiftItem(""); setNoteText(""); setShowAdd(false);
    refresh();
  };

  const markSent = (gift: GiftItem) => {
    store.update("gifts", gift.id, { status: "sent" });
    toast.success(`Marked thank-you note to ${gift.guest_name} as SENT!`);
    refresh();
  };

  const generateAiNote = (gift: GiftItem) => {
    const aiNote = `Dearest ${gift.guest_name}, words cannot express our gratitude for your wonderful gift of ${gift.gift_item}! Having you celebrate with us at ${wedding.ceremony_venue || "our wedding"} meant the world to us. With love always, ${wedding.couple_names}.`;
    store.update("gifts", gift.id, { status: "drafted", note_text: aiNote });
    toast.success("AI generated a bespoke luxury thank-you draft!");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-transparent border border-amber-500/30">
        <div>
          <div className="wedding-label text-amber-400 flex items-center gap-1.5 mb-1"><Gift size={14}/> Gratitude Tracker</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Thank-You Note & Gift Registry Hub</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Never miss a thank-you note. Track received registry items and draft AI-assisted personalized gratitude cards.
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="fv-btn-primary !py-2.5 !px-4 text-[12px] flex items-center gap-2 shadow-lg shrink-0">
          <Plus size={14}/> Log Received Gift
        </button>
      </div>

      {showAdd && (
        <GlassCard variant="obsidian" padding="lg" className="border border-amber-500/40 rounded-[24px]">
          <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Log Gift Item</h4>
          <form onSubmit={handleAddGift} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="wedding-label block mb-1">Guest / Household</label>
              <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Alexander Wright" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Gift Description</label>
              <input value={giftItem} onChange={e => setGiftItem(e.target.value)} placeholder="Baccarat Crystal Flutes" className="fv-input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Draft Thank-You Note Text (Optional)</label>
              <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Dearest Alex..." className="fv-input resize-none" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Save Gift Record</button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {gifts.map(g => (
          <GlassCard key={g.id} variant="obsidian" padding="lg" className="border border-white/[0.1] rounded-[24px] space-y-4 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  g.status === "sent" ? "bg-emerald-500/20 text-emerald-300" : g.status === "drafted" ? "bg-[#EAB308]/20 text-[#EAB308]" : "bg-white/[0.08] text-[#A1A1AA]"
                }`}>
                  {g.status === "sent" ? "✅ Sent" : g.status === "drafted" ? "✍️ Drafted" : "⏳ Pending Draft"}
                </span>
                <button onClick={() => { store.remove("gifts", g.id); toast.success("Deleted gift entry"); refresh(); }} className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-[#EF4444] text-[12px]">✕</button>
              </div>

              <h4 className="font-bold text-[#FAFAFA] text-[17px] mt-2 flex items-center gap-2">
                🎁 {g.gift_item}
              </h4>
              <div className="text-[13px] text-[#A1A1AA]">From: <strong className="text-[#FAFAFA]">{g.guest_name}</strong></div>

              {g.note_text ? (
                <div className="mt-3 p-3.5 rounded-[16px] bg-white/[0.03] border border-white/[0.08] text-[12.5px] text-[#FAFAFA] italic leading-relaxed">
                  "{g.note_text}"
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-[16px] bg-white/[0.02] border border-dashed border-white/[0.1] text-center text-[12px] text-[#71717A]">
                  No thank-you note drafted yet.
                  <button onClick={() => generateAiNote(g)} className="block mx-auto mt-1 text-[#EAB308] font-semibold underline">Generate AI Luxury Draft</button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <button onClick={() => generateAiNote(g)} className="text-[11.5px] text-[#EAB308] hover:underline flex items-center gap-1">
                <Sparkles size={12}/> {g.note_text ? "Regenerate AI Note" : "Draft AI Note"}
              </button>
              {g.status !== "sent" && (
                <button onClick={() => markSent(g)} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-[#09090B] font-bold text-[11px] transition">
                  Mark as Sent ✅
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
