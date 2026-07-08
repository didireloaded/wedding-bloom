import React, { useState } from "react";
import {
  Users, Plus, Minus, Maximize2, Sparkles, Trash2, ArrowRightLeft,
  UserPlus, Utensils, Fish, Leaf, MoreVertical, X, Check, GripVertical,
  ChevronDown, ChevronUp, AlertCircle, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { store } from "@/store/weddingStore";
import type { Wedding, TableItem, RSVP } from "@/types/wedding";

interface SeatingAndTablesViewProps {
  wedding: Wedding;
  tablesList: TableItem[];
  rsvps: RSVP[];
  onRefresh: () => void;
}

export function SeatingAndTablesView({
  wedding,
  tablesList,
  rsvps,
  onRefresh
}: SeatingAndTablesViewProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tablesList[0]?.id || null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // New table form state
  const [tName, setTName] = useState("");
  const [tType, setTType] = useState<"round" | "rect" | "vip">("round");
  const [tCap, setTCap] = useState(8);

  // Guests data breakdown
  const confirmedGuests = rsvps.filter(r => r.attending === "confirmed");
  const assignedGuestNames = new Set(tablesList.flatMap(t => t.assigned_guests || []));
  const unseatedGuests = confirmedGuests.filter(g => !assignedGuestNames.has(g.guest_name));

  // Selected table
  const selectedTable = tablesList.find(t => t.id === selectedTableId) || tablesList[0] || null;

  // Dietary stats for selected table or overall
  const getDietaryStats = () => {
    const targetGuests = selectedTable
      ? confirmedGuests.filter(g => (selectedTable.assigned_guests || []).includes(g.guest_name))
      : confirmedGuests;
    
    let steak = 0; let fish = 0; let veg = 0; let other = 0;
    targetGuests.forEach(g => {
      const pref = (g.dietary_preference || "").toLowerCase();
      if (pref.includes("veg") || pref.includes("vegan") || pref.includes("plant")) veg++;
      else if (pref.includes("fish") || pref.includes("pesca") || pref.includes("salmon")) fish++;
      else if (pref.includes("beef") || pref.includes("steak") || pref.includes("meat")) steak++;
      else steak++; // default standard
    });
    return { steak, fish, veg, other, total: targetGuests.length };
  };

  const dietStats = getDietaryStats();

  // Create new table
  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;
    const newTb = store.insert("tables", {
      wedding_id: wedding.id,
      name: tName.trim(),
      type: tType,
      capacity: Number(tCap) || 8,
      assigned_guests: []
    });
    toast.success(`Created table: ${tName}`);
    setTName(""); setShowAddTableModal(false);
    setSelectedTableId(newTb.id);
    onRefresh();
  };

  // Assign guest to table
  const assignGuest = (guestName: string, tableId?: string) => {
    const targetId = tableId || selectedTableId;
    if (!targetId) {
      toast.error("Please select a table first");
      return;
    }
    const targetTable = tablesList.find(t => t.id === targetId);
    if (!targetTable) return;

    const currentAssigned = targetTable.assigned_guests || [];
    if (currentAssigned.length >= targetTable.capacity) {
      toast.error(`${targetTable.name} is at full capacity (${targetTable.capacity} seats)`);
      return;
    }

    const updated = [...currentAssigned, guestName];
    store.update("tables", targetId, { assigned_guests: updated });
    toast.success(`Seated ${guestName} at ${targetTable.name}`);
    setShowAssignModal(false);
    onRefresh();
  };

  // Unseat guest
  const unseatGuest = (guestName: string, tableId: string) => {
    const targetTable = tablesList.find(t => t.id === tableId);
    if (!targetTable) return;
    const updated = (targetTable.assigned_guests || []).filter(g => g !== guestName);
    store.update("tables", tableId, { assigned_guests: updated });
    toast.info(`Unseated ${guestName}`);
    onRefresh();
  };

  // Clear entire table
  const handleClearTable = (table: TableItem) => {
    if (!confirm(`Clear all seated guests from ${table.name}?`)) return;
    store.update("tables", table.id, { assigned_guests: [] });
    toast.success(`Cleared ${table.name}`);
    onRefresh();
  };

  // Auto-assign remaining guests
  const handleAutoAssign = () => {
    if (unseatedGuests.length === 0) {
      toast.info("All confirmed guests are already seated!");
      return;
    }
    let unassignedQueue = [...unseatedGuests.map(g => g.guest_name)];
    let seatedCount = 0;

    tablesList.forEach(tb => {
      const current = [...(tb.assigned_guests || [])];
      while (current.length < tb.capacity && unassignedQueue.length > 0) {
        const nextGuest = unassignedQueue.shift()!;
        current.push(nextGuest);
        seatedCount++;
      }
      if (current.length !== (tb.assigned_guests || []).length) {
        store.update("tables", tb.id, { assigned_guests: current });
      }
    });

    if (seatedCount > 0) {
      toast.success(`✨ Auto-assigned ${seatedCount} guests across available tables!`);
      onRefresh();
    } else {
      toast.error("No available seats left on floor! Please add more tables.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section (Stitch Specification) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1">
            Venue Spatial Layout
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Seating Floor Plan & Tables
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoAssign}
            disabled={unseatedGuests.length === 0}
            className="fv-btn-ghost !py-2.5 !px-4 text-xs flex items-center gap-2 border-primary-container/30 text-primary-fixed disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={14} className="text-primary-container animate-pulse" />
            <span>Auto-Assign ({unseatedGuests.length})</span>
          </button>
          <button
            onClick={() => setShowAddTableModal(true)}
            className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 font-bold shadow-lg cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Dining Table</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas & Table Manager Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INTERACTIVE VENUE MAP CANVAS (Stitch seating_chart_editor/code.html Specification) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <GlassCard variant="obsidian" padding="none" className="border border-white/[0.15] rounded-3xl overflow-hidden relative min-h-[460px] flex flex-col justify-between bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] bg-obsidian/90">
            {/* Canvas Controls Overlay */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.15] hover:bg-white/[0.15] text-ivory flex items-center justify-center transition shadow-md"
                title="Zoom In"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.15] hover:bg-white/[0.15] text-ivory flex items-center justify-center transition shadow-md"
                title="Zoom Out"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.15] hover:bg-white/[0.15] text-primary-container flex items-center justify-center transition shadow-md mt-1"
                title="Reset Zoom / Center Focus"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Canvas Header info */}
            <div className="p-5 flex items-center justify-between z-10 bg-gradient-to-b from-obsidian via-obsidian/80 to-transparent pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-muted">Grand Ballroom Floor Plan ({tablesList.length} Tables)</span>
              </div>
            </div>

            {/* Simulated Pan/Zoom Canvas Surface */}
            <div
              className="flex-1 w-full relative flex items-center justify-center p-8 overflow-auto min-h-[350px]"
              style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease" }}
            >
              {tablesList.length === 0 ? (
                <div className="text-center space-y-3 py-12 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-primary-container mx-auto">
                    <Users size={28} />
                  </div>
                  <h3 className="font-headline-sm text-lg text-ivory font-bold">No Dining Tables Yet</h3>
                  <p className="text-xs text-muted">
                    Click "Add Dining Table" to place your head table and guest banquets onto the floor plan!
                  </p>
                  <button
                    onClick={() => setShowAddTableModal(true)}
                    className="fv-btn-primary !py-2 !px-4 text-xs font-semibold"
                  >
                    Create First Table
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-10 max-w-2xl mx-auto py-6">
                  {tablesList.map((tb, idx) => {
                    const isSelected = selectedTableId === tb.id;
                    const assignedCount = (tb.assigned_guests || []).length;
                    const isFull = assignedCount >= tb.capacity;
                    const isVip = tb.type === "vip" || tb.name.toLowerCase().includes("head");
                    const isRect = tb.type === "rect" || isVip;

                    return (
                      <div
                        key={tb.id}
                        onClick={() => setSelectedTableId(tb.id)}
                        className={`relative cursor-pointer group transition-all duration-300 ${
                          isSelected ? "scale-110 z-10" : "hover:scale-105"
                        }`}
                      >
                        {/* Table Node Visual */}
                        <div
                          className={`flex items-center justify-center relative shadow-2xl transition-all ${
                            isRect
                              ? "w-48 h-24 rounded-2xl"
                              : "w-32 h-32 rounded-full"
                          } ${
                            isSelected
                              ? "bg-primary-container text-obsidian border-2 border-ivory shadow-primary-container/30 font-bold"
                              : isVip
                              ? "bg-white/[0.12] text-primary-fixed border border-primary-container/50 hover:border-primary-container"
                              : "bg-white/[0.06] text-ivory border border-white/[0.15] hover:border-white/[0.3]"
                          }`}
                        >
                          <div className="text-center px-2">
                            <div className={`font-headline-sm text-sm truncate max-w-[120px] ${isSelected ? "text-obsidian font-bold" : "text-ivory"}`}>
                              {tb.name}
                            </div>
                            <div className={`text-[10px] font-mono ${isSelected ? "text-obsidian/80" : "text-muted"}`}>
                              {isVip ? "VIP Head Table" : tb.type === "rect" ? "Imperial Rect" : "Round Banquet"}
                            </div>
                          </div>

                          {/* Simulated Chairs around Round Table */}
                          {!isRect && (
                            <>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-6 rounded-l-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-6 rounded-r-lg bg-white/[0.1] border border-white/[0.2]" />
                            </>
                          )}

                          {/* Simulated Chairs around Rect Table */}
                          {isRect && (
                            <>
                              <div className="absolute -top-2 left-6 w-7 h-3 rounded-t-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-3 rounded-t-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute -top-2 right-6 w-7 h-3 rounded-t-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute -bottom-2 left-6 w-7 h-3 rounded-b-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-3 rounded-b-lg bg-white/[0.1] border border-white/[0.2]" />
                              <div className="absolute -bottom-2 right-6 w-7 h-3 rounded-b-lg bg-white/[0.1] border border-white/[0.2]" />
                            </>
                          )}

                          {/* Seat Count Badge */}
                          <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-md border ${
                            isFull
                              ? "bg-sage text-obsidian border-sage-light"
                              : isSelected
                              ? "bg-obsidian text-primary-fixed border-primary-container"
                              : "bg-white/[0.15] text-ivory border-white/[0.2]"
                          }`}>
                            {assignedCount}/{tb.capacity}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Drawer: Unseated Guests (Stitch Specification) */}
            <div className="border-t border-white/[0.1] bg-obsidian/95 backdrop-blur-xl transition-all">
              <div
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="px-6 py-3 border-b border-white/[0.06] cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-headline-sm text-sm text-ivory font-bold">Unseated Confirmed Guests</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-fixed font-mono text-xs font-bold border border-primary-container/30">
                    {unseatedGuests.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{drawerOpen ? "Collapse Drawer" : "Expand Drawer"}</span>
                  {drawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
              </div>

              {drawerOpen && (
                <div className="p-5 overflow-x-auto no-scrollbar flex items-center gap-2.5 min-h-[90px]">
                  {unseatedGuests.length === 0 ? (
                    <div className="text-xs text-muted font-medium py-2 text-center w-full">
                      🎉 All confirmed guests have been assigned a table seat!
                    </div>
                  ) : (
                    unseatedGuests.map((guest) => (
                      <div
                        key={guest.id || guest.guest_name}
                        onClick={() => {
                          if (selectedTable) assignGuest(guest.guest_name, selectedTable.id);
                          else setShowAssignModal(true);
                        }}
                        className="shrink-0 bg-white/[0.06] hover:bg-primary-container hover:text-obsidian border border-white/[0.12] hover:border-primary-container rounded-full px-4 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
                        title={selectedTable ? `Click to seat at ${selectedTable.name}` : "Click to assign seat"}
                      >
                        <div className="w-5 h-5 rounded-full bg-primary-container/20 group-hover:bg-obsidian/20 text-primary-fixed group-hover:text-obsidian flex items-center justify-center font-mono text-[10px] font-bold">
                          {guest.guest_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold">{guest.guest_name}</span>
                        <UserPlus size={13} className="opacity-50 group-hover:opacity-100 ml-1" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* TABLE DETAILS & SEAT MANAGER (Stitch table_details_manager/code.html Specification) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {selectedTable ? (
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.15] rounded-3xl space-y-6">
              {/* Table Header & Status */}
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-primary-fixed bg-primary-container/15 px-2.5 py-1 rounded-full border border-primary-container/30 font-bold">
                    {selectedTable.type === "vip" ? "VIP Head Table" : selectedTable.type === "rect" ? "Imperial Rectangular" : "Round Banquet"}
                  </span>
                  <h2 className="font-display-lg text-2xl text-ivory font-bold mt-2">{selectedTable.name}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Capacity: {(selectedTable.assigned_guests || []).length} of {selectedTable.capacity} seats filled
                  </p>
                </div>
                <button
                  onClick={() => {
                    store.remove("tables", selectedTable.id);
                    toast.success(`Deleted ${selectedTable.name}`);
                    setSelectedTableId(tablesList.find(t => t.id !== selectedTable.id)?.id || null);
                    onRefresh();
                  }}
                  className="w-9 h-9 rounded-full hover:bg-rose/20 text-muted hover:text-rose-light flex items-center justify-center transition"
                  title="Delete Table"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Table Actions Bar (Stitch Specification) */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setShowAssignModal(true)}
                  disabled={(selectedTable.assigned_guests || []).length >= selectedTable.capacity || unseatedGuests.length === 0}
                  className="flex-1 py-2.5 px-4 bg-primary-container text-obsidian font-bold text-xs rounded-xl hover:brightness-110 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>Add Seated Guest</span>
                </button>
                <button
                  onClick={() => handleClearTable(selectedTable)}
                  disabled={(selectedTable.assigned_guests || []).length === 0}
                  className="py-2.5 px-4 bg-white/[0.06] hover:bg-rose/20 text-ivory hover:text-rose-light border border-white/[0.1] font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Clear Seats</span>
                </button>
              </div>

              {/* Seated Guests Bento Grid (Stitch Specification) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-base text-ivory font-bold">Seated Guests</h3>
                  <span className="text-xs font-mono text-primary-fixed bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                    {(selectedTable.assigned_guests || []).length} / {selectedTable.capacity} Filled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {(selectedTable.assigned_guests || []).map((guestName, idx) => {
                    const guestObj = confirmedGuests.find(g => g.guest_name === guestName);
                    const pref = (guestObj?.dietary_preference || "Standard Meal").toLowerCase();
                    const isVeg = pref.includes("veg") || pref.includes("vegan");
                    const isFish = pref.includes("fish") || pref.includes("pesca") || pref.includes("salmon");

                    return (
                      <div
                        key={guestName}
                        className="bg-white/[0.04] p-3.5 rounded-xl border border-white/[0.08] hover:border-primary-container/40 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary-fixed flex items-center justify-center font-mono text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-ivory truncate">{guestName}</h4>
                            <p className="text-[10px] text-muted truncate mt-0.5">
                              {guestObj?.household || (guestObj?.vip_status ? "VIP Guest" : "Confirmed Guest")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-muted/80 hover:text-ivory transition"
                            title={guestObj?.dietary_preference || "Standard Meal"}
                          >
                            {isVeg ? <Leaf size={14} className="text-sage-light" /> : isFish ? <Fish size={14} className="text-blue-300" /> : <Utensils size={14} className="text-primary-container" />}
                          </span>
                          <button
                            onClick={() => unseatGuest(guestName, selectedTable.id)}
                            className="w-6 h-6 rounded-full hover:bg-rose/20 text-muted hover:text-rose-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Unseat guest"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Seat Slots (Stitch Specification) */}
                  {Array.from({ length: Math.max(0, selectedTable.capacity - (selectedTable.assigned_guests || []).length) }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      onClick={() => setShowAssignModal(true)}
                      className="bg-white/[0.02] border border-dashed border-white/[0.12] hover:border-primary-container/40 hover:bg-white/[0.04] p-3.5 rounded-xl flex items-center justify-center gap-2 text-muted hover:text-primary-container transition-all cursor-pointer group"
                    >
                      <Plus size={14} className="opacity-60 group-hover:opacity-100" />
                      <span className="text-xs font-medium">Assign Seat #{idx + (selectedTable.assigned_guests || []).length + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Dietary Stats Bar (Stitch Specification) */}
              <div className="pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-2 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06]">
                <div className="flex flex-col items-center text-center">
                  <Utensils size={14} className="text-primary-container mb-1" />
                  <span className="font-headline-sm text-sm font-bold text-ivory">{dietStats.steak}</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider font-mono">Standard/Meat</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-white/[0.08]">
                  <Fish size={14} className="text-blue-300 mb-1" />
                  <span className="font-headline-sm text-sm font-bold text-ivory">{dietStats.fish}</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider font-mono">Fish/Pesca</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Leaf size={14} className="text-sage-light mb-1" />
                  <span className="font-headline-sm text-sm font-bold text-ivory">{dietStats.veg}</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider font-mono">Veg/Vegan</span>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.15] rounded-3xl text-center py-16 space-y-3">
              <Users size={32} className="text-muted mx-auto" />
              <h3 className="font-headline-sm text-lg text-ivory font-bold">Select a Table</h3>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Click on any dining table node in the floor plan canvas to inspect or modify its seated guests.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* ADD TABLE MODAL */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard variant="obsidian" padding="lg" className="w-full max-w-md border border-white/[0.2] rounded-3xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.1] mb-5">
              <h3 className="font-display-lg text-xl text-ivory font-bold">Create Dining Table</h3>
              <button
                onClick={() => setShowAddTableModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-ivory hover:bg-white/[0.1]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block wedding-label mb-1.5 text-xs">Table Name / Number *</label>
                <input
                  type="text"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Table 1 (Head Table)"
                  className="fv-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block wedding-label mb-1.5 text-xs">Table Shape / Type *</label>
                <select
                  value={tType}
                  onChange={(e) => setTType(e.target.value as any)}
                  className="fv-input text-xs bg-obsidian"
                >
                  <option value="round">Round Banquet Table</option>
                  <option value="rect">Rectangular Imperial</option>
                  <option value="vip">VIP Head Table</option>
                </select>
              </div>
              <div>
                <label className="block wedding-label mb-1.5 text-xs">Seat Capacity *</label>
                <input
                  type="number"
                  value={tCap}
                  onChange={(e) => setTCap(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="fv-input text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.1]">
                <button type="button" onClick={() => setShowAddTableModal(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="fv-btn-primary !py-2 !px-5 text-xs font-bold shadow-lg">
                  Place on Map
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ASSIGN GUEST TO TABLE MODAL */}
      {showAssignModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard variant="obsidian" padding="lg" className="w-full max-w-md max-h-[80vh] flex flex-col border border-white/[0.2] rounded-3xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.1] mb-4 shrink-0">
              <div>
                <span className="text-[10px] text-primary-container uppercase font-bold tracking-wider">Seat Assignment</span>
                <h3 className="font-display-lg text-xl text-ivory font-bold">Seat Guest at {selectedTable.name}</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-ivory hover:bg-white/[0.1]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {unseatedGuests.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted">
                  No unseated confirmed guests available.
                </div>
              ) : (
                unseatedGuests.map((guest) => (
                  <div
                    key={guest.id || guest.guest_name}
                    onClick={() => assignGuest(guest.guest_name, selectedTable.id)}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-primary-container hover:text-obsidian border border-white/[0.08] hover:border-primary-container flex items-center justify-between transition cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-ivory group-hover:text-obsidian">{guest.guest_name}</h4>
                      <p className="text-[10px] text-muted group-hover:text-obsidian/80">
                        {guest.household || (guest.vip_status ? "VIP Guest" : "Confirmed Guest")} • {guest.dietary_preference || "Standard Meal"}
                      </p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/[0.08] group-hover:bg-obsidian/20 flex items-center justify-center text-primary-fixed group-hover:text-obsidian">
                      <Plus size={14} />
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.1] mt-4 flex justify-end shrink-0">
              <button
                onClick={() => setShowAssignModal(false)}
                className="fv-btn-ghost !py-2 !px-5 text-xs"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
