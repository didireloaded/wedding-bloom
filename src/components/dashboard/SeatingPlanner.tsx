import { useCallback, useEffect, useState } from "react";
import { Check, ImagePlus, MapPin, Plus, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type SeatingTable = Database["public"]["Tables"]["seating_tables"]["Row"];
type Assignment = Database["public"]["Tables"]["seating_assignments"]["Row"];
type Rsvp = Pick<Database["public"]["Tables"]["rsvps"]["Row"], "id" | "guest_name" | "guest_count" | "attending">;
type SeatingPlan = Database["public"]["Tables"]["wedding_seating_plans"]["Row"];
type Marker = { id: string; kind: string; label: string; x: number; y: number };

const markerKinds = ["Bar", "Bathrooms", "Photo booth", "Entrance", "Stage", "Other"];
const imageTypes: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const asMarkers = (value: unknown): Marker[] => Array.isArray(value) ? value.filter((item): item is Marker =>
  item && typeof item.id === "string" && typeof item.kind === "string" && typeof item.label === "string" &&
  typeof item.x === "number" && item.x >= 0 && item.x <= 100 && typeof item.y === "number" && item.y >= 0 && item.y <= 100
) : [];

export default function SeatingPlanner({ weddingId, published, rsvps }: { weddingId: string; published: boolean; rsvps: Rsvp[] }) {
  const { user } = useAuth();
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [plan, setPlan] = useState<SeatingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState(8);
  const [placingTable, setPlacingTable] = useState<string | null>(null);
  const [placingPlace, setPlacingPlace] = useState("");
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const refresh = useCallback(async () => {
    if (weddingId === "preview-wedding") { setLoading(false); return; }
    const [tableResult, assignmentResult, planResult] = await Promise.all([
      supabase.from("seating_tables").select("*").eq("wedding_id", weddingId).order("sort_order"),
      supabase.from("seating_assignments").select("*, seating_tables!inner(wedding_id)").eq("seating_tables.wedding_id", weddingId),
      supabase.from("wedding_seating_plans").select("*").eq("wedding_id", weddingId).maybeSingle(),
    ]);
    if (tableResult.error || assignmentResult.error || planResult.error) toast.error("Could not load seating. Please retry.");
    else {
      setTables(tableResult.data || []);
      setAssignments((assignmentResult.data || []).map(({ seating_tables: _table, ...assignment }) => assignment));
      setPlan(planResult.data);
    }
    setLoading(false);
  }, [weddingId]);

  useEffect(() => { void refresh(); }, [refresh]);
  const confirmed = rsvps.filter((rsvp) => rsvp.attending === true);
  const assignedConfirmed = confirmed.filter((rsvp) => assignments.some((assignment) => assignment.rsvp_id === rsvp.id));
  const occupied = (tableId: string) => assignments.filter((assignment) => assignment.table_id === tableId)
    .reduce((total, assignment) => total + (confirmed.find((rsvp) => rsvp.id === assignment.rsvp_id)?.guest_count || 0), 0);
  const planUrl = plan?.plan_image_path ? supabase.storage.from("wedding-images").getPublicUrl(plan.plan_image_path).data.publicUrl : null;
  const markers = asMarkers(plan?.markers);

  const addTable = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !Number.isInteger(capacity) || capacity < 1 || capacity > 100) return;
    setBusy(true);
    const { error } = await supabase.from("seating_tables").insert({ wedding_id: weddingId, table_name: name.trim(), capacity, sort_order: tables.length });
    if (error) toast.error(error.message);
    else { setName(""); setHasLocalChanges(true); await refresh(); }
    setBusy(false);
  };
  const saveTable = async (tableId: string) => {
    if (!editName.trim() || !Number.isInteger(editCapacity) || editCapacity < 1 || editCapacity > 100) return;
    setBusy(true);
    const { error } = await supabase.from("seating_tables").update({ table_name: editName.trim(), capacity: editCapacity }).eq("id", tableId).eq("wedding_id", weddingId);
    if (error) toast.error(error.message);
    else { setEditId(null); setHasLocalChanges(true); await refresh(); }
    setBusy(false);
  };
  const removeTable = async (table: SeatingTable) => {
    if (!window.confirm(`Remove ${table.table_name} and its draft assignments? Guests keep their last published details until you publish again.`)) return;
    setBusy(true);
    const { error } = await supabase.from("seating_tables").delete().eq("id", table.id).eq("wedding_id", weddingId);
    if (error) toast.error(error.message);
    else { setHasLocalChanges(true); await refresh(); }
    setBusy(false);
  };
  const assign = async (rsvp: Rsvp, tableId: string) => {
    const existing = assignments.find((assignment) => assignment.rsvp_id === rsvp.id);
    setBusy(true);
    const result = !tableId && existing ? await supabase.from("seating_assignments").delete().eq("id", existing.id)
      : tableId && existing ? await supabase.from("seating_assignments").update({ table_id: tableId }).eq("id", existing.id)
      : tableId ? await supabase.from("seating_assignments").insert({ table_id: tableId, rsvp_id: rsvp.id, guest_name: rsvp.guest_name }) : null;
    if (result?.error) toast.error(result.error.message);
    else { setHasLocalChanges(true); await refresh(); }
    setBusy(false);
  };
  const savePlan = async (changes: { plan_image_path?: string | null; markers?: Marker[] }) => {
    const payload = { ...changes, updated_at: new Date().toISOString() };
    const result = plan ? await supabase.from("wedding_seating_plans").update(payload).eq("wedding_id", weddingId)
      : await supabase.from("wedding_seating_plans").insert({ wedding_id: weddingId, ...payload });
    if (result.error) toast.error(result.error.message);
    else { setHasLocalChanges(true); await refresh(); }
  };
  const uploadPlan = async (file?: File) => {
    if (!file || !user) return;
    if (!imageTypes[file.type] || file.size > 10 * 1024 * 1024) { toast.error("Choose a PNG, JPEG, or WebP image under 10 MB."); return; }
    setBusy(true);
    const path = `couples/${user.id}/${weddingId}/seating/${crypto.randomUUID()}.${imageTypes[file.type]}`;
    const { error } = await supabase.storage.from("wedding-images").upload(path, file, { contentType: file.type });
    if (error) toast.error(error.message);
    else await savePlan({ plan_image_path: path });
    setBusy(false);
  };
  const place = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!placingTable && !placingPlace) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)) * 100) / 100;
    const y = Math.round(Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)) * 100) / 100;
    setBusy(true);
    if (placingTable) {
      const { error } = await supabase.from("seating_tables").update({ position_x: x, position_y: y }).eq("id", placingTable).eq("wedding_id", weddingId);
      if (error) toast.error(error.message); else { setHasLocalChanges(true); await refresh(); }
    } else await savePlan({ markers: [...markers, { id: crypto.randomUUID(), kind: placingPlace, label: placingPlace, x, y }] });
    setPlacingTable(null); setPlacingPlace(""); setBusy(false);
  };
  const publish = async () => {
    if (!published) { toast.error("Publish your wedding before sharing seating with guests."); return; }
    if (!window.confirm("Share these table assignments with confirmed guests? Changed assignments will appear in their inboxes and send push notifications where enabled.")) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("publish_wedding_seating", { p_wedding_id: weddingId });
    if (error) toast.error(error.message);
    else {
      const recipients = typeof data === "object" && data !== null && "recipients" in data ? Number(data.recipients) : 0;
      toast.success(`Seating published. ${recipients} guest${recipients === 1 ? "" : "s"} can see an in-app update.`);
      setHasLocalChanges(false);
      await refresh();
    }
    setBusy(false);
  };

  if (weddingId === "preview-wedding") return <p className="rounded-2xl bg-[#242424] p-5 text-sm text-white/70">Seating is available after your wedding is saved.</p>;
  if (loading) return <p className="py-8 text-sm text-white/60">Loading seating...</p>;
  return <div className="space-y-5 pb-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">Seating</h2><p className="mt-1 text-xs text-white/55">Arrange confirmed guests, then publish their table details.</p></div><button onClick={() => void publish()} disabled={busy || assignedConfirmed.length === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b2dc6b] px-4 text-sm font-semibold text-black disabled:opacity-50"><Send size={16} />Publish seating</button></div>
    {confirmed.length > 0 && <p className="text-xs text-white/55">{assignedConfirmed.length} of {confirmed.length} confirmed RSVP {confirmed.length === 1 ? "party" : "parties"} assigned.</p>}
    {plan?.published_at && <p className="text-xs text-white/55">Last shared {new Date(plan.published_at).toLocaleString()}{hasLocalChanges ? " · Unpublished changes" : ""}</p>}
    <section className="rounded-2xl border border-white/10 bg-[#202020] p-4"><div className="flex items-center gap-2"><MapPin size={18} className="text-[#22c4b5]" /><h3 className="font-semibold">Venue plan</h3></div><p className="mt-1 text-xs text-white/55">Optional. Upload a real site plan to place tables and useful locations.</p>
      <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-semibold"><ImagePlus size={16} />{planUrl ? "Replace plan" : "Upload plan"}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={(event) => void uploadPlan(event.target.files?.[0])} /></label>
      {planUrl && <><div className="mt-4 flex flex-wrap gap-2"><select aria-label="Place a location" value={placingPlace} onChange={(event) => { setPlacingPlace(event.target.value); setPlacingTable(null); }} className="min-h-11 rounded-xl bg-[#303030] px-3 text-sm"><option value="">Place a location</option>{markerKinds.map((kind) => <option key={kind}>{kind}</option>)}</select>{(placingPlace || placingTable) && <span className="self-center text-xs text-[#b2dc6b]">Tap the plan to place the marker</span>}</div>
        <div className={`relative mt-4 overflow-hidden rounded-xl bg-[#292929] ${placingPlace || placingTable ? "cursor-crosshair" : ""}`} onClick={(event) => void place(event)}><img src={planUrl} alt="Venue site plan" className="block h-auto w-full" />{tables.filter((table) => table.position_x !== null && table.position_y !== null).map((table) => <span key={table.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b2dc6b] px-2 py-1 text-[10px] font-bold text-black shadow" style={{ left: `${table.position_x}%`, top: `${table.position_y}%` }}>{table.table_name}</span>)}{markers.map((marker) => <span key={marker.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-black shadow" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>{marker.label}</span>)}</div>
        {markers.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{markers.map((marker) => <button key={marker.id} onClick={() => void savePlan({ markers: markers.filter((item) => item.id !== marker.id) })} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-[#303030] px-3 text-xs" title={`Remove ${marker.label}`}>{marker.label}<Trash2 size={13} /></button>)}</div>}
        <button onClick={() => void savePlan({ plan_image_path: null, markers: [] })} className="mt-3 text-xs text-white/55 underline">Remove site plan</button>
      </>}
    </section>
    <section className="rounded-2xl border border-white/10 bg-[#202020] p-4"><div className="flex items-center gap-2"><Users size={18} className="text-[#ff6245]" /><h3 className="font-semibold">Tables</h3></div><form onSubmit={(event) => void addTable(event)} className="mt-4 grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2"><input aria-label="Table name" placeholder="Table 1" value={name} maxLength={60} onChange={(event) => setName(event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-[#303030] px-3 text-sm" required /><input aria-label="Table capacity" type="number" min={1} max={100} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className="min-w-0 rounded-xl border border-white/10 bg-[#303030] px-2 text-sm" /><button disabled={busy} className="grid h-11 w-11 place-items-center rounded-full bg-[#ff6245] text-white" aria-label="Add table"><Plus size={18} /></button></form>
      {tables.length === 0 && <p className="mt-4 text-sm text-white/55">Add your first table to start arranging guests.</p>}
      <div className="mt-4 space-y-3">{tables.map((table) => <div key={table.id} className="rounded-xl border border-white/10 bg-[#2a2a2a] p-3">{editId === table.id ? <div className="flex flex-wrap gap-2"><input aria-label="Edit table name" value={editName} onChange={(event) => setEditName(event.target.value)} className="min-w-0 flex-1 rounded-lg bg-[#393939] px-3 text-sm" /><input aria-label="Edit capacity" type="number" min={1} max={100} value={editCapacity} onChange={(event) => setEditCapacity(Number(event.target.value))} className="w-16 rounded-lg bg-[#393939] px-2 text-sm" /><button onClick={() => void saveTable(table.id)} disabled={busy} className="grid h-10 w-10 place-items-center bg-[#b2dc6b] text-black" aria-label="Save table"><Check size={17} /></button><button onClick={() => setEditId(null)} className="text-xs text-white/60">Cancel</button></div> : <div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm">{table.table_name}</strong><p className="mt-1 text-xs text-white/55">{occupied(table.id)} of {table.capacity} seats filled</p></div><div className="flex items-center gap-2">{planUrl && <button onClick={() => { setPlacingTable(table.id); setPlacingPlace(""); }} className="text-xs text-[#22c4b5]">Place on plan</button>}<button onClick={() => { setEditId(table.id); setEditName(table.table_name); setEditCapacity(table.capacity); }} className="text-xs text-white/75">Edit</button><button onClick={() => void removeTable(table)} aria-label={`Remove ${table.table_name}`} className="grid h-9 w-9 place-items-center text-white/55"><Trash2 size={15} /></button></div></div>}{assignments.filter((assignment) => assignment.table_id === table.id).length > 0 && <p className="mt-3 border-t border-white/10 pt-2 text-xs text-white/65">{assignments.filter((assignment) => assignment.table_id === table.id).map((assignment) => assignment.guest_name).join(", ")}</p>}</div>)}</div>
    </section>
    <section className="rounded-2xl border border-white/10 bg-[#202020] p-4"><h3 className="font-semibold">Guest assignments</h3><p className="mt-1 text-xs text-white/55">Each RSVP party stays together. Only confirmed guests can be assigned.</p>{confirmed.length === 0 ? <p className="mt-4 text-sm text-white/55">Confirmed guests will appear here after they RSVP.</p> : <div className="mt-4 divide-y divide-white/10">{confirmed.map((rsvp) => <div key={rsvp.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{rsvp.guest_name}</p><p className="text-xs text-white/50">{rsvp.guest_count} {rsvp.guest_count === 1 ? "seat" : "seats"}</p></div><select aria-label={`Table for ${rsvp.guest_name}`} disabled={busy} value={assignments.find((assignment) => assignment.rsvp_id === rsvp.id)?.table_id || ""} onChange={(event) => void assign(rsvp, event.target.value)} className="min-h-11 max-w-[55%] rounded-xl border border-white/10 bg-[#303030] px-3 text-sm"><option value="">Unassigned</option>{tables.map((table) => <option key={table.id} value={table.id}>{table.table_name} · {table.capacity - occupied(table.id)} free</option>)}</select></div>)}</div>}</section>
  </div>;
}
