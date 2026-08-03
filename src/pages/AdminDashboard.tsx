import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, isAfter, isBefore, differenceInDays } from "date-fns";
import Papa from "papaparse";
import {
  Archive, BarChart3, Bell, Calendar, CheckCircle2, ChevronRight, Copy,
  Download, Edit3, ExternalLink, Eye, EyeOff, FileSpreadsheet,
  Flower2, Gauge, HardDrive, Image, Layers, LayoutTemplate, LogOut,
  MoreHorizontal, Plus, QrCode, Search, Settings, Shield,
  Trash2, Upload, Users, Wand2, X, Zap
} from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";

type StatusFilter = "all" | "draft" | "published" | "upcoming" | "completed" | "archived";

const templateLibrary = [
  { name: "Classic Wedding", color: "#c9a87a", image: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Luxury Wedding", color: "#2b2723", image: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Garden Wedding", color: "#7b8a62", image: "https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Beach Wedding", color: "#5f8ca3", image: "https://images.pexels.com/photos/28584778/pexels-photo-28584778.jpeg?auto=compress&cs=tinysrgb&w=800" },
];

const statusStyles: Record<string, string> = {
  Draft: "bg-[#f8eee0] text-[#b0743c] border-[#e8d2b6]",
  Published: "bg-[#eff6ee] text-[#4f7a56] border-[#d2e2d0]",
  "Wedding Week": "bg-[#eef4ff] text-[#3f67a8] border-[#d7e4ff]",
  Live: "bg-[#fde9e6] text-[#a64838] border-[#f3c9c2]",
  Completed: "bg-[#f3edf6] text-[#7a5a8f] border-[#e5d7eb]",
  Archived: "bg-[#f0e9e0] text-[#6b5d4f] border-[#e0ccb2]",
};

function getWeddingStage(wedding: any) {
  if (wedding.archived) return "Archived";
  if (wedding.legacy_mode) return "Completed";
  if (!wedding.published) return "Draft";
  if (!wedding.wedding_date) return "Published";
  const date = new Date(`${wedding.wedding_date}T${wedding.ceremony_time || "16:00"}:00`);
  const now = new Date();
  const days = differenceInDays(date, now);
  if (days === 0) return "Live";
  if (days > 0 && days <= 7) return "Wedding Week";
  if (isBefore(date, now)) return "Completed";
  return "Published";
}

function weddingGuestCount(weddingId: string) {
  return store.where("rsvps", (r: any) => r.wedding_id === weddingId).reduce((sum: number, r: any) => sum + (Number(r.guest_count) || 1), 0);
}

function rsvpProgress(weddingId: string) {
  const rsvps = store.where("rsvps", (r: any) => r.wedding_id === weddingId);
  if (!rsvps.length) return 0;
  const responded = rsvps.filter((r: any) => r.attending === "confirmed" || r.attending === "declined" || r.attending === true || r.attending === false).length;
  return Math.round((responded / rsvps.length) * 100);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [weddings, setWeddings] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailWedding, setDetailWedding] = useState<any | null>(null);
  const [template, setTemplate] = useState(templateLibrary[0].name);
  const [newCouple, setNewCouple] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("wb_admin") && !localStorage.getItem("wb_admin")) {
      navigate("/admin/login");
      return;
    }
    refresh();
    const offWeddings = store.subscribe("weddings", refresh);
    const offRsvps = store.subscribe("rsvps", refresh);
    const offPhotos = store.subscribe("guest_photos", refresh);
    const offMoments = store.subscribe("guest_moments", refresh);
    return () => { offWeddings(); offRsvps(); offPhotos(); offMoments(); };
  }, [navigate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSpotlightOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const refresh = () => setWeddings(store.all("weddings"));

  const stats = useMemo(() => {
    const now = new Date();
    const rsvps = store.all("rsvps");
    const photos = store.all("guest_photos");
    const moments = store.all("guest_moments");
    const active = weddings.filter(w => ["Published", "Wedding Week", "Live"].includes(getWeddingStage(w))).length;
    const upcoming = weddings.filter(w => w.wedding_date && isAfter(new Date(w.wedding_date), now)).length;
    const completed = weddings.filter(w => getWeddingStage(w) === "Completed").length;
    const views = weddings.reduce((sum, w) => sum + Number(localStorage.getItem(`wb_viewed_${w.id}`) || 0), 0);
    const qr = weddings.reduce((sum, w) => sum + Number(localStorage.getItem(`wb_qr_${w.id}`) || 0), 0);
    return {
      total: weddings.length,
      active,
      upcoming,
      completed,
      draft: weddings.filter(w => getWeddingStage(w) === "Draft").length,
      published: weddings.filter(w => w.published).length,
      guests: weddings.reduce((sum, w) => sum + weddingGuestCount(w.id), 0),
      rsvps: rsvps.length,
      photos: photos.length,
      messages: moments.length,
      views,
      qr,
    };
  }, [weddings]);

  const filteredWeddings = useMemo(() => {
    const term = query.toLowerCase().trim();
    return weddings.filter(w => {
      const stage = getWeddingStage(w).toLowerCase();
      const matchesFilter = filter === "all" ||
        (filter === "published" && w.published) ||
        (filter === "draft" && stage === "draft") ||
        (filter === "completed" && stage === "completed") ||
        (filter === "archived" && stage === "archived") ||
        (filter === "upcoming" && w.wedding_date && isAfter(new Date(w.wedding_date), new Date()));
      const searchable = `${w.couple_names} ${w.slug} ${w.access_code} ${w.ceremony_venue || ""} ${w.venue_address || ""} ${stage}`.toLowerCase();
      return matchesFilter && (!term || searchable.includes(term));
    });
  }, [weddings, query, filter]);

  const activity = useMemo(() => {
    const items: { text: string; sub: string; ts: number; wedding?: any; icon: ReactNode }[] = [];
    weddings.forEach(w => items.push({ text: "Wedding Created", sub: w.couple_names, ts: new Date(w.created_at || Date.now()).getTime(), wedding: w, icon: <Flower2 size={14} /> }));
    store.all("rsvps").forEach((r: any) => {
      const wedding = weddings.find(w => w.id === r.wedding_id);
      items.push({ text: "Guest RSVP Received", sub: `${r.guest_name}${wedding ? ` · ${wedding.couple_names}` : ""}`, ts: new Date(r.submitted_at || r.created_at || Date.now()).getTime(), wedding, icon: <Users size={14} /> });
    });
    store.all("guest_photos").forEach((p: any) => {
      const wedding = weddings.find(w => w.id === p.wedding_id);
      items.push({ text: "Guest Uploaded Photo", sub: `${p.guest_name}${wedding ? ` · ${wedding.couple_names}` : ""}`, ts: new Date(p.created_at || Date.now()).getTime(), wedding, icon: <Image size={14} /> });
    });
    store.all("updates").forEach((u: any) => {
      const wedding = weddings.find(w => w.id === u.wedding_id);
      items.push({ text: "Wedding Update Published", sub: `${u.title}${wedding ? ` · ${wedding.couple_names}` : ""}`, ts: new Date(u.created_at || Date.now()).getTime(), wedding, icon: <Bell size={14} /> });
    });
    return items.sort((a, b) => b.ts - a.ts).slice(0, 12);
  }, [weddings]);

  const createWedding = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCouple.trim()) return;
    const slug = (newSlug.trim() || newCouple.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 60);
    const code = Math.random().toString(16).slice(2, 10).toUpperCase();
    const selectedTemplate = templateLibrary.find(t => t.name === template) || templateLibrary[0];
    const wedding = store.insert("weddings", {
      slug,
      access_code: code,
      couple_names: newCouple.trim(),
      wedding_date: newDate || null,
      ceremony_time: "16:00",
      ceremony_venue: newVenue || null,
      venue_address: null,
      venue_map_url: null,
      cover_image: selectedTemplate.image,
      hero_image: selectedTemplate.image,
      story: "Tell your story here.",
      dress_code: "Garden formal",
      hashtag: newCouple.replace(/[^a-zA-Z]/g, ""),
      published: false,
      legacy_mode: false,
      soundtrack_url: null,
      theme: { background: "38 35% 97%", foreground: "30 20% 15%", primary: "30 55% 42%", accent: "30 55% 52%", template },
    });
    toast.success(`Wedding created. Couple code: ${code}`);
    setDetailWedding(wedding);
    setNewCouple(""); setNewSlug(""); setNewDate(""); setNewVenue(""); setShowCreate(false);
  };

  const duplicateWedding = (w: any) => {
    const copySlug = `${w.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newWedding = store.insert("weddings", {
      ...w,
      id: undefined,
      slug: copySlug,
      access_code: Math.random().toString(16).slice(2, 10).toUpperCase(),
      couple_names: `${w.couple_names} Copy`,
      published: false,
      created_at: new Date().toISOString(),
    });
    toast.success(`Duplicated ${w.couple_names}`);
    setDetailWedding(newWedding);
  };

  const archiveWedding = (w: any) => {
    store.update("weddings", w.id, { archived: true, published: false });
    toast.success(`${w.couple_names} archived`);
    refresh();
  };

  const togglePublish = (w: any) => {
    store.update("weddings", w.id, { published: !w.published, archived: false });
    toast.success(w.published ? "Wedding unpublished" : "Wedding published");
    refresh();
  };

  const deleteWedding = (w: any) => {
    if (!confirm(`Delete "${w.couple_names}"? This removes all linked data.`)) return;
    store.remove("weddings", w.id);
    ["events", "gallery", "guest_photos", "rsvps", "guest_moments", "checkins", "updates", "accommodations", "venue_markers"].forEach(t => {
      store.where(t as any, (row: any) => row.wedding_id === w.id).forEach((row: any) => store.remove(t as any, row.id));
    });
    toast.success("Wedding deleted");
    refresh();
  };

  const importCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        let count = 0;
        const weddingId = filteredWeddings[0]?.id || weddings[0]?.id;
        if (!weddingId) { toast.error("Create a wedding before importing guests"); return; }
        (results.data as any[]).forEach((row) => {
          if (!row.guest_name) return;
          store.insert("rsvps", {
            wedding_id: weddingId,
            guest_name: row.guest_name,
            email: row.email || null,
            attending: row.attending || "pending",
            guest_count: Number(row.guest_count) || 1,
            dietary_preference: row.dietary_preference || null,
            message: row.message || null,
            submitted_at: new Date().toISOString(),
          });
          count++;
        });
        toast.success(`CSV import completed: ${count} guests`);
        refresh();
      },
    });
  };

  const exportCsv = () => {
    const csv = Papa.unparse(store.all("rsvps"));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "forevervow-rsvps.csv"; a.click();
    toast.success("RSVP report exported");
  };

  const bulkAction = (action: "publish" | "unpublish" | "archive" | "delete") => {
    selectedIds.forEach(id => {
      const wedding = weddings.find(w => w.id === id);
      if (!wedding) return;
      if (action === "publish") store.update("weddings", id, { published: true, archived: false });
      if (action === "unpublish") store.update("weddings", id, { published: false });
      if (action === "archive") store.update("weddings", id, { published: false, archived: true });
      if (action === "delete") store.remove("weddings", id);
    });
    toast.success(`Bulk ${action} completed`);
    setSelectedIds([]);
    refresh();
  };

  const logout = () => {
    sessionStorage.removeItem("wb_admin");
    localStorage.removeItem("wb_admin");
    navigate("/admin/login");
  };

  const platformCards = [
    { label: "Total Weddings", value: stats.total, icon: <Flower2 size={16} />, filter: "all" as StatusFilter },
    { label: "Active Weddings", value: stats.active, icon: <Zap size={16} />, filter: "published" as StatusFilter },
    { label: "Upcoming", value: stats.upcoming, icon: <Calendar size={16} />, filter: "upcoming" as StatusFilter },
    { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={16} />, filter: "completed" as StatusFilter },
    { label: "Draft", value: stats.draft, icon: <Edit3 size={16} />, filter: "draft" as StatusFilter },
    { label: "Published", value: stats.published, icon: <Eye size={16} />, filter: "published" as StatusFilter },
    { label: "Total Guests", value: stats.guests, icon: <Users size={16} />, filter: "all" as StatusFilter },
    { label: "Total RSVPs", value: stats.rsvps, icon: <FileSpreadsheet size={16} />, filter: "all" as StatusFilter },
    { label: "Guest Photos", value: stats.photos, icon: <Image size={16} />, filter: "all" as StatusFilter },
    { label: "Messages", value: stats.messages, icon: <Bell size={16} />, filter: "all" as StatusFilter },
    { label: "Wedding Views", value: stats.views, icon: <BarChart3 size={16} />, filter: "all" as StatusFilter },
    { label: "QR Scans", value: stats.qr, icon: <QrCode size={16} />, filter: "all" as StatusFilter },
  ];

  const mostViewed = weddings.slice().sort((a, b) => Number(localStorage.getItem(`wb_viewed_${b.id}`) || 0) - Number(localStorage.getItem(`wb_viewed_${a.id}`) || 0))[0];
  const avgGuests = weddings.length ? Math.round(stats.guests / weddings.length) : 0;
  const avgRsvp = weddings.length ? Math.round(weddings.reduce((sum, w) => sum + rsvpProgress(w.id), 0) / weddings.length) : 0;

  return (
    <div className="min-h-screen bg-[#f7f3ed]" style={{ fontFamily: '"Manrope", system-ui, sans-serif' }}>
      <style>{`.display{font-family:"Cormorant Garamond",Georgia,serif}.wedding-label{letter-spacing:.26em;text-transform:uppercase;font-size:11px;color:#b7834c}`}</style>

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#e6d4be]">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8 h-[72px] flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[14px] bg-[#2b2723] text-[#f9f2e8] flex items-center justify-center"><Shield size={17} /></div>
            <div className="hidden sm:block">
              <div className="wedding-label">ForeverVow Admin</div>
              <div className="display text-[17px] text-[#2a231d] -mt-0.5">Platform Command Center</div>
            </div>
          </div>

          <button onClick={() => setSpotlightOpen(true)} className="mx-auto hidden md:flex flex-1 max-w-xl items-center gap-3 px-4 py-2.5 rounded-[16px] bg-[#f7f3ed] border border-[#e6d4be] text-[#8d7962] text-[13.5px] hover:bg-white transition">
            <Search size={15} /> Search weddings, guests, venues, codes...
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#e6d4be]">⌘K</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative w-10 h-10 rounded-[14px] border border-[#e6d4be] bg-white flex items-center justify-center text-[#5a4735]">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b0743c] text-white text-[10px] flex items-center justify-center">3</span>
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] border border-[#d9c6ae] bg-white text-[#5a4735] text-[13px] hover:bg-[#fbf3e8]">
              <LogOut size={14}/> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 md:px-8 py-8 space-y-8">
        <section className="grid lg:grid-cols-[1.4fr_.8fr] gap-6">
          <div className="bg-[#2b2723] rounded-[30px] p-8 text-[#f9f2e8] relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#b0743c]/25 blur-3xl" />
            <div className="relative z-10">
              <div className="wedding-label !text-[#c9a87a] mb-3">Platform Overview</div>
              <h1 className="display text-[44px] md:text-[58px] leading-[0.95] text-white max-w-2xl">Understand the entire platform in seconds.</h1>
              <p className="mt-5 text-[15px] leading-7 text-white/65 max-w-xl">Monitor wedding lifecycle, guest activity, imports, publishing, storage, QR usage, and operational health from one command center.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#2b2723] text-[13px] font-semibold"><Plus size={15}/> Create Wedding</button>
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white text-[13px]"><Upload size={15}/> Import CSV</button>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && importCSV(e.target.files[0])} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-4">System Status</div>
              {["Database", "Storage", "Background Jobs", "Email Service", "QR Generation", "CSV Imports"].map((s, i) => (
                <div key={s} className="flex items-center justify-between py-2.5 border-b border-[#f0e4d4] last:border-0">
                  <span className="text-[13.5px] text-[#4b4037]">{s}</span>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${i === 2 ? "bg-[#fdf3e4] text-[#b0743c]" : "bg-[#eff6ee] text-[#4f7a56]"}`}>{i === 2 ? "Queued" : "Healthy"}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-3">Fast Reports</div>
              <button onClick={exportCsv} className="w-full flex items-center justify-between px-4 py-3 rounded-[16px] bg-[#f8eee0] border border-[#e8d2b6] text-[#5a4735] text-[13px]"><span className="flex items-center gap-2"><Download size={15}/> Export RSVP Report</span><ChevronRight size={14}/></button>
            </div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {platformCards.map(card => (
              <button key={card.label} onClick={() => setFilter(card.filter)} className="text-left bg-white rounded-[22px] border border-[#e6d4be] p-5 hover:border-[#d3a76b] hover:-translate-y-0.5 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-[13px] bg-[#f8eee0] text-[#b0743c] flex items-center justify-center mb-3">{card.icon}</div>
                <div className="display text-[30px] text-[#2a231d] leading-none">{card.value}</div>
                <div className="text-[10.5px] uppercase tracking-[0.18em] text-[#8d7962] mt-2 font-semibold">{card.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] border border-[#e6d4be] overflow-hidden">
              <div className="p-5 border-b border-[#e6d4be] flex flex-wrap items-center gap-3">
                <div className="mr-auto">
                  <div className="wedding-label">Wedding Management</div>
                  <div className="text-[13px] text-[#8d7962] mt-1">{filteredWeddings.length} weddings shown</div>
                </div>
                <div className="relative min-w-[220px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a98a6b]" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="w-full rounded-[14px] border border-[#e6d4be] pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-[#d3a76b]" />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value as StatusFilter)} className="rounded-[14px] border border-[#e6d4be] px-3 py-2.5 text-[13px] bg-white outline-none">
                  <option value="all">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {selectedIds.length > 0 && (
                <div className="px-5 py-3 bg-[#f8eee0] border-b border-[#e8d2b6] flex flex-wrap items-center gap-2 text-[13px] text-[#5a4735]">
                  <strong>{selectedIds.length}</strong> selected
                  <button onClick={() => bulkAction("publish")} className="ml-auto px-3 py-1.5 rounded-full bg-[#2b2723] text-white">Publish</button>
                  <button onClick={() => bulkAction("unpublish")} className="px-3 py-1.5 rounded-full border border-[#d6bc9c]">Unpublish</button>
                  <button onClick={() => bulkAction("archive")} className="px-3 py-1.5 rounded-full border border-[#d6bc9c]">Archive</button>
                  <button onClick={() => bulkAction("delete")} className="px-3 py-1.5 rounded-full border border-[#e0a09a] text-[#a64838]">Delete</button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-[13px]">
                  <thead className="bg-[#fdf9f4] text-left">
                    <tr className="text-[10.5px] uppercase tracking-[0.16em] text-[#8d7962]">
                      <th className="p-4"><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? filteredWeddings.map(w => w.id) : [])} /></th>
                      <th className="p-4">Wedding</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Lifecycle</th>
                      <th className="p-4">Guests</th>
                      <th className="p-4">RSVP</th>
                      <th className="p-4">Website</th>
                      <th className="p-4">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeddings.map(w => {
                      const stage = getWeddingStage(w);
                      const guestCount = weddingGuestCount(w.id);
                      const progress = rsvpProgress(w.id);
                      return (
                        <tr key={w.id} className="border-t border-[#f0e4d4] hover:bg-[#fdf9f4] transition">
                          <td className="p-4"><input type="checkbox" checked={selectedIds.includes(w.id)} onChange={() => setSelectedIds(ids => ids.includes(w.id) ? ids.filter(x => x !== w.id) : [...ids, w.id])} /></td>
                          <td className="p-4">
                            <div className="flex items-center gap-3 min-w-[240px]">
                              <img src={w.cover_image || w.hero_image} alt="" className="w-14 h-14 rounded-[14px] object-cover border border-[#e6d4be]" />
                              <div className="min-w-0">
                                <button onClick={() => setDetailWedding(w)} className="display text-[20px] text-[#2a231d] hover:text-[#b0743c] truncate block text-left">{w.couple_names}</button>
                                <div className="text-[11.5px] text-[#8d7962] truncate">/{w.slug} · {w.access_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[#5a4f45]">{w.wedding_date ? format(new Date(w.wedding_date), "d MMM yyyy") : "Not set"}</td>
                          <td className="p-4"><span className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusStyles[stage]}`}>{stage}</span></td>
                          <td className="p-4 text-[#5a4f45]">{guestCount}</td>
                          <td className="p-4">
                            <div className="w-[110px]">
                              <div className="h-1.5 bg-[#f5efe7] rounded-full overflow-hidden"><div className="h-full bg-[#b0743c]" style={{ width: `${progress}%` }} /></div>
                              <div className="text-[11px] text-[#8d7962] mt-1">{progress}% complete</div>
                            </div>
                          </td>
                          <td className="p-4"><span className={`text-[11px] font-semibold ${w.published ? "text-[#4f7a56]" : "text-[#b0743c]"}`}>{w.published ? "Public" : "Private"}</span></td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <button title="Open Dashboard" onClick={() => { localStorage.setItem("couple_wedding_id", w.id); localStorage.setItem("couple_wedding_slug", w.slug); window.open(`/couple/${w.slug}/dashboard`, "_blank"); }} className="p-2 rounded-lg hover:bg-[#f5efe7]"><Gauge size={14}/></button>
                              <Link title="Preview Website" to={`/wedding/${w.slug}?preview=1`} target="_blank" className="p-2 rounded-lg hover:bg-[#f5efe7]"><ExternalLink size={14}/></Link>
                              <button title="Copy guest link" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/wedding/${w.slug}`); toast.success("Guest link copied"); }} className="p-2 rounded-lg hover:bg-[#f5efe7]"><Copy size={14}/></button>
                              <button title="Copy couple link" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/couple/${w.slug}`); toast.success("Couple link copied"); }} className="p-2 rounded-lg hover:bg-[#f5efe7]"><QrCode size={14}/></button>
                              <button title="Publish/unpublish" onClick={() => togglePublish(w)} className="p-2 rounded-lg hover:bg-[#f5efe7]">{w.published ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                              <button title="Duplicate" onClick={() => duplicateWedding(w)} className="p-2 rounded-lg hover:bg-[#f5efe7]"><Layers size={14}/></button>
                              <button title="Archive" onClick={() => archiveWedding(w)} className="p-2 rounded-lg hover:bg-[#f5efe7]"><Archive size={14}/></button>
                              <button title="Delete" onClick={() => deleteWedding(w)} className="p-2 rounded-lg hover:bg-[#fde9e6] text-[#a64838]"><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-4">Quick Actions</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Create", icon: <Plus size={16}/>, action: () => setShowCreate(true) },
                  { label: "Import", icon: <Upload size={16}/>, action: () => fileRef.current?.click() },
                  { label: "Templates", icon: <LayoutTemplate size={16}/>, action: () => toast.info("Template library ready") },
                  { label: "Themes", icon: <Wand2 size={16}/>, action: () => toast.info("Theme manager ready") },
                  { label: "Assets", icon: <HardDrive size={16}/>, action: () => toast.info("Asset library ready") },
                  { label: "Reports", icon: <Download size={16}/>, action: exportCsv },
                  { label: "Users", icon: <Users size={16}/>, action: () => toast.info("User management ready") },
                  { label: "Settings", icon: <Settings size={16}/>, action: () => toast.info("Platform settings ready") },
                ].map(a => (
                  <button key={a.label} onClick={a.action} className="p-4 rounded-[18px] bg-[#fcf7f1] border border-[#eadfd1] hover:bg-[#f8eee0] text-left transition">
                    <div className="text-[#b0743c] mb-2">{a.icon}</div>
                    <div className="text-[12.5px] font-semibold text-[#4b4037]">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
              <div className="wedding-label mb-4">Recent Activity</div>
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <button key={index} onClick={() => item.wedding && setDetailWedding(item.wedding)} className="w-full text-left flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-[#f8eee0] text-[#b0743c] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#2a231d] truncate">{item.text}</div>
                      <div className="text-[12px] text-[#8d7962] truncate">{item.sub}</div>
                      <div className="text-[11px] text-[#b0743c] mt-0.5">{formatDistanceToNow(new Date(item.ts), { addSuffix: true })}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
            <div className="wedding-label mb-4">Platform Insights</div>
            {[
              ["Most Viewed Wedding", mostViewed?.couple_names || "—"],
              ["Most Popular Theme", "Garden Wedding"],
              ["Average Guest Count", avgGuests],
              ["Average RSVP Rate", `${avgRsvp}%`],
              ["Average Photos/Wedding", weddings.length ? Math.round(stats.photos / weddings.length) : 0],
              ["Wedding Views This Week", stats.views],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between py-2.5 border-b border-[#f0e4d4] last:border-0">
                <span className="text-[13px] text-[#6b5d4f]">{label}</span>
                <span className="text-[13px] font-semibold text-[#2a231d] text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
            <div className="wedding-label mb-4">Template Library</div>
            <div className="grid grid-cols-2 gap-3">
              {templateLibrary.map(t => (
                <div key={t.name} className="rounded-[16px] overflow-hidden border border-[#e6d4be]">
                  <img src={t.image} alt="" className="h-20 w-full object-cover" />
                  <div className="p-3 text-[12px] font-semibold text-[#2a231d]">{t.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#e6d4be] p-6">
            <div className="wedding-label mb-4">Asset Library</div>
            <div className="grid grid-cols-3 gap-3">
              {["Backgrounds", "Icons", "Logos", "Fonts", "Themes", "Decor"].map(asset => (
                <button key={asset} className="aspect-square rounded-[16px] bg-[#fcf7f1] border border-[#eadfd1] flex flex-col items-center justify-center gap-2 text-[#5a4735] text-[11px] hover:bg-[#f8eee0]">
                  <HardDrive size={16} className="text-[#b0743c]" /> {asset}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={createWedding} className="bg-white rounded-[28px] border border-[#e6d4be] p-6 w-full max-w-2xl shadow-2xl grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-start justify-between gap-4">
              <div><div className="wedding-label mb-2">Create Wedding</div><h2 className="display text-[34px] text-[#2a231d]">Start from a template.</h2></div>
              <button type="button" onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full border border-[#e6d4be] flex items-center justify-center"><X size={15}/></button>
            </div>
            <div>
              <label className="wedding-label block mb-2">Couple names</label>
              <input required value={newCouple} onChange={e => setNewCouple(e.target.value)} placeholder="John & Anna" className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
            </div>
            <div>
              <label className="wedding-label block mb-2">URL slug</label>
              <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="john-anna" className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
            </div>
            <div>
              <label className="wedding-label block mb-2">Wedding date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
            </div>
            <div>
              <label className="wedding-label block mb-2">Venue</label>
              <input value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="Villa Rosa Alba" className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
            </div>
            <div className="md:col-span-2">
              <label className="wedding-label block mb-2">Template</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {templateLibrary.map(t => (
                  <button key={t.name} type="button" onClick={() => setTemplate(t.name)} className={`rounded-[16px] border overflow-hidden text-left ${template === t.name ? "border-[#b0743c] ring-4 ring-[#b0743c]/10" : "border-[#e6d4be]"}`}>
                    <img src={t.image} alt="" className="h-20 w-full object-cover" />
                    <div className="p-2 text-[11.5px] font-semibold text-[#2a231d]">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-3 rounded-full border border-[#d9c6ae] text-[#5a4735]">Cancel</button>
              <button className="px-6 py-3 rounded-full bg-[#2b2723] text-[#f9f2e8]">Create Wedding</button>
            </div>
          </form>
        </div>
      )}

      {spotlightOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]" onClick={() => setSpotlightOpen(false)}>
          <div className="w-full max-w-2xl bg-white rounded-[28px] border border-[#e6d4be] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#e6d4be] flex items-center gap-3">
              <Search size={18} className="text-[#b0743c]" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search couples, slugs, venues, access codes..." className="flex-1 outline-none text-[15px]" />
              <button onClick={() => setSpotlightOpen(false)} className="w-8 h-8 rounded-full border border-[#e6d4be] flex items-center justify-center"><X size={14}/></button>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2">
              {filteredWeddings.slice(0, 8).map(w => (
                <button key={w.id} onClick={() => { setDetailWedding(w); setSpotlightOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-[18px] hover:bg-[#fdf9f4] text-left">
                  <img src={w.cover_image || w.hero_image} alt="" className="w-12 h-12 rounded-[14px] object-cover" />
                  <div className="flex-1 min-w-0"><div className="font-semibold text-[#2a231d] truncate">{w.couple_names}</div><div className="text-[12px] text-[#8d7962] truncate">/{w.slug} · {w.access_code}</div></div>
                  <ChevronRight size={15} className="text-[#b0743c]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {detailWedding && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex justify-end" onClick={() => setDetailWedding(null)}>
          <div className="w-full max-w-3xl bg-[#faf8f5] h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#e6d4be] p-5 flex items-center justify-between z-10">
              <div><div className="wedding-label">Wedding Workspace</div><div className="display text-[28px] text-[#2a231d]">{detailWedding.couple_names}</div></div>
              <button onClick={() => setDetailWedding(null)} className="w-10 h-10 rounded-full border border-[#e6d4be] flex items-center justify-center"><X size={16}/></button>
            </div>
            <div className="p-6 space-y-6">
              <img src={detailWedding.cover_image || detailWedding.hero_image} alt="" className="w-full h-64 object-cover rounded-[24px] border border-[#e6d4be]" />
              <div className="grid sm:grid-cols-3 gap-4">
                {["Overview", "Couple Information", "Guest Management", "RSVPs", "Gallery", "Venue Map", "Accommodation", "Updates", "Analytics", "Settings"].map(section => (
                  <button key={section} className="bg-white rounded-[18px] border border-[#e6d4be] p-4 text-left hover:bg-[#fdf9f4]">
                    <MoreHorizontal size={16} className="text-[#b0743c] mb-2" />
                    <div className="text-[13px] font-semibold text-[#2a231d]">{section}</div>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-[22px] border border-[#e6d4be] p-5">
                <div className="wedding-label mb-3">Generated Links</div>
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center justify-between gap-3"><span className="text-[#6b5d4f]">Couple Dashboard</span><code className="truncate text-[#b0743c]">/couple/{detailWedding.slug}</code></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[#6b5d4f]">Guest Website</span><code className="truncate text-[#b0743c]">/wedding/{detailWedding.slug}</code></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[#6b5d4f]">Access Code</span><code className="tracking-[0.18em] text-[#2a231d]">{detailWedding.access_code}</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}