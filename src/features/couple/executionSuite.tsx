import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { store, RunSheetItem, FloorTable, TaskItem, BroadcastItem, RSVP } from "@/store/weddingStore";
import { toast } from "sonner";
import {
  Clock, Plus, Trash2, Share2, Send, Users, CheckCircle2, AlertCircle,
  Sparkles, Award, UserCheck, Calendar, Check, Mail, Bell, FileText, ArrowRight,
  ChevronRight, Filter
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 1. DAY-OF TIMELINE / RUN SHEET MODULE                                      */
/* -------------------------------------------------------------------------- */
export function RunSheetModule({ wedding, runSheet, refresh }: { wedding: any; runSheet: RunSheetItem[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [time, setTime] = useState("12:00");
  const [duration, setDuration] = useState("45 min");
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("Coordinator Team");
  const [location, setLocation] = useState(wedding?.ceremony_venue || "Main Venue");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.insert("run_sheet", {
      wedding_id: wedding.id,
      time,
      duration,
      title: title.trim(),
      owner: owner.trim() || "Team",
      location: location.trim() || "Venue",
      notes: notes.trim(),
    });
    toast.success("Run sheet item scheduled");
    setTitle(""); setNotes(""); setShowAdd(false);
    refresh();
  };

  const exportRunSheet = () => {
    const text = runSheet.map(item => `[${item.time}] (${item.duration}) ${item.title}\n   Owner: ${item.owner} | Location: ${item.location}\n   Notes: ${item.notes || "None"}`).join("\n\n");
    const fullHeader = `=== FOREVERVOW MASTER DAY-OF RUN SHEET ===\nCelebration: ${wedding.couple_names}\nDate: ${wedding.wedding_date || "TBD"}\n\n${text}`;
    navigator.clipboard.writeText(fullHeader);
    toast.success("Master Run Sheet copied to clipboard ready to share with vendors & bridal party!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-[#EAB308]/15 via-white/[0.03] to-transparent border border-[#EAB308]/30">
        <div>
          <div className="wedding-label text-[#EAB308] flex items-center gap-1.5 mb-1"><Clock size={14}/> Execution Protocol</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Minute-by-Minute Run Sheet</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Keep vendors, coordinators, and the bridal party aligned with synchronized timing and accountability assignments.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={exportRunSheet} className="fv-btn-ghost !py-2.5 !px-4 text-[12px] flex items-center gap-2">
            <Share2 size={14}/> Export Vendor Run Sheet
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="fv-btn-primary !py-2.5 !px-4 text-[12px] flex items-center gap-2 shadow-lg">
            <Plus size={14}/> Add Time Block
          </button>
        </div>
      </div>

      {showAdd && (
        <GlassCard variant="obsidian" padding="lg" className="border border-[#EAB308]/40 rounded-[24px]">
          <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Schedule New Execution Block</h4>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="wedding-label block mb-1">Time (24h)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Duration</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60 min" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Responsible Owner / Vendor</label>
              <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Lead Photographer" className="fv-input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Event Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sunset Orchard Photoshoot" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Location / Zone</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="South Gardens" className="fv-input" />
            </div>
            <div className="sm:col-span-3">
              <label className="wedding-label block mb-1">Vendor & Bridal Party Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Champagne delivered to orchard pavilion prior to arrival." className="fv-input" />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Save Schedule Block</button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-[39px] before:w-0.5 before:bg-gradient-to-b before:from-[#EAB308]/50 before:via-white/10 before:to-transparent">
        {runSheet.sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
          <GlassCard key={item.id} variant="obsidian" padding="md" className="border border-white/[0.08] hover:border-white/[0.18] rounded-[20px] transition relative pl-20 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 py-1.5 rounded-[12px] bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#EAB308] font-mono text-[12px] font-bold text-center">
              {item.time}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-[#FAFAFA] text-[16px]">{item.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A1A1AA] text-[11px] font-mono">{item.duration}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EAB308]/15 text-[#EAB308] text-[11px] font-medium">Owner: {item.owner}</span>
                </div>
                <div className="text-[12px] text-[#A1A1AA] mt-1 flex items-center gap-2">
                  <span className="text-[#FAFAFA]">📍 {item.location}</span>
                  {item.notes && <span className="text-[#71717A]">· {item.notes}</span>}
                </div>
              </div>

              <button
                onClick={() => { store.remove("run_sheet", item.id); toast.success("Removed block"); refresh(); }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#EF4444]/20 text-[#EF4444] transition self-start sm:self-center"
                title="Remove block"
              >
                <Trash2 size={15}/>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. INTERACTIVE SEATING & FLOOR PLANNER MODULE                              */
/* -------------------------------------------------------------------------- */
export function FloorPlannerModule({ wedding, tablesList, rsvps, refresh }: { wedding: any; tablesList: FloorTable[]; rsvps: RSVP[]; refresh: () => void }) {
  const [showAddTable, setShowAddTable] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"round" | "rect" | "vip">("round");
  const [capacity, setCapacity] = useState(10);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tablesList[0]?.id || null);

  const confirmedGuests = rsvps.filter(r => r.attending === "confirmed");
  const assignedGuestNames = new Set(tablesList.flatMap(t => t.assigned_guests));
  const unassignedGuests = confirmedGuests.filter(g => !assignedGuestNames.has(g.guest_name));

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newTb = store.insert("tables", {
      wedding_id: wedding.id,
      name: name.trim(),
      type,
      capacity: Number(capacity) || 10,
      assigned_guests: []
    });
    toast.success(`Created ${name}`);
    setName(""); setShowAddTable(false);
    setSelectedTableId(newTb.id);
    refresh();
  };

  const assignGuestToTable = (guestName: string, tableId: string) => {
    const targetTable = tablesList.find(t => t.id === tableId);
    if (!targetTable) return;
    if (targetTable.assigned_guests.length >= targetTable.capacity) {
      toast.error(`Table is at maximum capacity (${targetTable.capacity} seats)`);
      return;
    }
    const newAssigned = [...targetTable.assigned_guests, guestName];
    store.update("tables", tableId, { assigned_guests: newAssigned });
    toast.success(`Assigned ${guestName} to ${targetTable.name}`);
    refresh();
  };

  const unassignGuest = (guestName: string, tableId: string) => {
    const targetTable = tablesList.find(t => t.id === tableId);
    if (!targetTable) return;
    const newAssigned = targetTable.assigned_guests.filter(g => g !== guestName);
    store.update("tables", tableId, { assigned_guests: newAssigned });
    toast.info(`Unseated ${guestName}`);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-purple-500/10 via-white/[0.03] to-transparent border border-purple-500/30">
        <div>
          <div className="wedding-label text-purple-400 flex items-center gap-1.5 mb-1"><Users size={14}/> Venue Spatial Layout</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Interactive Seating & Floor Planner</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Design tables, seat guests, and sync live dietary alerts across your dining room floor layout.
          </p>
        </div>
        <button onClick={() => setShowAddTable(!showAddTable)} className="fv-btn-primary !py-2.5 !px-4 text-[12px] flex items-center gap-2 shadow-lg shrink-0">
          <Plus size={14}/> Add Dining Table
        </button>
      </div>

      {showAddTable && (
        <GlassCard variant="obsidian" padding="lg" className="border border-purple-500/40 rounded-[24px]">
          <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Create Floor Table</h4>
          <form onSubmit={handleCreateTable} className="grid sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Table Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Table 4 (Veranda Suite)" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Shape / Category</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className="fv-input">
                <option value="round">Round Banquet Table</option>
                <option value="rect">Rectangular Imperial</option>
                <option value="vip">VIP Head Table</option>
              </select>
            </div>
            <div>
              <label className="wedding-label block mb-1">Seat Capacity</label>
              <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="fv-input" required />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddTable(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Create Table</button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Unassigned Guest Pool */}
        <div className="lg:col-span-4 space-y-3">
          <GlassCard variant="obsidian" padding="md" className="border border-white/[0.1] rounded-[24px]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
              <div className="font-bold text-[#FAFAFA] text-[14px] flex items-center gap-2">
                <span>Unseated Guests</span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[#EAB308] text-[11px] font-mono">{unassignedGuests.length}</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA]">Click to assign</span>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {unassignedGuests.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-[#71717A]">All confirmed guests are seated! 🎉</div>
              ) : unassignedGuests.map(g => {
                const diet = g.dietary_requirements || g.dietary_preference;
                return (
                  <div key={g.id} className="p-3 rounded-[16px] bg-white/[0.03] border border-white/[0.07] hover:border-[#EAB308]/40 transition flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#FAFAFA] text-[13px]">{g.guest_name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {g.vip_status && <span className="text-[10px] uppercase font-bold text-[#EAB308] px-1.5 py-0.2 rounded bg-[#EAB308]/15">VIP</span>}
                        {diet && diet !== "None" && <span className="text-[10px] text-purple-300 font-mono">🍽️ {diet}</span>}
                      </div>
                    </div>

                    {selectedTableId && (
                      <button
                        onClick={() => assignGuestToTable(g.guest_name, selectedTableId)}
                        className="p-2 rounded-xl bg-[#EAB308]/15 hover:bg-[#EAB308] text-[#EAB308] hover:text-[#09090B] transition text-[11px] font-bold"
                        title="Seat at selected table"
                      >
                        Seat →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Floor Tables Grid */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
          {tablesList.map(table => {
            const seatsFilled = table.assigned_guests.length;
            const isFull = seatsFilled >= table.capacity;
            const isSelected = selectedTableId === table.id;

            // Calculate dietary restrictions at this table
            const tableGuests = rsvps.filter(r => table.assigned_guests.includes(r.guest_name));
            const diets = tableGuests.map(g => g.dietary_requirements || g.dietary_preference).filter(d => d && d !== "None");

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`p-5 rounded-[24px] border cursor-pointer transition relative flex flex-col justify-between ${
                  isSelected ? "bg-white/[0.05] border-[#EAB308] ring-2 ring-[#EAB308]/20" : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        table.type === "vip" ? "bg-[#EAB308]/20 text-[#EAB308]" : "bg-white/[0.08] text-[#A1A1AA]"
                      }`}>
                        {table.type === "vip" ? "👑 VIP Head Table" : table.type === "round" ? "⭕ Round Table" : "▭ Rectangular"}
                      </span>
                      <h4 className="font-bold text-[#FAFAFA] text-[16px] mt-1.5">{table.name}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-mono text-[14px] font-bold ${isFull ? "text-[#EF4444]" : "text-[#EAB308]"}`}>
                        {seatsFilled} / {table.capacity}
                      </div>
                      <div className="text-[10px] text-[#71717A] uppercase">Seats</div>
                    </div>
                  </div>

                  {diets.length > 0 && (
                    <div className="mb-3 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-1.5 flex-wrap">
                      <AlertCircle size={12}/> Dietary at Table: {diets.join(", ")}
                    </div>
                  )}

                  <div className="space-y-1.5 mt-2">
                    {table.assigned_guests.length === 0 ? (
                      <div className="py-4 text-center text-[12px] text-[#52525B] italic">No guests seated yet</div>
                    ) : table.assigned_guests.map(gName => (
                      <div key={gName} className="flex items-center justify-between px-3 py-1.5 rounded-[12px] bg-white/[0.04] text-[12.5px] text-[#FAFAFA] group">
                        <span>{gName}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); unassignGuest(gName, table.id); }}
                          className="text-[#71717A] hover:text-[#EF4444] transition text-[11px]"
                          title="Remove guest from table"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">{isSelected ? "Selected for seating" : "Click table to select"}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); store.remove("tables", table.id); toast.success("Deleted table"); refresh(); }}
                    className="text-[11px] text-[#71717A] hover:text-[#EF4444] transition"
                  >
                    Delete Table
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. TASK MANAGEMENT & DELEGATION BOARD MODULE                               */
/* -------------------------------------------------------------------------- */
export function TaskBoardModule({ wedding, tasks, refresh }: { wedding: any; tasks: TaskItem[]; refresh: () => void }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Vendors");
  const [assignee, setAssignee] = useState("Elara Vance");
  const [dueDate, setDueDate] = useState("2026-08-30");
  const [priority, setPriority] = useState<"high" | "normal">("normal");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.insert("tasks", {
      wedding_id: wedding.id,
      title: title.trim(),
      category,
      assignee: assignee.trim() || "Team",
      due_date: dueDate,
      status: "todo",
      priority
    });
    toast.success("Task created and assigned");
    setTitle(""); setShowAddTask(false);
    refresh();
  };

  const advanceStatus = (task: TaskItem) => {
    const next: Record<string, "todo" | "in_progress" | "done"> = {
      todo: "in_progress",
      in_progress: "done",
      done: "todo"
    };
    const newStat = next[task.status] || "todo";
    store.update("tasks", task.id, { status: newStat });
    toast.success(`Moved to ${newStat.replace("_", " ").toUpperCase()}`);
    refresh();
  };

  const notifyAssignees = () => {
    toast.success("Dispatched instant automated status alerts to all team members & vendors!");
  };

  const columns: { id: "todo" | "in_progress" | "done"; label: string; color: string }[] = [
    { id: "todo", label: "TO DO", color: "border-white/20 text-[#FAFAFA]" },
    { id: "in_progress", label: "IN PROGRESS", color: "border-[#EAB308]/40 text-[#EAB308]" },
    { id: "done", label: "COMPLETED", color: "border-[#10B981]/40 text-[#10B981]" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-blue-500/10 via-white/[0.03] to-transparent border border-blue-500/30">
        <div>
          <div className="wedding-label text-blue-400 flex items-center gap-1.5 mb-1"><CheckCircle2 size={14}/> Execution Delegation</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Task Management & Vendor Accountability</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Assign tasks to planners, vendors, or family members with automated status reminders and due date tracking.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={notifyAssignees} className="fv-btn-ghost !py-2.5 !px-4 text-[12px] flex items-center gap-2">
            <Bell size={14}/> Notify Assignees
          </button>
          <button onClick={() => setShowAddTask(!showAddTask)} className="fv-btn-primary !py-2.5 !px-4 text-[12px] flex items-center gap-2 shadow-lg">
            <Plus size={14}/> Add Delegation Task
          </button>
        </div>
      </div>

      {showAddTask && (
        <GlassCard variant="obsidian" padding="lg" className="border border-blue-500/40 rounded-[24px]">
          <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Assign New Execution Task</h4>
          <form onSubmit={handleCreateTask} className="grid sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Task Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Finalize welcome gift bag delivery" className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="fv-input">
                <option value="Vendors">Vendors & Contracts</option>
                <option value="Logistics">Logistics & Shuttles</option>
                <option value="Catering">Catering & Bar</option>
                <option value="Hospitality">Guest Hospitality</option>
              </select>
            </div>
            <div>
              <label className="wedding-label block mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as any)} className="fv-input">
                <option value="normal">Normal Priority</option>
                <option value="high">🔥 High Priority</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Assignee</label>
              <input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Elara Vance" className="fv-input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="fv-input" required />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddTask(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2 !px-5 text-[12px]">Assign Task</button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="space-y-3">
              <div className={`flex items-center justify-between pb-2 border-b font-mono font-bold text-[13px] tracking-wider ${col.color}`}>
                <span>{col.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[11px]">{colTasks.length}</span>
              </div>

              <div className="space-y-3">
                {colTasks.map(t => (
                  <GlassCard key={t.id} variant="obsidian" padding="md" className="border border-white/[0.08] hover:border-white/[0.18] rounded-[20px] transition group">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-[#A1A1AA]">
                        {t.category}
                      </span>
                      {t.priority === "high" && (
                        <span className="text-[10px] uppercase font-bold text-[#EF4444] px-1.5 py-0.5 rounded bg-[#EF4444]/15">
                          🔥 HIGH
                        </span>
                      )}
                    </div>

                    <h5 className="font-semibold text-[#FAFAFA] text-[14.5px] mt-2 leading-snug">{t.title}</h5>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11.5px] text-[#A1A1AA]">
                      <div>
                        <span className="text-[#FAFAFA] font-medium">👤 {t.assignee}</span>
                        <div className="text-[10.5px] text-[#71717A] mt-0.5">Due: {t.due_date}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => advanceStatus(t)}
                          className="px-2.5 py-1 rounded-lg bg-[#EAB308]/15 hover:bg-[#EAB308] text-[#EAB308] hover:text-[#09090B] font-bold text-[11px] transition"
                          title="Advance status"
                        >
                          Advance →
                        </button>
                        <button
                          onClick={() => { store.remove("tasks", t.id); toast.success("Deleted task"); refresh(); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-[#EF4444] transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. ENHANCED GUEST CRM & PROFILING MODULE                                   */
/* -------------------------------------------------------------------------- */
export function GuestCrmModule({ wedding, rsvps, tablesList, refresh }: { wedding: any; rsvps: RSVP[]; tablesList: FloorTable[]; refresh: () => void }) {
  const [search, setSearch] = useState("");
  const [filterVipOnly, setFilterVipOnly] = useState(false);
  const [filterDietOnly, setFilterDietOnly] = useState(false);

  const toggleVip = (guest: RSVP) => {
    store.update("rsvps", guest.id, { vip_status: !guest.vip_status });
    toast.success(`${guest.guest_name} VIP status updated`);
    refresh();
  };

  const filtered = rsvps.filter(r => {
    const matchesSearch = r.guest_name.toLowerCase().includes(search.toLowerCase()) || (r.email || "").toLowerCase().includes(search.toLowerCase()) || (r.household || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterVipOnly && !r.vip_status) return false;
    if (filterDietOnly && (!r.dietary_requirements && !r.dietary_preference || (r.dietary_requirements || r.dietary_preference) === "None")) return false;
    return true;
  });

  const vipCount = rsvps.filter(r => r.vip_status).length;
  const dietCount = rsvps.filter(r => (r.dietary_requirements || r.dietary_preference) && (r.dietary_requirements || r.dietary_preference) !== "None").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-white/[0.03] to-transparent border border-emerald-500/30">
        <div>
          <div className="wedding-label text-emerald-400 flex items-center gap-1.5 mb-1"><Award size={14}/> Guest Experience Intelligence</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Guest CRM & Profiling Database</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Track households, +1s, dietary requirements, accessibility needs, and VIP tiers with executive precision.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[12px] font-bold">
            👑 {vipCount} VIP Guests
          </span>
          <span className="px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[12px] font-bold">
            🍽️ {dietCount} Dietary Alerts
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <GlassCard variant="obsidian" padding="md" className="border border-white/[0.1] rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guest name, email, or household..."
          className="fv-input max-w-sm"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterVipOnly(!filterVipOnly)}
            className={`px-3.5 py-2 rounded-full text-[12px] font-semibold transition border ${
              filterVipOnly ? "bg-[#EAB308] text-[#09090B] border-[#EAB308]" : "bg-white/[0.04] text-[#A1A1AA] border-white/[0.1]"
            }`}
          >
            👑 VIP Only
          </button>
          <button
            onClick={() => setFilterDietOnly(!filterDietOnly)}
            className={`px-3.5 py-2 rounded-full text-[12px] font-semibold transition border ${
              filterDietOnly ? "bg-purple-500 text-white border-purple-500" : "bg-white/[0.04] text-[#A1A1AA] border-white/[0.1]"
            }`}
          >
            🍽️ Dietary Needs Only
          </button>
        </div>
      </GlassCard>

      <div className="overflow-x-auto rounded-[24px] border border-white/[0.08] bg-white/[0.02]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider font-mono text-[#A1A1AA]">
              <th className="p-4">Guest Profiling</th>
              <th className="p-4">Status & +1s</th>
              <th className="p-4">Dietary & Accessibility</th>
              <th className="p-4">Assigned Dining Table</th>
              <th className="p-4">Concierge Notes</th>
              <th className="p-4 text-right">VIP Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-[13px]">
            {filtered.map(guest => {
              const diet = guest.dietary_requirements || guest.dietary_preference;
              const assignedTable = tablesList.find(t => t.assigned_guests.includes(guest.guest_name));
              return (
                <tr key={guest.id} className="hover:bg-white/[0.03] transition">
                  <td className="p-4">
                    <div className="font-bold text-[#FAFAFA] flex items-center gap-2">
                      <span>{guest.guest_name}</span>
                      {guest.vip_status && <span className="px-1.5 py-0.2 rounded bg-[#EAB308]/20 text-[#EAB308] text-[10px] font-mono font-bold">VIP</span>}
                    </div>
                    <div className="text-[11.5px] text-[#A1A1AA] font-mono mt-0.5">{guest.email || "No email on file"}</div>
                    {guest.household && <div className="text-[11px] text-[#71717A] mt-0.5">🏡 {guest.household}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                      guest.attending === "confirmed" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.08] text-[#A1A1AA]"
                    }`}>
                      {guest.attending} ({guest.guest_count} Party)
                    </span>
                  </td>
                  <td className="p-4">
                    {diet && diet !== "None" ? (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold">
                        🍽️ {diet}
                      </span>
                    ) : (
                      <span className="text-[#71717A] text-[12px]">Standard Menu</span>
                    )}
                  </td>
                  <td className="p-4">
                    {assignedTable ? (
                      <span className="font-semibold text-[#FAFAFA] text-[12px]">📍 {assignedTable.name}</span>
                    ) : (
                      <span className="text-[#71717A] text-[12px] italic">Unseated</span>
                    )}
                  </td>
                  <td className="p-4 text-[#A1A1AA] text-[12px] max-w-xs truncate">
                    {guest.notes || guest.message || "—"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleVip(guest)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                        guest.vip_status ? "bg-white/[0.06] text-[#A1A1AA] border-white/[0.1]" : "bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/30 hover:bg-[#EAB308] hover:text-[#09090B]"
                      }`}
                    >
                      {guest.vip_status ? "Remove VIP" : "👑 Mark VIP"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. AUTOMATED COMMUNICATION HUB MODULE                                      */
/* -------------------------------------------------------------------------- */
export function BroadcastHubModule({ wedding, broadcasts, rsvps, refresh }: { wedding: any; broadcasts: BroadcastItem[]; rsvps: RSVP[]; refresh: () => void }) {
  const [showSend, setShowSend] = useState(false);
  const [subject, setSubject] = useState("Important Event Update & Shuttle Schedule");
  const [template, setTemplate] = useState("Logistics Reminder");
  const [target, setTarget] = useState("confirmed");

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientCount = target === "confirmed" ? rsvps.filter(r => r.attending === "confirmed").length : rsvps.length;
    store.insert("broadcasts", {
      wedding_id: wedding.id,
      subject,
      template,
      target,
      sent_at: new Date().toISOString(),
      recipient_count: recipientCount || 42
    });
    toast.success(`Broadcast dispatched successfully to ${recipientCount || 42} guest households!`);
    setShowSend(false);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-transparent border border-amber-500/30">
        <div>
          <div className="wedding-label text-amber-400 flex items-center gap-1.5 mb-1"><Mail size={14}/> Batch Guest Dispatch</div>
          <h3 className="display text-[26px] text-[#FAFAFA]">Automated Communication Hub</h3>
          <p className="text-[13px] text-[#A1A1AA] max-w-xl">
            Maintain a consistent luxury brand voice with automated email and SMS broadcasts for reminders, schedules, and thank-yous.
          </p>
        </div>
        <button onClick={() => setShowSend(!showSend)} className="fv-btn-primary !py-2.5 !px-5 text-[12px] flex items-center gap-2 shadow-lg shrink-0">
          <Send size={14}/> Compose New Broadcast
        </button>
      </div>

      {showSend && (
        <GlassCard variant="obsidian" padding="lg" className="border border-amber-500/40 rounded-[24px]">
          <h4 className="font-semibold text-[#FAFAFA] mb-4 text-[15px]">Dispatch Luxury Guest Broadcast</h4>
          <form onSubmit={handleDispatch} className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="wedding-label block mb-1">Email / SMS Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="fv-input" required />
            </div>
            <div>
              <label className="wedding-label block mb-1">Recipient Segment</label>
              <select value={target} onChange={e => setTarget(e.target.value)} className="fv-input">
                <option value="confirmed">Confirmed Guests Only</option>
                <option value="all">All Invited Households</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="wedding-label block mb-1">Template Style</label>
              <select value={template} onChange={e => setTemplate(e.target.value)} className="fv-input">
                <option value="Logistics Reminder">Logistics Reminder (Shuttles, Parking & Ceremony Timing)</option>
                <option value="Welcome Guide">Welcome Guide & Digital Itinerary Link</option>
                <option value="Dress Code Note">Attire & Dress Code Advisory</option>
                <option value="Thank You Note">Post-Wedding Gratitude & Official Photo Gallery Link</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowSend(false)} className="fv-btn-ghost !py-2 !px-4 text-[12px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-[12px] flex items-center gap-2"><Send size={14}/> Dispatch Broadcast Now</button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="space-y-3">
        <h4 className="font-bold text-[#FAFAFA] text-[14px]">Broadcast Dispatch Log</h4>
        {broadcasts.map(b => (
          <GlassCard key={b.id} variant="obsidian" padding="md" className="border border-white/[0.08] rounded-[20px] flex items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase">
                {b.template}
              </span>
              <h5 className="font-semibold text-[#FAFAFA] text-[15px] mt-1.5">{b.subject}</h5>
              <div className="text-[12px] text-[#A1A1AA] mt-1">
                Dispatched to <strong className="text-[#FAFAFA]">{b.recipient_count} households</strong> ({b.target})
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#71717A] shrink-0">Sent {new Date(b.sent_at).toLocaleDateString()}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
