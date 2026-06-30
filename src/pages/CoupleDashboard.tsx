import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import {
  Flower2, Heart, Users, Camera, LogOut, ExternalLink,
  Copy, CheckCircle2, Calendar, MapPin, Edit3, Trash2, Plus,
  MessageCircle, Clock, UserCheck, Gift, Bell, Home, Image as ImageIcon,
  Settings, Sparkles, Radio, Menu, X
} from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PromptModal } from "@/components/ui/PromptModal";
import {
  CountdownWidget, HealthWidget, SummaryGrid, QuickActionsWidget,
  ActivityTimeline, InsightsWidget, NotificationCenter, WorkspaceSearch, unreadCount,
  CommandCenter
} from "@/features/couple/widgets";

export default function CoupleDashboard() {
  const navigate = useNavigate();
  const weddingId = sessionStorage.getItem("couple_wedding_id") || localStorage.getItem("couple_wedding_id");
  const slug = sessionStorage.getItem("couple_wedding_slug") || localStorage.getItem("couple_wedding_slug");

  const [wedding, setWedding] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  type TabId = "workspace" | "overview" | "rsvp" | "events" | "map" | "accommodations" | "gallery" | "guest_photos" | "moments" | "updates" | "share";
  const [tab, setTab] = useState<TabId>("workspace");
  const [editingWedding, setEditingWedding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", location: "", event_date: "", event_time: "" });
  const [showEventForm, setShowEventForm] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCap, setGalleryCap] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [hotelPromptOpen, setHotelPromptOpen] = useState(false);
  const [markerPromptOpen, setMarkerPromptOpen] = useState(false);
  const [markerCoords, setMarkerCoords] = useState<{ x: number; y: number } | null>(null);
  const [deleteMarker, setDeleteMarker] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!weddingId) { navigate("/admin/login"); return; }
    refresh();
    const off1 = store.subscribe("rsvps", refresh);
    const off2 = store.subscribe("guest_moments", refresh);
    const off3 = store.subscribe("checkins", refresh);
    const off4 = store.subscribe("gallery", refresh);
    const off5 = store.subscribe("events", refresh);
    const off6 = store.subscribe("guest_photos", refresh);
    const off7 = store.subscribe("accommodations", refresh);
    const off8 = store.subscribe("venue_markers", refresh);
    const off9 = store.subscribe("updates", refresh);
    return () => { off1(); off2(); off3(); off4(); off5(); off6(); off7(); off8(); off9(); };
  }, [weddingId]);

  const refresh = () => {
    if (!weddingId) return;
    const w = store.find("weddings", (r: any) => r.id === weddingId);
    setWedding(w);
    setRsvps(store.where("rsvps", (r: any) => r.wedding_id === weddingId));
    setGallery(store.where("gallery", (r: any) => r.wedding_id === weddingId));
    setGuestPhotos(store.where("guest_photos", (r: any) => r.wedding_id === weddingId));
    setMoments(store.where("guest_moments", (r: any) => r.wedding_id === weddingId));
    setAccommodations(store.where("accommodations", (r: any) => r.wedding_id === weddingId));
    setMarkers(store.where("venue_markers", (r: any) => r.wedding_id === weddingId));
    setUpdates(store.where("updates", (r: any) => r.wedding_id === weddingId));
    setCheckins(store.where("checkins", (r: any) => r.wedding_id === weddingId));
    setEvents(store.where("events", (r: any) => r.wedding_id === weddingId).sort((a: any, b: any) => a.sort_order - b.sort_order));
    // Refresh notification count
    const ww = store.find("weddings", (r: any) => r.id === weddingId);
    if (ww) {
      setUnread(unreadCount(
        ww,
        store.where("rsvps", (r: any) => r.wedding_id === weddingId),
        store.where("guest_moments", (r: any) => r.wedding_id === weddingId),
        store.where("guest_photos", (r: any) => r.wedding_id === weddingId)
      ));
    }
  };

  const logout = () => {
    sessionStorage.removeItem("couple_wedding_id");
    sessionStorage.removeItem("couple_wedding_slug");
    sessionStorage.removeItem("couple_access_code");
    localStorage.removeItem("couple_wedding_id");
    localStorage.removeItem("couple_wedding_slug");
    localStorage.removeItem("couple_access_code");
    navigate(slug ? `/couple/${slug}` : "/admin/login");
  };

  const copyLink = () => {
    const url = `${window.location.origin}/wedding/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const saveWeddingEdits = (patch: any) => {
    store.update("weddings", weddingId!, patch);
    toast.success("Wedding updated");
    setEditingWedding(false);
    refresh();
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) { toast.error("Title required"); return; }
    store.insert("events", {
      wedding_id: weddingId,
      title: newEvent.title,
      description: newEvent.description || null,
      location: newEvent.location || null,
      event_date: newEvent.event_date || wedding.wedding_date,
      event_time: newEvent.event_time || null,
      sort_order: events.length + 1,
    });
    setNewEvent({ title: "", description: "", location: "", event_date: "", event_time: "" });
    setShowEventForm(false);
    toast.success("Event added");
  };

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#c9a87a] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#8d7962] text-sm">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  const confirmed = rsvps.filter(r => r.attending === 'confirmed').length;
  const pending = rsvps.filter(r => r.attending === 'pending').length;
  const totalGuests = rsvps.filter(r => r.attending === 'confirmed').reduce((s, r) => s + (r.guest_count || 0), 0);
  const dietary = rsvps
    .filter(r => r.attending && r.dietary_preference && r.dietary_preference !== "No preference")
    .reduce((acc, r) => { acc[r.dietary_preference] = (acc[r.dietary_preference] || 0) + 1; return acc; }, {} as Record<string, number>);
  const weddingUrl = `${window.location.origin}/wedding/${slug}`;

  return (
    <div className="min-h-screen bg-[#faf8f5]">



      <header className="bg-white border-b border-[#e6d4be] sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-[64px] flex items-center gap-3 md:gap-5">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden w-9 h-9 rounded-[12px] border border-[#e6d4be] flex items-center justify-center text-[#5a4735]">
            {sidebarOpen ? <X size={16}/> : <Menu size={16}/>}
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[12px] bg-[#f2e8da] border border-[#e4cfb7] flex items-center justify-center flex-shrink-0">
              <Flower2 size={15} className="text-[#b7794a]"/>
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="text-[10.5px] tracking-[0.22em] uppercase text-[#b7834c] font-medium">Workspace</div>
              <div className="display text-[15px] text-[#2a231d] -mt-[1px] truncate">{wedding.couple_names}</div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <WorkspaceSearch wedding={wedding} onNavigate={(t: TabId) => setTab(t)} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setNotifsOpen(true)}
              className="relative w-9 h-9 rounded-[12px] border border-[#e6d4be] flex items-center justify-center text-[#5a4735] hover:bg-[#fbf3e8] transition"
              title="Notifications"
            >
              <Bell size={15} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-[#b0743c] text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1 border border-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <Link to={`/wedding/${slug}`} target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-[12px] px-3 py-[8px] rounded-[12px] border border-[#d6bc9c] text-[#704a28] hover:bg-[#fbf3e8]">
              <ExternalLink size={12}/> Preview
            </Link>
            <button onClick={logout} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-[8px] rounded-[12px] border border-[#d9c6ae] text-[#5a4735] hover:bg-[#fbf3e8]">
              <LogOut size={12}/><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <WorkspaceSearch wedding={wedding} onNavigate={(t: TabId) => setTab(t)} />
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        wedding={wedding}
        rsvps={rsvps}
        moments={moments}
        guestPhotos={guestPhotos}
        open={notifsOpen}
        onClose={() => { setNotifsOpen(false); refresh(); }}
        onNavigate={(t: TabId) => setTab(t)}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8 grid md:grid-cols-[240px_1fr] gap-6">
        {/* SIDEBAR NAV */}
        <aside className={`${sidebarOpen ? "block" : "hidden md:block"} md:sticky md:top-[88px] md:self-start`}>
          <div className="bg-white rounded-[20px] border border-[#e6d4be] p-3">
            {[
              {
                group: "Home",
                items: [
                  { id: "workspace", label: "Workspace", icon: <Home size={14}/> },
                ]
              },
              {
                group: "Wedding",
                items: [
                  { id: "overview", label: "Overview", icon: <Heart size={14}/> },
                  { id: "events", label: `Events`, count: events.length, icon: <Calendar size={14}/> },
                  { id: "updates", label: "Live Updates", icon: <Radio size={14}/> },
                ]
              },
              {
                group: "Guests",
                items: [
                  { id: "rsvp", label: "RSVPs", count: rsvps.length, icon: <UserCheck size={14}/> },
                  { id: "moments", label: "Moments", count: moments.length, icon: <MessageCircle size={14}/> },
                ]
              },
              {
                group: "Venue",
                items: [
                  { id: "map", label: "Venue Map", icon: <MapPin size={14}/> },
                  { id: "accommodations", label: "Hotels", icon: <Sparkles size={14}/> },
                ]
              },
              {
                group: "Media",
                items: [
                  { id: "gallery", label: "Gallery", count: gallery.length, icon: <ImageIcon size={14}/> },
                  { id: "guest_photos", label: "Guest Photos", count: guestPhotos.length, icon: <Camera size={14}/> },
                ]
              },
              {
                group: "Share",
                items: [
                  { id: "share", label: "Share & QR", icon: <ExternalLink size={14}/> },
                ]
              },
            ].map(group => (
              <div key={group.group} className="mb-2 last:mb-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#a98a6b] px-3 pt-2 pb-1.5 font-medium">{group.group}</div>
                <div>
                  {group.items.map((it: any) => (
                    <button
                      key={it.id}
                      onClick={() => { setTab(it.id as TabId); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-[13.5px] transition mb-0.5 font-medium ${
                        tab === it.id
                          ? "bg-[#2b2723] text-[#f9f2e8] shadow-md shadow-[#2b2723]/10"
                          : "text-[#5a4735] hover:bg-[#fbf3e8]"
                      }`}
                    >
                      <span className={tab === it.id ? "text-[#f9f2e8]" : "text-[#b0743c]"}>{it.icon}</span>
                      <span className="flex-1 text-left">{it.label}</span>
                      {it.count !== undefined && (
                        <span className={`text-[10.5px] px-1.5 rounded-md ${tab === it.id ? "bg-white/15 text-white/80" : "bg-[#f5efe7] text-[#a98a6b]"}`}>{it.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-[#e6d4be] mt-2 pt-2">
              <button
                onClick={() => setEditingWedding(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] text-[#5a4735] hover:bg-[#fbf3e8] transition"
              >
                <Settings size={14} className="text-[#b0743c]" /><span className="flex-1 text-left">Settings</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0">
        {/* WORKSPACE HOME — THE WEDDING COMMAND CENTER */}
        {tab === "workspace" && (
          <div className="space-y-6">
            <CommandCenter 
              wedding={wedding} 
              rsvps={rsvps} 
              moments={moments} 
              guestPhotos={guestPhotos} 
            />
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SummaryGrid
                  rsvps={rsvps}
                  moments={moments}
                  guestPhotos={guestPhotos}
                  wedding={wedding}
                  onNavigate={(t: TabId) => setTab(t)}
                />
                <QuickActionsWidget
                  wedding={wedding}
                  onNavigate={(t: TabId) => setTab(t)}
                  onCopyLink={copyLink}
                />
                <ActivityTimeline
                  rsvps={rsvps} moments={moments} guestPhotos={guestPhotos} updates={updates}
                />
              </div>
              <div className="space-y-6">
                <CountdownWidget wedding={wedding} />
                <HealthWidget wedding={wedding} gallery={gallery} events={events} accommodations={accommodations} />
                <InsightsWidget wedding={wedding} rsvps={rsvps} guestPhotos={guestPhotos} moments={moments} />
              </div>
            </div>
          </div>
        )}

        {/* Welcome (Edit Details Card) - only visible on workspace + when editing */}
        <div className={`bg-white rounded-[24px] border border-[#e6d4be] p-6 md:p-8 mb-6 ${tab === "workspace" ? "hidden" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="wedding-label mb-2">Welcome back</div>
              <h1 className="display text-[32px] md:text-[40px] text-[#24201c] leading-[1]">{wedding.couple_names}</h1>
              <div className="mt-2 text-[14px] text-[#6b5d4f] flex flex-wrap gap-4">
                {wedding.wedding_date && <span className="flex items-center gap-1.5"><Calendar size={14}/>{format(new Date(wedding.wedding_date), "d MMMM yyyy")}</span>}
                {wedding.ceremony_venue && <span className="flex items-center gap-1.5"><MapPin size={14}/>{wedding.ceremony_venue}</span>}
              </div>
            </div>
            <button onClick={() => setEditingWedding(!editingWedding)} className="inline-flex items-center gap-1.5 text-[13px] px-5 py-[11px] rounded-full bg-[#2b2723] text-[#f9f2e8] hover:bg-[#392f29]">
              <Edit3 size={13}/> Edit details
            </button>
          </div>

          {editingWedding && (
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); saveWeddingEdits(Object.fromEntries(fd)); }} className="mt-6 grid md:grid-cols-2 gap-4 pt-6 border-t border-[#e6d4be]">
              <div>
                <label className="wedding-label block mb-1.5">Couple names</label>
                <input name="couple_names" defaultValue={wedding.couple_names} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
              </div>
              <div>
                <label className="wedding-label block mb-1.5">Wedding date</label>
                <input name="wedding_date" type="date" defaultValue={wedding.wedding_date || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
              </div>
              <div>
                <label className="wedding-label block mb-1.5">Ceremony time</label>
                <input name="ceremony_time" type="time" defaultValue={wedding.ceremony_time || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
              </div>
              <div>
                <label className="wedding-label block mb-1.5">Venue</label>
                <input name="ceremony_venue" defaultValue={wedding.ceremony_venue || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
              </div>
              <div className="md:col-span-2">
                <label className="wedding-label block mb-1.5">Address</label>
                <input name="venue_address" defaultValue={wedding.venue_address || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
              </div>
              <div className="md:col-span-2">
                <label className="wedding-label block mb-1.5">Our story</label>
                <textarea name="story" rows={4} defaultValue={wedding.story || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b] resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="wedding-label block mb-1.5">Dress code</label>
                <input name="dress_code" defaultValue={wedding.dress_code || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
              </div>
              <div className="md:col-span-2">
                <label className="wedding-label block mb-1.5">Accommodation info</label>
                <textarea name="accommodation_info" rows={2} defaultValue={wedding.accommodation_info || ""} className="w-full rounded-[12px] border border-[#e0ccb2] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b] resize-none" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingWedding(false)} className="px-5 py-[11px] rounded-full border border-[#d9c6ae] text-[#5a4735]">Cancel</button>
                <button className="px-5 py-[11px] rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13.5px]">Save changes</button>
              </div>
            </form>
          )}
        </div>

        {/* Section title for non-workspace tabs */}
        {tab !== "workspace" && (
          <div className="mb-5 flex items-center gap-3">
            <div className="display text-[22px] text-[#2a231d] capitalize">
              {tab === "rsvp" ? "RSVPs" : tab === "guest_photos" ? "Guest Photos" : tab === "map" ? "Venue Map" : tab === "share" ? "Share & QR" : tab.replace("_", " ")}
            </div>
            <div className="text-[12.5px] text-[#a98a6b]">·</div>
            <button onClick={() => setTab("workspace")} className="text-[12.5px] text-[#b0743c] hover:text-[#8e5c2e] underline underline-offset-4">Back to Workspace</button>
          </div>
        )}

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <UserCheck size={18}/>, label: "Confirmed", value: confirmed, color: "text-[#4f7a56]", bg: "bg-[#eff6ee]" },
                { icon: <Clock size={18}/>, label: "Pending", value: pending, color: "text-[#b7794a]", bg: "bg-[#f8eee0]" },
                { icon: <Users size={18}/>, label: "Total guests", value: totalGuests, color: "text-[#6b5d4f]", bg: "bg-[#f5efe7]" },
                { icon: <MessageCircle size={18}/>, label: "Messages", value: moments.length, color: "text-[#b0743c]", bg: "bg-[#fdf3e4]" },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-[20px] border border-[#e6d4be] p-5">
                  <div className={`w-10 h-10 rounded-[12px] ${c.bg} flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#8d7962]">{c.label}</div>
                  <div className="display text-[32px] text-[#2a231d] leading-none mt-1">{c.value}</div>
                </div>
              ))}
            </div>

            {pending > 0 && (
              <div className="bg-[#fdf3e4] border border-[#e8d2b6] rounded-[18px] p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#b0743c] flex-shrink-0"><Clock size={16}/></div>
                <div className="text-[14px] text-[#5a4735]">
                  <strong>{pending} guest{pending === 1 ? "" : "s"}</strong> haven't responded yet.
                  Consider sending a gentle reminder.
                </div>
              </div>
            )}

            {Object.keys(dietary).length > 0 && (
              <div className="bg-white rounded-[20px] border border-[#e6d4be] p-6">
                <div className="wedding-label mb-3">Dietary summary</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dietary).map(([label, count]) => (
                    <span key={label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5efe7] text-[13px] text-[#5a4735] border border-[#e0ccb2]">
                      <span className="text-[#b7794a] font-medium">{count as number}</span>{label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-[20px] border border-[#e6d4be] p-6">
                <div className="wedding-label mb-3">Recent RSVPs</div>
                <div className="space-y-2">
                  {rsvps.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-[#f0e4d4] last:border-0">
                      <div>
                        <div className="text-[14.5px] text-[#2a231d]">{r.guest_name}</div>
                        <div className="text-[12px] text-[#8d7962]">{r.guest_count} guest{r.guest_count !== 1 ? "s" : ""}</div>
                      </div>
                      <div className={`text-[11.5px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${r.attending === 'confirmed' ? "bg-[#eff6ee] text-[#4f7a56]" : r.attending === 'declined' ? "bg-[#fde9e6] text-[#a64838]" : "bg-[#f8eee0] text-[#b0743c]"}`}>
                        {r.attending === 'confirmed' ? "Going" : r.attending === 'declined' ? "Declined" : "Pending"}
                      </div>
                    </div>
                  ))}
                  {rsvps.length === 0 && <div className="text-[13.5px] text-[#8d7962] py-4 text-center">No RSVPs yet</div>}
                </div>
              </div>
              <div className="bg-white rounded-[20px] border border-[#e6d4be] p-6">
                <div className="wedding-label mb-3">Latest messages</div>
                <div className="space-y-3">
                  {moments.slice(-5).reverse().map((m: any) => (
                    <div key={m.id} className="pb-3 border-b border-[#f0e4d4] last:border-0">
                      <div className="text-[14px] text-[#3d332a] leading-6">"{m.message}"</div>
                      <div className="text-[11.5px] text-[#a67a50] mt-1">— {m.guest_name}</div>
                    </div>
                  ))}
                  {moments.length === 0 && <div className="text-[13.5px] text-[#8d7962] py-4 text-center">No messages yet</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RSVPs */}
        {tab === "rsvp" && (
          <div className="bg-white rounded-[22px] border border-[#e6d4be] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead className="bg-[#f8eee0] text-left">
                  <tr>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8d7962]">Guest</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8d7962]">Status</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8d7962]">Count</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8d7962]">Dietary</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8d7962]">Song</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8d7962]">Submitted</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map(r => (
                    <tr key={r.id} className="border-t border-[#f0e4d4] hover:bg-[#fdf9f4]">
                      <td className="px-5 py-3">
                        <div className="text-[#2a231d]">{r.guest_name}</div>
                        {r.email && <div className="text-[11.5px] text-[#8d7962]">{r.email}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] tracking-[0.15em] uppercase px-2 py-1 rounded-full ${r.attending === 'confirmed' ? "bg-[#eff6ee] text-[#4f7a56]" : r.attending === 'declined' ? "bg-[#fde9e6] text-[#a64838]" : "bg-[#f8eee0] text-[#b0743c]"}`}>
                          {r.attending === 'confirmed' ? "Going" : r.attending === 'declined' ? "Declined" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#5a4f45]">{r.guest_count}</td>
                      <td className="px-5 py-3 text-[#5a4f45]">{r.dietary_preference || "—"}</td>
                      <td className="px-5 py-3 text-[#5a4f45] max-w-[200px] truncate">{r.song_request || "—"}</td>
                      <td className="px-5 py-3 text-[12px] text-[#8d7962]">{format(new Date(r.submitted_at), "d MMM")}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => { store.remove("rsvps", r.id); refresh(); toast.success("Removed"); }} className="text-[#a64838] hover:text-[#7e3124]">
                          <Trash2 size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rsvps.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10 text-[#8d7962]">No RSVPs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events */}
        {tab === "events" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowEventForm(!showEventForm)} className="inline-flex items-center gap-1.5 text-[13px] px-4 py-[10px] rounded-full bg-[#2b2723] text-[#f9f2e8] hover:bg-[#392f29]">
                <Plus size={14}/> Add event
              </button>
            </div>
            {showEventForm && (
              <form onSubmit={addEvent} className="bg-white rounded-[20px] border border-[#e6d4be] p-5 grid md:grid-cols-2 gap-3">
                <input required placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="md:col-span-2 rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <input placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <input type="date" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <input type="time" value={newEvent.event_time} onChange={e => setNewEvent({...newEvent, event_time: e.target.value})} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <input placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowEventForm(false)} className="px-4 py-2 rounded-full border border-[#d9c6ae] text-[13px]">Cancel</button>
                  <button className="px-4 py-2 rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13px]">Save event</button>
                </div>
              </form>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {events.map(ev => (
                <div key={ev.id} className="bg-white rounded-[20px] border border-[#e6d4be] p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="wedding-label">{ev.event_date && format(new Date(ev.event_date), "EEE • d MMM")}{ev.event_time && ` • ${ev.event_time}`}</div>
                      <div className="display text-[22px] text-[#2a231d] mt-1">{ev.title}</div>
                      {ev.location && <div className="text-[13px] text-[#6b5d4f] mt-1 flex items-center gap-1"><MapPin size={12}/>{ev.location}</div>}
                    </div>
                    <button onClick={() => { store.remove("events", ev.id); refresh(); toast.success("Event removed"); }} className="text-[#a64838] hover:text-[#7e3124]">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  {ev.description && <div className="text-[13.5px] text-[#5a4f45] leading-6 mt-3">{ev.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {tab === "gallery" && (
          <div>
            <div className="bg-white rounded-[20px] border border-[#e6d4be] p-5 mb-5">
              <div className="flex items-center gap-3">
                <input value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)} placeholder="Image URL" className="flex-1 rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <input value={galleryCap} onChange={e => setGalleryCap(e.target.value)} placeholder="Caption" className="flex-1 rounded-[12px] border border-[#e0ccb2] px-3 py-2.5 text-[14px] outline-none focus:border-[#d3a76b]" />
                <button
                  onClick={() => {
                    if (!galleryUrl.trim()) { toast.error("URL required"); return; }
                    store.insert("gallery", { wedding_id: weddingId, url: galleryUrl.trim(), caption: galleryCap.trim() || null });
                    setGalleryUrl("");
                    setGalleryCap("");
                    toast.success("Photo added");
                  }}
                  className="px-4 py-[10px] rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13px]"
                >Add</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map(g => (
                <div key={g.id} className="group relative bg-white rounded-[18px] border border-[#e6d4be] p-[8px]">
                  <div className="aspect-square rounded-[14px] overflow-hidden">
                    <img src={g.url} alt={g.caption || ""} className="w-full h-full object-cover" />
                  </div>
                  {g.caption && <div className="px-2 pt-2 text-[12.5px] text-[#6e5c47] truncate">{g.caption}</div>}
                  <button onClick={() => { store.remove("gallery", g.id); refresh(); toast.success("Removed"); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moments */}
        {tab === "moments" && (
          <div className="grid md:grid-cols-2 gap-4">
            {moments.slice().reverse().map((m: any) => (
              <div key={m.id} className="bg-white rounded-[20px] border border-[#e6d4be] p-5">
                <div className="text-[14.5px] text-[#3d332a] leading-7">"{m.message}"</div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-[12.5px] text-[#a67a50]">— {m.guest_name}</div>
                  <button onClick={() => { store.remove("guest_moments", m.id); refresh(); toast.success("Removed"); }} className="text-[#a64838] hover:text-[#7e3124]">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accommodations tab */}
        {tab === "accommodations" && (
          <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="wedding-label">Accommodations</div>
                <p className="text-[14px] text-[#6b5d4f] mt-1">Manage hotels and stay options.</p>
              </div>
              <button onClick={() => setHotelPromptOpen(true)} className="px-4 py-[10px] bg-[#2b2723] text-[#f9f2e8] text-[12.5px] rounded-full">Add Hotel</button>
            </div>
            
            <div className="space-y-3">
              {accommodations.map((acc: any) => (
                <div key={acc.id} className="border border-[#e6d4be] rounded-[16px] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[15px] text-[#2a231d] font-medium">{acc.name}</div>
                    <div className="text-[13px] text-[#8d7962]">{acc.price || "Price TBD"} • {acc.distance || "Distance TBD"}</div>
                  </div>
                  <button onClick={() => { store.remove("accommodations", acc.id); refresh(); }} className="text-[#a64838] p-2">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
              {accommodations.length === 0 && <div className="text-center py-6 text-[#8d7962] text-[13.5px]">No accommodations added yet.</div>}
            </div>
          </div>
        )}

        {/* Map tab (Interactive Venue Map Editor) */}
        {tab === "map" && (
          <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
            <div className="wedding-label mb-3">Interactive Venue Map</div>
            <p className="text-[14px] text-[#6b5d4f] mb-4">Upload a venue map and place markers to guide your guests. Click anywhere on the image to add a marker.</p>
            
            <div className="mb-4">
              <label className="text-[12px] uppercase tracking-[0.1em] text-[#8d7962] block mb-1">Map Image URL</label>
              <div className="flex gap-2">
                <input 
                  value={wedding.venue_map_url || ""} 
                  onChange={e => saveWeddingEdits({ venue_map_url: e.target.value })}
                  placeholder="https://..." 
                  className="flex-1 rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[14px] outline-none focus:border-[#d3a76b]" 
                />
              </div>
            </div>

            {wedding.venue_map_url ? (
              <div className="relative border border-[#e6d4be] rounded-[16px] overflow-hidden bg-[#fdf9f4]">
                <img 
                  src={wedding.venue_map_url} 
                  alt="Venue Map" 
                  className="w-full h-auto cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMarkerCoords({ x, y });
                    setMarkerPromptOpen(true);
                  }}
                />
                {markers.map((m: any) => (
                  <div 
                    key={m.id} 
                    className="absolute w-8 h-8 -ml-4 -mt-4 bg-[#b0743c] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition group"
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteMarker({ id: m.id, title: m.title });
                    }}
                  >
                    <MapPin size={16} />
                    <div className="absolute top-10 w-max px-2 py-1 bg-black/80 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      {m.title} (Click to delete)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-[#f8eee0] rounded-[16px] border border-dashed border-[#d9c6ae] flex items-center justify-center text-[#8d7962]">
                <MapPin size={24} className="mr-2"/> Provide a map URL above to start
              </div>
            )}
          </div>
        )}

        {/* Live Announcements */}
        {tab === "updates" && (
          <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="wedding-label">Live Announcements</div>
                <p className="text-[14px] text-[#6b5d4f] mt-1">Post updates that appear instantly on your website.</p>
              </div>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!updateTitle || !updateMsg) return;
              store.insert("updates", { wedding_id: weddingId, title: updateTitle, message: updateMsg });
              refresh();
              toast.success("Announcement published");
              setUpdateTitle("");
              setUpdateMsg("");
            }} className="mb-6 grid gap-3 border border-[#e6d4be] p-4 rounded-[16px] bg-[#fcf7f1]">
              <input value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} required placeholder="Announcement Title (e.g. Dinner is served)" className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[14px] outline-none" />
              <textarea value={updateMsg} onChange={e => setUpdateMsg(e.target.value)} required rows={2} placeholder="Add a short message..." className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[14px] outline-none resize-none" />
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 rounded-full bg-[#b0743c] text-white text-[13px] hover:bg-[#8e5c2e]">Publish Update</button>
              </div>
            </form>

            <div className="space-y-3">
              {updates.slice().reverse().map((u: any) => (
                <div key={u.id} className="border border-[#e6d4be] rounded-[16px] p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[15px] text-[#2a231d] font-medium">{u.title}</div>
                      <div className="text-[13.5px] text-[#5a4f45] mt-1">{u.message}</div>
                      <div className="text-[11.5px] text-[#8d7962] mt-2">{format(new Date(u.created_at), "HH:mm • d MMM yyyy")}</div>
                    </div>
                    <button onClick={() => { store.remove("updates", u.id); refresh(); }} className="text-[#a64838] p-2">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest Photos */}
        {tab === "guest_photos" && (
          <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
            <div className="wedding-label mb-3">Guest Uploads</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {guestPhotos.slice().reverse().map((p: any) => (
                <div key={p.id} className="relative aspect-square rounded-[16px] overflow-hidden border border-[#e6d4be] group shadow-sm">
                  <img src={p.photo_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="text-[11px] text-white font-medium">{p.guest_name}</div>
                  </div>
                  <button onClick={() => { store.remove("guest_photos", p.id); refresh(); toast.success("Photo removed"); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
              {guestPhotos.length === 0 && (
                <div className="col-span-full text-center py-8 text-[13.5px] text-[#8d7962] border border-dashed border-[#d9c6ae] rounded-[16px]">
                  No guest photos yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Check-ins */}
        {tab === "checkins" as any && (
          <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
            <div className="wedding-label mb-3">Live Check-ins</div>
            <div className="space-y-2">
              {checkins.slice().reverse().map(c => (
                <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-[#f0e4d4] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#eff6ee] text-[#4f7a56] flex items-center justify-center"><CheckCircle2 size={16}/></div>
                    <div>
                      <div className="text-[14.5px] text-[#2a231d]">{c.guest_name}</div>
                      <div className="text-[12px] text-[#8d7962]">{format(new Date(c.checkin_time), "HH:mm • d MMM")}</div>
                    </div>
                  </div>
                  <button onClick={() => { store.remove("checkins", c.id); refresh(); }} className="text-[#a64838] hover:text-[#7e3124]">
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
              {checkins.length === 0 && <div className="text-[14px] text-[#8d7962] text-center py-10">No check-ins yet. Share the QR code to start.</div>}
            </div>
          </div>
        )}

        {/* Share */}
        {tab === "share" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-2">Wedding URL</div>
              <div className="display text-[22px] text-[#2a231d] mb-3">Share with guests</div>
              <div className="flex items-center gap-2 bg-[#f8eee0] border border-[#e8d2b6] rounded-[14px] p-3">
                <span className="flex-1 text-[13.5px] text-[#5a4735] truncate">{weddingUrl}</span>
                <button onClick={copyLink} className="px-3 py-1.5 rounded-full bg-[#2b2723] text-[#f9f2e8] text-[12.5px] flex items-center gap-1.5">
                  <Copy size={12}/> Copy
                </button>
              </div>
              <div className="mt-4 text-[13px] text-[#6b5d4f]">
                Send this link via WhatsApp, email, or print on your invitation cards.
              </div>
            </div>

            <div className="bg-white rounded-[22px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-2">QR Code</div>
              <div className="display text-[22px] text-[#2a231d] mb-3">Scan to open</div>
              <div className="flex items-center justify-center p-6 bg-[#f8eee0] border border-[#e8d2b6] rounded-[14px]">
                <QRCodeSVG value={weddingUrl} size={180} level="H" fgColor="#2b2723" />
              </div>
              <div className="mt-3 text-[13px] text-[#6b5d4f] text-center">
                Print this at the venue entrance for self-check-in.
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-[22px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-2">Quick Links</div>
              <div className="grid sm:grid-cols-3 gap-3 mt-3">
                {[
                  { label: "Check-in page", url: `/checkin/${slug}`, icon: <Users size={14}/> },
                  { label: "QR redirect", url: `/q/${slug}`, icon: <Gift size={14}/> },
                  { label: "Public site", url: `/wedding/${slug}`, icon: <ExternalLink size={14}/> },
                ].map(l => (
                  <Link key={l.url} to={l.url} target="_blank" className="flex items-center gap-2 p-3 rounded-[14px] border border-[#e6d4be] hover:bg-[#fbf3e8] text-[13.5px] text-[#5a4735]">
                    {l.icon} {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      <PromptModal
        open={hotelPromptOpen}
        title="Add Hotel"
        label="Hotel Name"
        placeholder="e.g. The Ritz-Carlton"
        submitLabel="Add Hotel"
        onCancel={() => setHotelPromptOpen(false)}
        onSubmit={(name) => {
          store.insert("accommodations", { wedding_id: weddingId, name, photo_url: null, price: null, phone: null, distance: null, booking_url: null });
          refresh();
        }}
      />

      <PromptModal
        open={markerPromptOpen}
        title="Add Map Marker"
        label="Marker Title"
        placeholder="e.g. Dance Floor, Entrance"
        submitLabel="Add Marker"
        onCancel={() => { setMarkerPromptOpen(false); setMarkerCoords(null); }}
        onSubmit={(title) => {
          if (markerCoords) {
            store.insert("venue_markers", {
              wedding_id: weddingId,
              title,
              category: "General",
              icon: "MapPin",
              description: null,
              x: markerCoords.x,
              y: markerCoords.y
            });
            refresh();
            toast.success("Marker added");
          }
        }}
      />

      <ConfirmModal
        open={!!deleteMarker}
        title="Delete Marker"
        message={`Are you sure you want to delete marker "${deleteMarker?.title}"?`}
        destructive
        confirmLabel="Delete"
        onCancel={() => setDeleteMarker(null)}
        onConfirm={() => {
          if (deleteMarker) {
            store.remove("venue_markers", deleteMarker.id);
            refresh();
            toast.success("Marker deleted");
          }
        }}
      />
    </div>
  );
}
