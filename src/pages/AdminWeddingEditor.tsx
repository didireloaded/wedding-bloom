import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, Trash2, ExternalLink, Download, Upload, Plus, Radio, Check, X, Users, Hotel, Car, ParkingCircle, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AIStoryGenerator from "@/components/admin/AIStoryGenerator";
import AITimelineGenerator from "@/components/admin/AITimelineGenerator";
import AIThemeGenerator from "@/components/admin/AIThemeGenerator";
import AIInvitationGenerator from "@/components/admin/AIInvitationGenerator";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LIVE_UPDATE_TYPES = ["info", "ceremony", "reception", "alert"];
const ACCOMMODATION_CATEGORIES = ["hotels", "travel", "parking"];

const AdminWeddingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [wedding, setWedding] = useState<Tables["weddings"]["Row"] | null>(null);
  const [events, setEvents] = useState<Tables["events"]["Row"][]>([]);
  const [rsvps, setRsvps] = useState<Tables["rsvps"]["Row"][]>([]);
  const [updates, setUpdates] = useState<Tables["wedding_updates"]["Row"][]>([]);
  const [galleryImages, setGalleryImages] = useState<Tables["gallery"]["Row"][]>([]);
  const [guests, setGuests] = useState<Tables["guests"]["Row"][]>([]);
  const [liveUpdates, setLiveUpdates] = useState<Tables["live_updates"]["Row"][]>([]);
  const [guestPhotos, setGuestPhotos] = useState<Tables["guest_photos"]["Row"][]>([]);
  const [accommodations, setAccommodations] = useState<Tables["accommodations"]["Row"][]>([]);
  const [weddingMoments, setWeddingMoments] = useState<Tables["wedding_moments"]["Row"][]>([]);

  const [newUpdate, setNewUpdate] = useState("");
  const [newEvent, setNewEvent] = useState({ title: "", event_time: "", location: "", description: "" });
  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "", invited_guests: 1 });
  const [newLiveUpdate, setNewLiveUpdate] = useState({ message: "", update_type: "info" });
  const [newAccommodation, setNewAccommodation] = useState({ title: "", category: "hotels", items: "" });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false, title: "", description: "", onConfirm: () => {}
  });

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [wRes, eRes, rRes, uRes, glRes, gRes, luRes, gpRes, accRes, momRes] = await Promise.all([
      supabase.from("weddings").select("*").eq("id", id!).single(),
      supabase.from("events").select("*").eq("wedding_id", id!).order("sort_order"),
      supabase.from("rsvps").select("*").eq("wedding_id", id!).order("submitted_at", { ascending: false }),
      supabase.from("wedding_updates").select("*").eq("wedding_id", id!).order("created_at", { ascending: false }),
      supabase.from("gallery").select("*").eq("wedding_id", id!).order("created_at", { ascending: false }),
      supabase.from("guests").select("*").eq("wedding_id", id!),
      supabase.from("live_updates").select("*").eq("wedding_id", id!).order("created_at", { ascending: false }),
      supabase.from("guest_photos").select("*").eq("wedding_id", id!).order("created_at", { ascending: false }),
      supabase.from("accommodations").select("*").eq("wedding_id", id!).order("sort_order"),
      supabase.from("wedding_moments").select("*").eq("wedding_id", id!).order("created_at", { ascending: false }),
      ]);
      const failed = [wRes, eRes, rRes, uRes, glRes, gRes, luRes, gpRes, accRes, momRes].find((result) => result.error);
      if (failed?.error) {
        setLoadError(failed.error.message);
        return;
      }
      setWedding(wRes.data);
      setEvents(eRes.data || []);
      setRsvps(rRes.data || []);
      setUpdates(uRes.data || []);
      setGalleryImages(glRes.data || []);
      setGuests(gRes.data || []);
      setLiveUpdates(luRes.data || []);
      setGuestPhotos(gpRes.data || []);
      setAccommodations(accRes.data || []);
      setWeddingMoments(momRes.data || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Wedding details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (id && user && isAdmin) void fetchAll();
  }, [id, user, isAdmin, fetchAll]);

  const saveWedding = async () => {
    setSaving(true);
    const { error } = await supabase.from("weddings").update({
      couple_names: wedding.couple_names,
      slug: wedding.slug,
      wedding_date: wedding.wedding_date,
      ceremony_venue: wedding.ceremony_venue,
      ceremony_time: wedding.ceremony_time,
      reception_venue: wedding.reception_venue,
      reception_time: wedding.reception_time,
      story: wedding.story,
      dress_code: wedding.dress_code,
      published: wedding.published,
      live_mode: wedding.live_mode,
      wedding_style: wedding.wedding_style,
      theme: wedding.theme,
      rsvp_deadline: wedding.rsvp_deadline || null,
      whatsapp_group_url: wedding.whatsapp_group_url || null,
      max_guests: wedding.max_guests,
    }).eq("id", id!);
    if (error) {
      if (error.code === "23505" || error.message?.includes("unique") || error.message?.includes("duplicate")) {
        toast.error("This URL slug is already in use. Please choose a different one.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Wedding saved!");
    }
    setSaving(false);
  };

  const togglePublished = async () => {
    const nextPublished = !wedding.published;
    setSaving(true);
    const { error } = await supabase
      .from("weddings")
      .update({ published: nextPublished })
      .eq("id", id!);

    if (error) {
      toast.error(error.message);
    } else {
      setWedding({ ...wedding, published: nextPublished });
      toast.success(nextPublished ? "Wedding published." : "Wedding is now private.");
    }
    setSaving(false);
  };

  const confirmAction = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
  };

  const addUpdate = async (e: React.FormEvent) => { e.preventDefault(); const { error } = await supabase.from("wedding_updates").insert({ message: newUpdate, wedding_id: id }); if (error) toast.error(error.message); else { toast.success("Update posted!"); setNewUpdate(""); fetchAll(); } };
  const removeUpdate = (uid: string) => confirmAction("Delete Update", "Delete this update?", async () => { await supabase.from("wedding_updates").delete().eq("id", uid); fetchAll(); });
  const addEvent = async (e: React.FormEvent) => { e.preventDefault(); const { error } = await supabase.from("events").insert({ ...newEvent, wedding_id: id, sort_order: events.length }); if (error) toast.error(error.message); else { toast.success("Event added!"); setNewEvent({ title: "", event_time: "", location: "", description: "" }); fetchAll(); } };
  const removeEvent = (eid: string) => confirmAction("Delete Event", "Delete this event?", async () => { await supabase.from("events").delete().eq("id", eid); fetchAll(); });
  const addGuest = async (e: React.FormEvent) => { e.preventDefault(); const { error } = await supabase.from("guests").insert({ ...newGuest, wedding_id: id }); if (error) toast.error(error.message); else { toast.success("Guest added!"); setNewGuest({ name: "", email: "", phone: "", invited_guests: 1 }); fetchAll(); } };
  const removeGuest = (gid: string) => confirmAction("Remove Guest", "Remove this guest from the list?", async () => { await supabase.from("guests").delete().eq("id", gid); fetchAll(); });

  const deleteWedding = () => confirmAction("Delete Wedding", "This will permanently delete this wedding and ALL associated data (RSVPs, guests, photos, uploaded files, etc). This cannot be undone.", async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Admin session expired. Sign in again.");
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-wedding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ wedding_id: id }),
      });
      const result = await res.json() as { deleted?: boolean; error?: string; cleanup_errors?: string[] };
      if (!res.ok || !result.deleted) throw new Error(result.error || "Failed to delete wedding");
      if (result.cleanup_errors?.length) {
        toast.warning("Wedding deleted, but some files need manual cleanup.");
        console.error("Wedding storage cleanup failed", { weddingId: id, errors: result.cleanup_errors });
      } else {
        toast.success("Wedding and files deleted.");
      }
      navigate("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete wedding");
    } finally {
      setDeleting(false);
    }
  });

  const exportRSVPsCSV = () => {
    const headers = ["Name", "Status", "Guests", "Email", "Phone", "Dietary Preference", "Dietary Note", "Message", "Date"];
    const rows = rsvps.map((r) => [
      r.guest_name,
      r.attending === true ? "Attending" : r.attending === false ? "Declined" : "Pending",
      r.guest_count,
      r.email || "",
      r.phone || "",
      r.dietary_preference || "",
      r.dietary_note || "",
      (r.message || "").replace(/"/g, '""'),
      new Date(r.submitted_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${wedding?.slug || "wedding"}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `${id}/${type}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("wedding-assets").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
    if (type === "cover") {
      const { error } = await supabase.from("weddings").update({ cover_image: publicUrl }).eq("id", id!);
      if (error) { toast.error(`Image uploaded, but wedding was not updated: ${error.message}`); return; }
      setWedding({ ...wedding, cover_image: publicUrl });
      toast.success("Cover image uploaded!");
    } else {
      const { error } = await supabase.from("gallery").insert({ image_url: publicUrl, wedding_id: id, uploaded_by: "admin" });
      if (error) { toast.error(`Image uploaded, but gallery was not updated: ${error.message}`); return; }
      toast.success("Image added to gallery!");
      fetchAll();
    }
  };
  const removeGalleryImage = (imgId: string) => confirmAction("Delete Image", "Delete this image permanently?", async () => { await supabase.from("gallery").delete().eq("id", imgId); fetchAll(); });

  const addLiveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("live_updates").insert({ ...newLiveUpdate, wedding_id: id });
    if (error) toast.error(error.message);
    else { toast.success("Live update sent!"); setNewLiveUpdate({ message: "", update_type: "info" }); fetchAll(); }
  };
  const removeLiveUpdate = (lid: string) => confirmAction("Delete Live Update", "Delete this live update?", async () => { await supabase.from("live_updates").delete().eq("id", lid); fetchAll(); });

  const approvePhoto = async (pid: string) => { await supabase.from("guest_photos").update({ approved: true }).eq("id", pid); fetchAll(); };
  const rejectPhoto = (pid: string) => confirmAction("Reject Photo", "Reject and permanently delete this guest photo?", async () => { await supabase.from("guest_photos").delete().eq("id", pid); fetchAll(); });

  const addAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = newAccommodation.items.split("\n").filter(Boolean).map((line) => {
      const [name, detail, link] = line.split("|").map((s) => s.trim());
      return JSON.stringify({ name, detail: detail || "", link: link || null });
    });
    const { error } = await supabase.from("accommodations").insert({
      title: newAccommodation.title,
      category: newAccommodation.category,
      items,
      wedding_id: id,
      sort_order: accommodations.length,
    });
    if (error) toast.error(error.message);
    else { toast.success("Accommodation added!"); setNewAccommodation({ title: "", category: "hotels", items: "" }); fetchAll(); }
  };
  const removeAccommodation = (accId: string) => confirmAction("Delete Accommodation", "Delete this accommodation block?", async () => { await supabase.from("accommodations").delete().eq("id", accId); fetchAll(); });

  const downloadQR = () => {
    const svg = document.getElementById("wedding-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => { ctx.fillStyle = "white"; ctx.fillRect(0, 0, 512, 512); ctx.drawImage(img, 0, 0, 512, 512); const a = document.createElement("a"); a.download = `${wedding.slug}-qr.png`; a.href = canvas.toDataURL("image/png"); a.click(); };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="wedding-label">Loading...</p></div>;
  if (loadError) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center"><p>Wedding details could not be loaded: {loadError}</p><button type="button" onClick={() => void fetchAll()} className="rounded-full bg-foreground px-5 py-3 text-background">Retry</button></div>;
  if (!wedding) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Wedding not found</p></div>;

  const weddingUrl = `${window.location.origin}/wedding/${wedding.slug}`;
  const tabs = ["details", "theme", "invite", "events", "guests", "rsvps", "gallery", "updates", "live", "photos", "moments", "accommodations", "qr"];
  const tabLabels: Record<string, string> = { details: "Details", theme: "Style", invite: "Invitation", events: "Schedule", guests: "Guest list", rsvps: "Responses", gallery: "Gallery", updates: "Updates", live: "Live updates", photos: "Guest photos", moments: "Moments", accommodations: "Stay & travel", qr: "QR code" };

  const rsvpConfirmed = rsvps.filter((r) => r.attending === true).length;
  const rsvpDeclined = rsvps.filter((r) => r.attending === false).length;
  const rsvpPending = rsvps.filter((r) => r.attending === null).length;
  const totalGuests = rsvps.filter((r) => r.attending === true).reduce((s, r) => s + r.guest_count, 0);

  const pendingPhotos = guestPhotos.filter((p) => !p.approved);
  const approvedPhotos = guestPhotos.filter((p) => p.approved);

  const inputClass = "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-body text-sm outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/5";
  const btnClass = "min-h-[44px] rounded-full bg-foreground px-6 py-2 font-body text-xs font-semibold text-background";

  const getCategoryIcon = (cat: string) => {
    if (cat === "hotels") return Hotel;
    if (cat === "travel") return Car;
    return ParkingCircle;
  };

  return (
    <div className="admin-app min-h-screen bg-[#f3f3f5] text-[#19191d]">
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, open: false }); }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <div className="min-w-0"><p className="font-body text-[10px] font-semibold text-black/45">Wedding</p><h1 className="truncate font-body text-base font-semibold sm:text-lg">{wedding.couple_names}</h1></div>
          <span className={`hidden rounded-full px-3 py-1 font-body text-[10px] font-semibold sm:inline-flex ${wedding.published ? "bg-[#d9f06e] text-black" : "bg-muted text-muted-foreground"}`}>
            {wedding.published ? "Published" : "Draft"}
          </span>
          {wedding.live_mode && <span className="hidden items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 font-body text-[10px] font-semibold text-destructive sm:flex"><Radio className="w-3 h-3 animate-pulse" /> Live mode</span>}
        </div>
        <div className="flex items-center gap-2">
          <a href={weddingUrl} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-foreground" title="Preview wedding"><Eye className="w-5 h-5" /></a>
          <button onClick={togglePublished} disabled={saving} className={`hidden min-h-10 rounded-full px-4 font-body text-xs font-semibold sm:inline-flex sm:items-center ${wedding.published ? "border border-black/10 bg-white text-black" : "bg-[#d9f06e] text-black"}`}>{wedding.published ? "Make private" : "Publish"}</button>
          <button onClick={deleteWedding} disabled={deleting} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-destructive disabled:opacity-50" title={deleting ? "Deleting wedding" : "Delete wedding"}><Trash2 className="w-5 h-5" /></button>
          <button onClick={saveWedding} disabled={saving} className="flex min-h-10 items-center gap-2 rounded-full bg-foreground px-4 font-body text-xs font-semibold text-background">
            <Save className="w-4 h-4" /> {saving ? "Saving" : "Save"}
          </button>
        </div>
      </nav>

      <div className="sticky top-[65px] z-20 border-b border-black/5 bg-[#f3f3f5]/95 py-2 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:hidden">
          <label className="sr-only" htmlFor="admin-editor-section">Wedding section</label>
          <select id="admin-editor-section" value={activeTab} onChange={(event) => setActiveTab(event.target.value)} className="min-h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold">
            {tabs.map((tab) => <option key={tab} value={tab}>{tabLabels[tab]}</option>)}
          </select>
        </div>
        <div className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-4 sm:flex sm:px-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} aria-current={activeTab === t ? "page" : undefined} className={`min-h-10 whitespace-nowrap rounded-full px-4 py-2 font-body text-xs font-semibold transition-colors ${activeTab === t ? "bg-[#202020] text-white" : "text-black/60 hover:bg-white hover:text-black"}`}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-medium text-black/45">{wedding.published ? "Published wedding" : "Wedding draft"}</p><h2 className="mt-1 text-2xl font-semibold">{tabLabels[activeTab]}</h2></div>
          <div className="flex flex-wrap gap-2 text-xs text-black/60"><span className="rounded-full bg-white px-3 py-2">{rsvpConfirmed} confirmed</span><span className="rounded-full bg-white px-3 py-2">{rsvpPending} undecided</span><span className="rounded-full bg-white px-3 py-2">{totalGuests} attending</span></div>
        </div>
        {/* DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-6 rounded-lg border border-black/5 bg-white p-5 sm:p-7">
            <div><h3 className="text-base font-semibold">Wedding information</h3><p className="mt-1 text-xs text-black/55">Dates, places, and details shown to guests.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Couple names", key: "couple_names" },
                { label: "URL slug", key: "slug" },
                { label: "Dress code", key: "dress_code" },
                { label: "Ceremony venue", key: "ceremony_venue" },
                { label: "Ceremony time", key: "ceremony_time" },
                { label: "Reception venue", key: "reception_venue" },
                { label: "Reception time", key: "reception_time" },
                { label: "WhatsApp group link", key: "whatsapp_group_url" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="wedding-label block mb-2">{label}</label>
                  <input value={wedding[key] || ""} onChange={(e) => setWedding({ ...wedding, [key]: e.target.value })} className={`${inputClass} py-3`} />
                </div>
              ))}
              <div className="col-span-1 md:col-span-2">
                <p className="font-body text-[10px] text-muted-foreground mt-[-12px]">
                  Paste a WhatsApp group invite link (e.g. https://chat.whatsapp.com/XXXXXXX). Guests who RSVP yes will see a button to join after submitting.
                </p>
              </div>
              <div>
                <label className="wedding-label block mb-2">Wedding date</label>
                <input type="date" value={wedding.wedding_date || ""} onChange={(e) => setWedding({ ...wedding, wedding_date: e.target.value })} className={`${inputClass} py-3`} />
              </div>
              <div>
                <label className="wedding-label block mb-2">RSVP deadline</label>
                <input type="date" value={wedding.rsvp_deadline || ""} onChange={(e) => setWedding({ ...wedding, rsvp_deadline: e.target.value })} className={`${inputClass} py-3`} />
              </div>
              <div>
                <label className="wedding-label block mb-2">Maximum guests (capacity)</label>
                <input type="number" min="1" value={wedding.max_guests ?? ""} onChange={(e) => setWedding({ ...wedding, max_guests: e.target.value ? Number(e.target.value) : null })} placeholder="Leave empty for unlimited" className={`${inputClass} py-3`} />
                <p className="font-body text-[10px] text-muted-foreground mt-1">Set a venue capacity limit. RSVP form will stop accepting once this is reached.</p>
              </div>
            </div>
            <div>
              <label className="wedding-label block mb-2">Wedding story</label>
              <textarea value={wedding.story || ""} onChange={(e) => setWedding({ ...wedding, story: e.target.value })} rows={4} className={`${inputClass} py-3 resize-none`} />
              <div className="mt-3">
                <AIStoryGenerator coupleNames={wedding.couple_names} onGenerated={(story) => setWedding({ ...wedding, story })} />
              </div>
            </div>
            <div>
              <label className="wedding-label block mb-2">Cover image</label>
              {wedding.cover_image && <img src={wedding.cover_image} alt="Cover" className="mb-3 h-48 w-full max-w-md rounded-2xl object-cover" />}
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-body text-xs font-semibold transition-colors hover:bg-black hover:text-white">
                <Upload className="w-4 h-4" /> Upload Cover
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover")} className="hidden" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-black/[0.035] p-4">
              <div className="flex items-center gap-4">
                <label className="wedding-label">Published</label>
                <button onClick={togglePublished} disabled={saving} className={`w-12 h-6 rounded-full transition-colors ${wedding.published ? "bg-[#b7d84b]" : "bg-muted"} relative`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${wedding.published ? "left-7" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="wedding-label">Live mode</label>
                <button onClick={() => setWedding({ ...wedding, live_mode: !wedding.live_mode })} className={`w-12 h-6 rounded-full transition-colors ${wedding.live_mode ? "bg-destructive" : "bg-muted"} relative`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${wedding.live_mode ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* THEME */}
        {activeTab === "theme" && (
          <div className="space-y-6 rounded-lg border border-black/5 bg-white p-5 sm:p-7">
            <AIThemeGenerator
              coupleNames={wedding.couple_names}
              currentStyle={wedding.wedding_style}
              onStyleChange={(style) => setWedding({ ...wedding, wedding_style: style })}
              onThemeGenerated={(theme) => setWedding({ ...wedding, theme: { ...theme } })}
            />
          </div>
        )}

        {/* INVITE */}
        {activeTab === "invite" && (
          <div className="space-y-6">
            <AIInvitationGenerator
              coupleNames={wedding.couple_names}
              weddingDate={wedding.wedding_date || ""}
              venue={wedding.ceremony_venue || ""}
              weddingLink={weddingUrl}
              theme={wedding.theme}
            />
          </div>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <AITimelineGenerator
              ceremonyTime={wedding.ceremony_time || ""}
              receptionTime={wedding.reception_time || ""}
              venue={wedding.ceremony_venue || ""}
              onGenerated={async (aiEvents) => {
                for (const ev of aiEvents) {
                  await supabase.from("events").insert({ title: ev.title, event_time: ev.time, description: ev.description || "", wedding_id: id, sort_order: events.length, location: wedding.ceremony_venue || "" });
                }
                toast.success(`Added ${aiEvents.length} events!`);
                fetchAll();
              }}
            />
            <form onSubmit={addEvent} className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold">Add event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" className={inputClass} />
                <input value={newEvent.event_time} onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })} placeholder="Time (e.g. 2:00 PM)" className={inputClass} />
                <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location" className={inputClass} />
                <input value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Description" className={inputClass} />
              </div>
              <button type="submit" className={btnClass}>Add event</button>
            </form>
            {events.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-8 text-center">
                <p className="font-body text-sm text-muted-foreground">No events yet. Add your first event above.</p>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4">
                  <div><p className="font-body text-lg font-semibold">{ev.title}</p><p className="font-body text-xs text-muted-foreground">{ev.event_time} — {ev.location}</p></div>
                  <button onClick={() => removeEvent(ev.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* GUESTS */}
        {activeTab === "guests" && (
          <div className="space-y-6">
            <form onSubmit={addGuest} className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold">Add guest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} placeholder="Guest name" className={inputClass} />
                <input value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="Email" className={inputClass} />
                <input value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} placeholder="Phone" className={inputClass} />
                <input type="number" min={1} max={10} value={newGuest.invited_guests} onChange={(e) => setNewGuest({ ...newGuest, invited_guests: parseInt(e.target.value) || 1 })} className={inputClass} />
              </div>
              <button type="submit" className={btnClass}>Add guest</button>
            </form>
            {guests.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-8 text-center">
                <Users className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">Your guest list is empty. Add guests above.</p>
              </div>
            ) : (
              guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4">
                  <div><p className="font-body text-lg font-semibold">{g.name}</p><p className="font-body text-xs text-muted-foreground">{g.email} {g.phone && `• ${g.phone}`} • {g.invited_guests} guest(s)</p></div>
                  <button onClick={() => removeGuest(g.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* RSVPS */}
        {activeTab === "rsvps" && (
          <div className="space-y-6">
            {rsvps.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No RSVPs received yet.</p>
                <p className="font-body text-xs text-muted-foreground/70 mt-1">Share your wedding link to start collecting responses.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    {[{ label: "Total RSVPs", value: rsvps.length }, { label: "Confirmed", value: rsvpConfirmed }, { label: "Declined", value: rsvpDeclined }, { label: "Pending", value: rsvpPending }].map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-border bg-white p-4 text-center"><p className="font-body text-3xl font-semibold">{stat.value}</p><p className="wedding-label mt-1">{stat.label}</p></div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 rounded-2xl border border-border bg-white p-4 text-center"><p className="font-body text-2xl font-semibold">{totalGuests}</p><p className="wedding-label mt-1">Total confirmed guests</p></div>
                  <button onClick={exportRSVPsCSV} className="ml-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold transition-colors hover:bg-black hover:text-white">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white px-4">
                  <table className="w-full">
                    <thead><tr className="border-b border-border"><th className="text-left py-3 wedding-label">Name</th><th className="text-left py-3 wedding-label">Status</th><th className="text-left py-3 wedding-label">Guests</th><th className="text-left py-3 wedding-label hidden sm:table-cell">Dietary</th><th className="text-left py-3 wedding-label hidden sm:table-cell">Message</th></tr></thead>
                    <tbody>
                      {rsvps.map((r) => (
                        <tr key={r.id} className="border-b border-border/50">
                          <td className="py-3 font-body text-sm">{r.guest_name}</td>
                          <td className="py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${r.attending === true ? "bg-[#e6f2d4] text-[#486b1b]" : r.attending === false ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.attending === true ? "Confirmed" : r.attending === false ? "Declined" : "Pending"}</span></td>
                          <td className="py-3 font-body text-sm">{r.guest_count}</td>
                          <td className="py-3 font-body text-xs text-muted-foreground hidden sm:table-cell">{r.dietary_preference || "—"}{r.dietary_note ? ` (${r.dietary_note})` : ""}</td>
                          <td className="py-3 font-body text-xs text-muted-foreground max-w-xs truncate hidden sm:table-cell">{r.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* GALLERY */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-semibold text-background">
              <Upload className="w-4 h-4" /> Upload Photos
              <input type="file" accept="image/*" multiple onChange={async (e) => {
                const files = e.target.files; if (!files) return;
                let uploaded = 0;
                for (const file of Array.from(files)) {
                  const ext = file.name.split(".").pop();
                  const path = `${id}/gallery/${crypto.randomUUID()}.${ext}`;
                  const { error: uploadError } = await supabase.storage.from("wedding-assets").upload(path, file);
                  if (uploadError) { toast.error(`${file.name}: ${uploadError.message}`); continue; }
                  const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
                  const { error: saveError } = await supabase.from("gallery").insert({ image_url: publicUrl, wedding_id: id, uploaded_by: "admin" });
                  if (saveError) { toast.error(`${file.name}: image uploaded but gallery was not updated: ${saveError.message}`); continue; }
                  uploaded += 1;
                }
                if (uploaded > 0) { toast.success(`${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded.`); fetchAll(); }
                e.target.value = "";
              }} className="hidden" />
            </label>
            {galleryImages.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-12 text-center">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square overflow-hidden rounded-2xl">
                    <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                    <button onClick={() => removeGalleryImage(img.id)} className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UPDATES */}
        {activeTab === "updates" && (
          <div className="space-y-6">
            <form onSubmit={addUpdate} className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold">Post update</h3>
              <textarea required value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} placeholder="e.g. Ceremony moved to 4PM" rows={3} className={`${inputClass} resize-none`} />
              <button type="submit" className={btnClass}>Post update</button>
            </form>
            {updates.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-8 text-center">
                <p className="font-body text-sm text-muted-foreground">No updates posted yet.</p>
              </div>
            ) : (
              updates.map((u) => (
                <div key={u.id} className="flex items-start justify-between rounded-2xl border border-black/5 bg-white p-4">
                  <div><p className="font-body text-sm">{u.message}</p><p className="wedding-label mt-2">{new Date(u.created_at).toLocaleDateString()}</p></div>
                  <button onClick={() => removeUpdate(u.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* LIVE MODE */}
        {activeTab === "live" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4">
              <div>
                <p className="text-sm font-semibold">Live wedding mode</p>
                <p className="font-body text-xs text-muted-foreground">Send real-time updates to guests during the wedding</p>
              </div>
              <button onClick={() => { setWedding({ ...wedding, live_mode: !wedding.live_mode }); }} className={`w-12 h-6 rounded-full transition-colors ${wedding.live_mode ? "bg-destructive" : "bg-muted"} relative`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${wedding.live_mode ? "left-7" : "left-1"}`} />
              </button>
            </div>

            <form onSubmit={addLiveUpdate} className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold">Send live update</h3>
              <textarea required value={newLiveUpdate.message} onChange={(e) => setNewLiveUpdate({ ...newLiveUpdate, message: e.target.value })} placeholder="e.g. Ceremony starting now!" rows={2} className={`${inputClass} resize-none`} />
              <div className="flex flex-wrap gap-2">
                {LIVE_UPDATE_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setNewLiveUpdate({ ...newLiveUpdate, update_type: t })} className={`min-h-10 rounded-full border px-4 py-1 text-xs font-semibold capitalize ${newLiveUpdate.update_type === t ? "border-black bg-black text-white" : "border-black/15 bg-white text-black/60"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <button type="submit" className={btnClass}>
                <Radio className="w-4 h-4 inline mr-2" /> Send update
              </button>
            </form>

            {liveUpdates.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-8 text-center">
                <Radio className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No live updates yet. Post your first update!</p>
              </div>
            ) : (
              liveUpdates.map((u) => (
                <div key={u.id} className="flex items-start justify-between rounded-2xl border border-black/5 bg-white p-4">
                  <div>
                    <span className="mr-2 rounded-full bg-muted px-2 py-1 text-xs font-semibold capitalize">{u.update_type}</span>
                    <p className="font-body text-sm mt-2">{u.message}</p>
                    <p className="wedding-label mt-2">{new Date(u.created_at).toLocaleTimeString()}</p>
                  </div>
                  <button onClick={() => removeLiveUpdate(u.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* GUEST PHOTOS */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            {pendingPhotos.length > 0 && (
              <>
                <h3 className="text-base font-semibold">Pending approval ({pendingPhotos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pendingPhotos.map((p) => (
                    <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl border border-black/10">
                      <img src={p.image_url} alt="Guest upload" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 flex">
                        <button onClick={() => approvePhoto(p.id)} aria-label="Approve photo" className="flex min-h-11 flex-1 items-center justify-center bg-[#d9f06e] text-black"><Check className="h-4 w-4" /></button>
                        <button onClick={() => rejectPhoto(p.id)} aria-label="Reject photo" className="flex min-h-11 flex-1 items-center justify-center bg-destructive text-white"><X className="h-4 w-4" /></button>
                      </div>
                      {p.guest_name && <p className="absolute top-2 left-2 font-body text-[10px] bg-background/80 px-2 py-0.5">{p.guest_name}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 className="text-base font-semibold">Approved ({approvedPhotos.length})</h3>
            {approvedPhotos.length === 0 && pendingPhotos.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-8 text-center">
                <p className="font-body text-sm text-muted-foreground">No guest photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {approvedPhotos.map((p) => (
                  <div key={p.id} className="relative group aspect-square overflow-hidden rounded-2xl">
                    <img src={p.image_url} alt="Approved" className="w-full h-full object-cover" />
                    <button onClick={() => rejectPhoto(p.id)} className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WEDDING MOMENTS (read-only) */}
        {activeTab === "moments" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-4 h-4 text-[#ff6245]" />
              <h3 className="text-base font-semibold">Guest moments ({weddingMoments.length})</h3>
            </div>
            {weddingMoments.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white py-12 text-center">
                <Camera className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No moments shared yet.</p>
                <p className="font-body text-xs text-muted-foreground/70 mt-1">Guests can share moments from the live wedding page.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weddingMoments.map((m) => (
                  <div key={m.id} className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-4">
                    {m.photo_url && <img src={m.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body text-sm font-medium">{m.guest_name}</p>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${m.approved ? "bg-[#e6f2d4] text-[#486b1b]" : "bg-amber-100 text-amber-700"}`}>
                          {m.approved ? "Approved" : "Pending"}
                        </span>
                        {m.highlighted && <span className="rounded-full bg-[#ffe4dc] px-2 py-1 text-xs font-semibold text-[#df563a]">Highlighted</span>}
                      </div>
                      {m.message && <p className="font-body text-xs text-muted-foreground mt-1">{m.message}</p>}
                      <p className="font-body text-[10px] text-muted-foreground/60 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOMMODATIONS */}
        {activeTab === "accommodations" && (
          <div className="space-y-6">
            <form onSubmit={addAccommodation} className="space-y-4 rounded-lg border border-black/5 bg-white p-5 sm:p-7">
              <div><h3 className="text-base font-semibold">Stay & travel</h3><p className="mt-1 text-xs text-black/55">Places and travel details to share with guests.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newAccommodation.title} onChange={(e) => setNewAccommodation({ ...newAccommodation, title: e.target.value })} placeholder="Block title (e.g. Recommended Hotels)" className={inputClass} />
                <select value={newAccommodation.category} onChange={(e) => setNewAccommodation({ ...newAccommodation, category: e.target.value })} className={inputClass}>
                  {ACCOMMODATION_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="wedding-label block mb-2">Items (one per line: Name | Detail | Link)</label>
                <textarea value={newAccommodation.items} onChange={(e) => setNewAccommodation({ ...newAccommodation, items: e.target.value })} placeholder={"Hotel Caruso | 5 min from venue | https://...\nPalazzo Avino | 10 min from venue"} rows={4} className={`${inputClass} resize-none`} />
              </div>
              <button type="submit" className={btnClass}>Add stay or travel</button>
            </form>
            {accommodations.length === 0 ? (
              <div className="rounded-lg border border-black/5 bg-white py-8 text-center">
                <Hotel className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No accommodations added yet.</p>
              </div>
            ) : (
              accommodations.map((acc) => {
                const Icon = getCategoryIcon(acc.category);
                return (
                  <div key={acc.id} className="flex items-start justify-between rounded-lg border border-black/5 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-1 h-5 w-5 text-[#ff6245]" strokeWidth={1.5} />
                      <div>
                        <p className="text-sm font-semibold">{acc.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{acc.category} • {acc.items.length} items</p>
                      </div>
                    </div>
                    <button onClick={() => removeAccommodation(acc.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* QR CODE */}
        {activeTab === "qr" && (
          <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-6 text-center">
            <h2 className="font-body text-2xl font-semibold">QR code</h2>
            <p className="font-body text-sm text-muted-foreground">Scan to open the wedding page</p>
            <div className="inline-block rounded-2xl border border-black/10 bg-white p-6">
              <QRCodeSVG id="wedding-qr" value={weddingUrl} size={256} level="H" />
            </div>
            <p className="font-body text-xs text-muted-foreground break-all">{weddingUrl}</p>
            <button onClick={downloadQR} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-6 py-3 text-xs font-semibold text-white">
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWeddingEditor;
