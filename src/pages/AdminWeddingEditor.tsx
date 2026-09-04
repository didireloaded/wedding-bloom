import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, Trash2, ExternalLink, Download, Upload, Plus, Radio, Check, X, Users, RefreshCw, Hotel, Car, ParkingCircle, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AIStoryGenerator from "@/components/admin/AIStoryGenerator";
import AITimelineGenerator from "@/components/admin/AITimelineGenerator";
import AIThemeGenerator from "@/components/admin/AIThemeGenerator";
import AIInvitationGenerator from "@/components/admin/AIInvitationGenerator";
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
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [wedding, setWedding] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [weddingMoments, setWeddingMoments] = useState<any[]>([]);

  const [newUpdate, setNewUpdate] = useState("");
  const [newEvent, setNewEvent] = useState({ title: "", event_time: "", location: "", description: "" });
  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "", invited_guests: 1 });
  const [newLiveUpdate, setNewLiveUpdate] = useState({ message: "", update_type: "info" });
  const [newAccommodation, setNewAccommodation] = useState({ title: "", category: "hotels", items: "" });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false, title: "", description: "", onConfirm: () => {}
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (id && user && isAdmin) fetchAll();
  }, [id, user, isAdmin]);

  const fetchAll = async () => {
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
    if (wRes.data) setWedding(wRes.data);
    if (eRes.data) setEvents(eRes.data);
    if (rRes.data) setRsvps(rRes.data);
    if (uRes.data) setUpdates(uRes.data);
    if (glRes.data) setGalleryImages(glRes.data);
    if (gRes.data) setGuests(gRes.data);
    if (luRes.data) setLiveUpdates(luRes.data);
    if (gpRes.data) setGuestPhotos(gpRes.data);
    if (accRes.data) setAccommodations(accRes.data);
    if (momRes.data) setWeddingMoments(momRes.data);
    setLoading(false);
  };

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
      max_guests: wedding.max_guests ? parseInt(wedding.max_guests) : null,
    } as any).eq("id", id!);
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
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-wedding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ wedding_id: id }),
    });
    if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to delete"); return; }
    toast.success("Wedding and all files deleted.");
    navigate("/admin");
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
    const csv = [headers.join(","), ...rows.map((r) => r.map((c: any) => `"${c}"`).join(","))].join("\n");
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
    const path = `${id}/${type}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("wedding-assets").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path);
    if (type === "cover") {
      await supabase.from("weddings").update({ cover_image: publicUrl }).eq("id", id!);
      setWedding({ ...wedding, cover_image: publicUrl });
      toast.success("Cover image uploaded!");
    } else {
      await supabase.from("gallery").insert({ image_url: publicUrl, wedding_id: id, uploaded_by: "admin" });
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

  const regenerateAccessCode = async () => {
    confirmAction("Regenerate Access Code", "This will invalidate the current code. The couple will need to log in again with the new code.", async () => {
      const { data, error } = await supabase.rpc("regenerate_access_code", { wedding_id: id });
      if (error) { toast.error(error.message); return; }
      setWedding({ ...wedding, access_code: data });
      toast.success("Access code regenerated!");
    });
  };

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
  if (!wedding) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Wedding not found</p></div>;

  const weddingUrl = `${window.location.origin}/wedding/${wedding.slug}`;
  const tabs = ["details", "theme", "invite", "events", "guests", "rsvps", "gallery", "updates", "live", "photos", "moments", "accommodations", "qr"];

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
    <div className="admin-app min-h-screen bg-[#f1f1f1]">
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
            {wedding.published ? "LIVE" : "DRAFT"}
          </span>
          {wedding.live_mode && <span className="hidden items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 font-body text-[10px] font-semibold text-destructive sm:flex"><Radio className="w-3 h-3 animate-pulse" /> Live mode</span>}
        </div>
        <div className="flex items-center gap-2">
          <a href={weddingUrl} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-foreground" title="Preview wedding"><Eye className="w-5 h-5" /></a>
          <button onClick={togglePublished} disabled={saving} className={`hidden min-h-10 rounded-full px-4 font-body text-xs font-semibold sm:inline-flex sm:items-center ${wedding.published ? "border border-black/10 bg-white text-black" : "bg-[#d9f06e] text-black"}`}>{wedding.published ? "Make private" : "Publish"}</button>
          <button onClick={deleteWedding} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-destructive" title="Delete wedding"><Trash2 className="w-5 h-5" /></button>
          <button onClick={saveWedding} disabled={saving} className="flex min-h-10 items-center gap-2 rounded-full bg-foreground px-4 font-body text-xs font-semibold text-background">
            <Save className="w-4 h-4" /> {saving ? "Saving" : "Save"}
          </button>
        </div>
      </nav>

      <div className="sticky top-[65px] z-20 overflow-x-auto border-b border-black/5 bg-[#f1f1f1]/95 py-2 backdrop-blur-xl">
        <div className="flex gap-1 px-4 sm:px-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs font-semibold transition-colors ${activeTab === t ? "bg-[#202020] text-white" : "text-muted-foreground hover:bg-white hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-6 rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-sm sm:p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "COUPLE NAMES", key: "couple_names" },
                { label: "URL SLUG", key: "slug" },
                { label: "DRESS CODE", key: "dress_code" },
                { label: "CEREMONY VENUE", key: "ceremony_venue" },
                { label: "CEREMONY TIME", key: "ceremony_time" },
                { label: "RECEPTION VENUE", key: "reception_venue" },
                { label: "RECEPTION TIME", key: "reception_time" },
                { label: "WHATSAPP GROUP LINK", key: "whatsapp_group_url" },
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
                <label className="wedding-label block mb-2">WEDDING DATE</label>
                <input type="date" value={wedding.wedding_date || ""} onChange={(e) => setWedding({ ...wedding, wedding_date: e.target.value })} className={`${inputClass} py-3`} />
              </div>
              <div>
                <label className="wedding-label block mb-2">RSVP DEADLINE</label>
                <input type="date" value={wedding.rsvp_deadline || ""} onChange={(e) => setWedding({ ...wedding, rsvp_deadline: e.target.value })} className={`${inputClass} py-3`} />
              </div>
              <div>
                <label className="wedding-label block mb-2">MAX GUESTS (CAPACITY)</label>
                <input type="number" min="1" value={wedding.max_guests || ""} onChange={(e) => setWedding({ ...wedding, max_guests: e.target.value })} placeholder="Leave empty for unlimited" className={`${inputClass} py-3`} />
                <p className="font-body text-[10px] text-muted-foreground mt-1">Set a venue capacity limit. RSVP form will stop accepting once this is reached.</p>
              </div>
            </div>
            <div>
              <label className="wedding-label block mb-2">WEDDING STORY</label>
              <textarea value={wedding.story || ""} onChange={(e) => setWedding({ ...wedding, story: e.target.value })} rows={4} className={`${inputClass} py-3 resize-none`} />
              <div className="mt-3">
                <AIStoryGenerator coupleNames={wedding.couple_names} onGenerated={(story) => setWedding({ ...wedding, story })} />
              </div>
            </div>
            <div>
              <label className="wedding-label block mb-2">COVER IMAGE</label>
              {wedding.cover_image && <img src={wedding.cover_image} alt="Cover" className="mb-3 h-48 w-full max-w-md rounded-2xl object-cover" />}
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-body text-xs font-semibold transition-colors hover:bg-black hover:text-white">
                <Upload className="w-4 h-4" /> Upload Cover
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover")} className="hidden" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-black/[0.035] p-4">
              <div className="flex items-center gap-4">
                <label className="wedding-label">PUBLISHED</label>
                <button onClick={togglePublished} disabled={saving} className={`w-12 h-6 rounded-full transition-colors ${wedding.published ? "bg-[#b7d84b]" : "bg-muted"} relative`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${wedding.published ? "left-7" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="wedding-label">LIVE MODE</label>
                <button onClick={() => setWedding({ ...wedding, live_mode: !wedding.live_mode })} className={`w-12 h-6 rounded-full transition-colors ${wedding.live_mode ? "bg-destructive" : "bg-muted"} relative`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${wedding.live_mode ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="wedding-label">COUPLE ACCESS CODE</p>
                <button onClick={regenerateAccessCode} className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 font-body text-[10px] font-semibold transition-colors hover:bg-black hover:text-white">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
              <p className="font-body text-lg tracking-widest">{wedding.access_code}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Share this code with the couple so they can log in at /couple-login</p>
            </div>
          </div>
        )}

        {/* THEME */}
        {activeTab === "theme" && (
          <div className="space-y-6">
            <AIThemeGenerator
              coupleNames={wedding.couple_names}
              currentStyle={wedding.wedding_style}
              onStyleChange={(style) => setWedding({ ...wedding, wedding_style: style })}
              onThemeGenerated={(theme) => setWedding({ ...wedding, theme })}
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
            <form onSubmit={addEvent} className="p-6 border border-border space-y-4">
              <h3 className="wedding-label">ADD EVENT</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" className={inputClass} />
                <input value={newEvent.event_time} onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })} placeholder="Time (e.g. 2:00 PM)" className={inputClass} />
                <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location" className={inputClass} />
                <input value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Description" className={inputClass} />
              </div>
              <button type="submit" className={btnClass}>ADD</button>
            </form>
            {events.length === 0 ? (
              <div className="py-8 text-center border border-border">
                <p className="font-body text-sm text-muted-foreground">No events yet. Add your first event above.</p>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-4 border border-border">
                  <div><p className="font-display text-lg font-light">{ev.title}</p><p className="font-body text-xs text-muted-foreground">{ev.event_time} — {ev.location}</p></div>
                  <button onClick={() => removeEvent(ev.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* GUESTS */}
        {activeTab === "guests" && (
          <div className="space-y-6">
            <form onSubmit={addGuest} className="p-6 border border-border space-y-4">
              <h3 className="wedding-label">ADD GUEST</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} placeholder="Guest name" className={inputClass} />
                <input value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="Email" className={inputClass} />
                <input value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} placeholder="Phone" className={inputClass} />
                <input type="number" min={1} max={10} value={newGuest.invited_guests} onChange={(e) => setNewGuest({ ...newGuest, invited_guests: parseInt(e.target.value) || 1 })} className={inputClass} />
              </div>
              <button type="submit" className={btnClass}>ADD GUEST</button>
            </form>
            {guests.length === 0 ? (
              <div className="py-8 text-center border border-border">
                <Users className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">Your guest list is empty. Add guests above.</p>
              </div>
            ) : (
              guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-4 border border-border">
                  <div><p className="font-display text-lg font-light">{g.name}</p><p className="font-body text-xs text-muted-foreground">{g.email} {g.phone && `• ${g.phone}`} • {g.invited_guests} guest(s)</p></div>
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
              <div className="py-12 text-center border border-border">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No RSVPs received yet.</p>
                <p className="font-body text-xs text-muted-foreground/70 mt-1">Share your wedding link to start collecting responses.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    {[{ label: "TOTAL RSVPS", value: rsvps.length }, { label: "CONFIRMED", value: rsvpConfirmed }, { label: "DECLINED", value: rsvpDeclined }, { label: "PENDING", value: rsvpPending }].map((stat) => (
                      <div key={stat.label} className="p-4 border border-border text-center"><p className="font-display text-3xl font-light">{stat.value}</p><p className="wedding-label mt-1">{stat.label}</p></div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-4 border border-border text-center flex-1"><p className="font-display text-2xl font-light">{totalGuests}</p><p className="wedding-label mt-1">TOTAL CONFIRMED GUESTS</p></div>
                  <button onClick={exportRSVPsCSV} className="ml-4 inline-flex items-center gap-2 px-4 py-2 border border-foreground/20 font-body text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors min-h-[44px]">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-border"><th className="text-left py-3 wedding-label">NAME</th><th className="text-left py-3 wedding-label">STATUS</th><th className="text-left py-3 wedding-label">GUESTS</th><th className="text-left py-3 wedding-label hidden sm:table-cell">DIETARY</th><th className="text-left py-3 wedding-label hidden sm:table-cell">MESSAGE</th></tr></thead>
                    <tbody>
                      {rsvps.map((r) => (
                        <tr key={r.id} className="border-b border-border/50">
                          <td className="py-3 font-body text-sm">{r.guest_name}</td>
                          <td className="py-3"><span className={`font-body text-[10px] tracking-widest uppercase px-2 py-1 ${r.attending === true ? "bg-wedding-sage/30" : r.attending === false ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.attending === true ? "YES" : r.attending === false ? "NO" : "PENDING"}</span></td>
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
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background cursor-pointer font-body text-xs tracking-[0.2em] uppercase">
              <Upload className="w-4 h-4" /> Upload Photos
              <input type="file" accept="image/*" multiple onChange={async (e) => {
                const files = e.target.files; if (!files) return;
                for (const file of Array.from(files)) {
                  const ext = file.name.split(".").pop();
                  const path = `${id}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                  const { error } = await supabase.storage.from("wedding-assets").upload(path, file);
                  if (!error) { const { data: { publicUrl } } = supabase.storage.from("wedding-assets").getPublicUrl(path); await supabase.from("gallery").insert({ image_url: publicUrl, wedding_id: id, uploaded_by: "admin" }); }
                }
                toast.success("Photos uploaded!"); fetchAll();
              }} className="hidden" />
            </label>
            {galleryImages.length === 0 ? (
              <div className="py-12 text-center border border-border">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square overflow-hidden">
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
            <form onSubmit={addUpdate} className="p-6 border border-border space-y-4">
              <h3 className="wedding-label">POST UPDATE</h3>
              <textarea required value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} placeholder="e.g. Ceremony moved to 4PM" rows={3} className={`${inputClass} resize-none`} />
              <button type="submit" className={btnClass}>POST</button>
            </form>
            {updates.length === 0 ? (
              <div className="py-8 text-center border border-border">
                <p className="font-body text-sm text-muted-foreground">No updates posted yet.</p>
              </div>
            ) : (
              updates.map((u) => (
                <div key={u.id} className="flex items-start justify-between p-4 border border-border">
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
            <div className="p-4 border border-border flex items-center justify-between">
              <div>
                <p className="wedding-label mb-1">LIVE WEDDING MODE</p>
                <p className="font-body text-xs text-muted-foreground">Send real-time updates to guests during the wedding</p>
              </div>
              <button onClick={() => { setWedding({ ...wedding, live_mode: !wedding.live_mode }); }} className={`w-12 h-6 rounded-full transition-colors ${wedding.live_mode ? "bg-destructive" : "bg-muted"} relative`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${wedding.live_mode ? "left-7" : "left-1"}`} />
              </button>
            </div>

            <form onSubmit={addLiveUpdate} className="p-6 border border-border space-y-4">
              <h3 className="wedding-label">SEND LIVE UPDATE</h3>
              <textarea required value={newLiveUpdate.message} onChange={(e) => setNewLiveUpdate({ ...newLiveUpdate, message: e.target.value })} placeholder="e.g. Ceremony starting now!" rows={2} className={`${inputClass} resize-none`} />
              <div className="flex flex-wrap gap-2">
                {LIVE_UPDATE_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setNewLiveUpdate({ ...newLiveUpdate, update_type: t })} className={`px-3 py-1 font-body text-[10px] tracking-widest uppercase border ${newLiveUpdate.update_type === t ? "bg-foreground text-background" : "border-foreground/20 text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <button type="submit" className={btnClass}>
                <Radio className="w-4 h-4 inline mr-2" /> SEND
              </button>
            </form>

            {liveUpdates.length === 0 ? (
              <div className="py-8 text-center border border-border">
                <Radio className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No live updates yet. Post your first update!</p>
              </div>
            ) : (
              liveUpdates.map((u) => (
                <div key={u.id} className="flex items-start justify-between p-4 border border-border">
                  <div>
                    <span className="font-body text-[10px] tracking-widest uppercase px-2 py-0.5 bg-muted mr-2">{u.update_type}</span>
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
                <h3 className="wedding-label">PENDING APPROVAL ({pendingPhotos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pendingPhotos.map((p) => (
                    <div key={p.id} className="relative aspect-square overflow-hidden border-2 border-wedding-gold/30">
                      <img src={p.image_url} alt="Guest upload" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 flex">
                        <button onClick={() => approvePhoto(p.id)} className="flex-1 py-2 bg-wedding-sage text-foreground font-body text-[10px] tracking-widest uppercase flex items-center justify-center gap-1"><Check className="w-3 h-3" /></button>
                        <button onClick={() => rejectPhoto(p.id)} className="flex-1 py-2 bg-destructive text-destructive-foreground font-body text-[10px] tracking-widest uppercase flex items-center justify-center gap-1"><X className="w-3 h-3" /></button>
                      </div>
                      {p.guest_name && <p className="absolute top-2 left-2 font-body text-[10px] bg-background/80 px-2 py-0.5">{p.guest_name}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 className="wedding-label">APPROVED ({approvedPhotos.length})</h3>
            {approvedPhotos.length === 0 && pendingPhotos.length === 0 ? (
              <div className="py-8 text-center border border-border">
                <p className="font-body text-sm text-muted-foreground">No guest photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {approvedPhotos.map((p) => (
                  <div key={p.id} className="relative group aspect-square overflow-hidden">
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
              <Sparkles className="w-4 h-4 text-wedding-gold" />
              <h3 className="wedding-label">GUEST MOMENTS ({weddingMoments.length})</h3>
            </div>
            {weddingMoments.length === 0 ? (
              <div className="py-12 text-center border border-border">
                <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No moments shared yet.</p>
                <p className="font-body text-xs text-muted-foreground/70 mt-1">Guests can share moments from the live wedding page.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weddingMoments.map((m) => (
                  <div key={m.id} className="flex items-start gap-4 p-4 border border-border">
                    {m.photo_url && <img src={m.photo_url} alt="" className="w-16 h-16 object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body text-sm font-medium">{m.guest_name}</p>
                        <span className={`font-body text-[9px] tracking-widest uppercase px-1.5 py-0.5 ${m.approved ? "bg-wedding-sage/30" : "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"}`}>
                          {m.approved ? "APPROVED" : "PENDING"}
                        </span>
                        {m.highlighted && <span className="font-body text-[9px] tracking-widest uppercase px-1.5 py-0.5 bg-wedding-gold/20 text-wedding-gold">HIGHLIGHTED</span>}
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
            <form onSubmit={addAccommodation} className="p-6 border border-border space-y-4">
              <h3 className="wedding-label">ADD ACCOMMODATION BLOCK</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newAccommodation.title} onChange={(e) => setNewAccommodation({ ...newAccommodation, title: e.target.value })} placeholder="Block title (e.g. Recommended Hotels)" className={inputClass} />
                <select value={newAccommodation.category} onChange={(e) => setNewAccommodation({ ...newAccommodation, category: e.target.value })} className={inputClass}>
                  {ACCOMMODATION_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="wedding-label block mb-2">ITEMS (one per line: Name | Detail | Link)</label>
                <textarea value={newAccommodation.items} onChange={(e) => setNewAccommodation({ ...newAccommodation, items: e.target.value })} placeholder={"Hotel Caruso | 5 min from venue | https://...\nPalazzo Avino | 10 min from venue"} rows={4} className={`${inputClass} resize-none`} />
              </div>
              <button type="submit" className={btnClass}>ADD</button>
            </form>
            {accommodations.length === 0 ? (
              <div className="py-8 text-center border border-border">
                <Hotel className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
                <p className="font-body text-sm text-muted-foreground">No accommodations added yet.</p>
              </div>
            ) : (
              accommodations.map((acc) => {
                const Icon = getCategoryIcon(acc.category);
                return (
                  <div key={acc.id} className="flex items-start justify-between p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-wedding-gold mt-1" strokeWidth={1.5} />
                      <div>
                        <p className="font-display text-lg font-light">{acc.title}</p>
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
          <div className="text-center space-y-6">
            <h2 className="font-display text-2xl font-light">QR Code</h2>
            <p className="font-body text-sm text-muted-foreground">Scan to open the wedding page</p>
            <div className="inline-block p-6 bg-background border border-border">
              <QRCodeSVG id="wedding-qr" value={weddingUrl} size={256} level="H" />
            </div>
            <p className="font-body text-xs text-muted-foreground break-all">{weddingUrl}</p>
            <button onClick={downloadQR} className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase">
              <Download className="w-4 h-4" /> DOWNLOAD PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWeddingEditor;
