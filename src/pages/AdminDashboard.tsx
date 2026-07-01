import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, isAfter, isBefore, differenceInDays } from "date-fns";
import Papa from "papaparse";
import {
  Archive, BarChart3, Bell, Briefcase, Calendar, Camera, CheckCircle2, ChevronRight, Copy,
  DollarSign, Download, Edit3, ExternalLink, Eye, EyeOff, FileSpreadsheet, FileText,
  Flower2, Gauge, HardDrive, Image, Layers, LayoutTemplate, LogOut, Megaphone, MessageCircle,
  MoreHorizontal, Plus, QrCode, Search, Settings, Shield, Sparkles,
  Trash2, Upload, Users, Wand2, X, Zap, Check, AlertCircle, TrendingUp,
  KeyRound, Share2, Send
} from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { GlassCard } from "@/components/ui/GlassCard";
import { getStatusStyle } from "@/utils/designSystem";

type StatusFilter = "all" | "draft" | "published" | "upcoming" | "completed" | "archived";

function generateCoupleCode(names: string): string {
  const cleanName = (names.split(/[\s&+,]+/)[0] || "COUPLE").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 8);
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || "COUPLE"}${digits}`;
}

const templateLibrary = [
  { name: "Classic Wedding", color: "#c9a87a", image: "https://images.pexels.com/photos/37828118/pexels-photo-37828118.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Luxury Wedding", color: "#2b2723", image: "https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Garden Wedding", color: "#7b8a62", image: "https://images.pexels.com/photos/35629338/pexels-photo-35629338.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Beach Wedding", color: "#5f8ca3", image: "https://images.pexels.com/photos/28584778/pexels-photo-28584778.jpeg?auto=compress&cs=tinysrgb&w=800" },
];

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
  const responded = rsvps.filter((r: any) => r.attending === "confirmed" || r.attending === "declined").length;
  return Math.round((responded / rsvps.length) * 100);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [weddings, setWeddings] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards" | "timeline">("cards");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailWedding, setDetailWedding] = useState<any | null>(null);
  const [importPanel, setImportPanel] = useState<any | null>(null);
  const [toolPanel, setToolPanel] = useState<"templates" | "themes" | "assets" | "reports" | "users" | "settings" | null>(null);
  const [template, setTemplate] = useState(templateLibrary[0].name);
  const [newCouple, setNewCouple] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [deleteWeddingConfirm, setDeleteWeddingConfirm] = useState<any | null>(null);

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
      revenue: `$${(weddings.length * 24.5).toFixed(1)}k`,
      pendingInvoices: `$${(Math.max(1, weddings.filter(w => !w.published).length) * 4.5).toFixed(1)}k`,
      unreadClientMessages: Math.max(1, moments.length % 5 || 3),
      pendingContracts: Math.max(1, weddings.filter(w => !w.published).length || 2),
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
      const weddingRsvps = store.where("rsvps", (r: any) => r.wedding_id === w.id);
      const guestText = weddingRsvps.map((r: any) => `${r.guest_name || ""} ${r.email || ""} ${r.phone || ""} ${r.message || ""}`).join(" ");
      const searchable = `${w.couple_names} ${w.slug} ${w.access_code} ${w.ceremony_venue || ""} ${w.venue_address || ""} ${stage} ${guestText}`.toLowerCase();
      return matchesFilter && (!term || searchable.includes(term));
    });
  }, [weddings, query, filter]);

  const activity = useMemo(() => {
    const items: { text: string; sub: string; ts: number; wedding?: any; icon: ReactNode }[] = [];
    weddings.forEach(w => items.push({ text: `${w.couple_names} started planning their wedding`, sub: "New wedding created", ts: new Date(w.created_at || Date.now()).getTime(), wedding: w, icon: <Sparkles size={14} className="text-[#D4A853]" /> }));
    store.all("rsvps").forEach((r: any) => {
      const wedding = weddings.find(w => w.id === r.wedding_id);
      items.push({ text: `${r.guest_name} confirmed attendance`, sub: wedding ? wedding.couple_names : "Guest RSVP", ts: new Date(r.submitted_at || r.created_at || Date.now()).getTime(), wedding, icon: <CheckCircle2 size={14} className="text-[#A8A29E]" /> });
    });
    store.all("guest_photos").forEach((p: any) => {
      const wedding = weddings.find(w => w.id === p.wedding_id);
      items.push({ text: `${p.guest_name || "A guest"} uploaded gallery photos`, sub: wedding ? wedding.couple_names : "Wedding Media", ts: new Date(p.created_at || Date.now()).getTime(), wedding, icon: <Camera size={14} className="text-[#D4A853]/80" /> });
    });
    store.all("updates").forEach((u: any) => {
      const wedding = weddings.find(w => w.id === u.wedding_id);
      items.push({ text: `Published announcement: "${u.title}"`, sub: wedding ? wedding.couple_names : "Live update", ts: new Date(u.created_at || Date.now()).getTime(), wedding, icon: <Megaphone size={14} className="text-[#A8A29E]" /> });
    });
    return items.sort((a, b) => b.ts - a.ts).slice(0, 12);
  }, [weddings]);

  const createWedding = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCouple.trim()) return;
    const slug = (newSlug.trim() || newCouple.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 60);
    const code = generateCoupleCode(newCouple.trim());
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
    toast.success(`Celebration created! Access Code: ${code}`);
    setDetailWedding(wedding);
    setNewCouple(""); setNewSlug(""); setNewDate(""); setNewVenue(""); setShowCreate(false);
  };

  const duplicateWedding = (w: any) => {
    const copySlug = `${w.slug}-copy-${Date.now().toString().slice(-4)}`;
    const copyNames = `${w.couple_names} Copy`;
    const newWedding = store.insert("weddings", {
      ...w,
      id: undefined,
      slug: copySlug,
      access_code: generateCoupleCode(copyNames),
      couple_names: copyNames,
      published: false,
      created_at: new Date().toISOString(),
    });
    toast.success(`Duplicated celebration: ${copyNames}`);
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
    setDeleteWeddingConfirm(w);
  };

  const performDeleteWedding = (w: any) => {
    store.remove("weddings", w.id);
    ["events", "gallery", "guest_photos", "rsvps", "guest_moments", "checkins", "updates", "accommodations", "venue_markers"].forEach(t => {
      store.where(t as any, (row: any) => row.wedding_id === w.id).forEach((row: any) => store.remove(t as any, row.id));
    });
    toast.success("Wedding deleted");
    refresh();
  };

  const shareCoupleAccess = (w: any) => {
    const loginUrl = `${window.location.origin}/couple-login`;
    const directUrl = `${window.location.origin}/couple/${w.slug}/dashboard`;
    const message = `Welcome to ForeverVow! Here are your Couple Dashboard access details for ${w.couple_names}:\n\nDirect Dashboard Link: ${directUrl}\nLogin Portal: ${loginUrl}\nAccess Code: ${w.access_code}`;
    navigator.clipboard.writeText(message);
    toast.success(`Copied Couple Link & Code (${w.access_code}) for ${w.couple_names}!`);
  };

  const importCSV = (file: File) => {
    const targetWeddingId = filteredWeddings[0]?.id || weddings[0]?.id;
    if (!targetWeddingId) { toast.error("Create a wedding before importing guests"); return; }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = (results.data as any[]).filter(Boolean);
          if (!rows.length) { toast.error("CSV is empty."); return; }

          const headers = Object.keys(rows[0]);
          const detected = detectSchema(headers, rows);
          const mapping = buildMapping(headers, detected);
          const normalized = rows.map(row => normalizeRow(row, mapping));
          const validation = validateRows(normalized, mapping);

          let count = 0;
          normalized.forEach((guest: any) => {
            if (!guest.guest_name) return;
            store.insert("rsvps", {
              wedding_id: targetWeddingId,
              guest_name: guest.guest_name,
              email: guest.email || null,
              attending: guest.attending || "pending",
              guest_count: guest.guest_count || 1,
              dietary_preference: guest.dietary_preference || null,
              message: guest.message || null,
              submitted_at: new Date().toISOString(),
            });
            count++;
          });

          const history = JSON.parse(localStorage.getItem("fv_csv_import_history") || "[]");
          localStorage.setItem("fv_csv_import_history", JSON.stringify([
            {
              id: Date.now(),
              count,
              status: validation.errors.length ? "Imported with warnings" : "Success",
              file: file.name,
              wedding: targetWeddingId,
              confidence: mapping.confidence,
              warnings: validation.warnings,
              errors: validation.errors,
              created_at: new Date().toISOString(),
            },
            ...history,
          ].slice(0, 20)));

          setImportPanel({ file: file.name, count, mapping, validation, headers });
          toast.success(`Imported ${count} guests · AI confidence ${mapping.confidence}%`);
          refresh();
        } catch (error) {
          toast.error("Import failed. Please check the file and try again.");
        }
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

  const FIELD_ALIASES: Record<string, string[]> = {
    guest_name: ["name", "full name", "guest", "attendee", "first name", "last name", "first name(s)"],
    email: ["email", "e-mail", "email address", "mail"],
    attending: ["attending", "rsvp", "status", "response", "will attend", "attendance"],
    guest_count: ["guests", "count", "party size", "party", "plus one", "number of guests"],
    dietary_preference: ["dietary", "diet", "food", "meal", "allergies", "dietary preference"],
    message: ["message", "note", "comment", "notes", "special request", "song"],
  };

  function findHeader(headers: string[], regex: RegExp) {
    return headers.find((header) => regex.test(header));
  }

  function detectSchema(headers: string[], rows: any[]) {
    const detected: Record<string, string> = {};
    headers.forEach((header) => {
      const normalized = header.toLowerCase().replace(/[_-]/g, " ").trim();
      for (const target of Object.keys(FIELD_ALIASES)) {
        if (FIELD_ALIASES[target].some((alias) => normalized === alias || normalized.includes(alias))) {
          detected[target] = header;
          break;
        }
      }
      if (!Object.values(detected).includes(header) && /name/i.test(header)) {
        detected.guest_name = header;
      }
    });

    const sample = rows.slice(0, 5);
    const sampleText = JSON.stringify(sample).toLowerCase();
    if (!detected.attending && /yes|no|pending|declined|maybe/.test(sampleText)) {
      detected.attending = findHeader(headers, /status|attending|rsvp/i) || detected.attending;
    }
    if (!detected.dietary_preference && /vegan|vegetarian|halal|gluten/.test(sampleText)) {
      detected.dietary_preference = findHeader(headers, /diet|food|meal/i) || detected.dietary_preference;
    }
    if (!detected.guest_count && /\b[1-9]\b/.test(sampleText)) {
      detected.guest_count = findHeader(headers, /count|size|number|guests|party/i) || detected.guest_count;
    }
    return detected;
  }

  function buildMapping(headers: string[], detected: Record<string, string>) {
    const matches: { from: string; to: string; confidence: number }[] = [];
    Object.entries(detected).forEach(([target, source]) => {
      if (!source) return;
      const confidence = target === "guest_name" ? 95 : target === "attending" ? 88 : 90;
      matches.push({ from: source, to: target, confidence });
    });
    const overall = matches.length ? Math.round(matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length) : 0;
    return { matches, confidence: overall, headers };
  }

  function normalizeRow(row: any, mapping: any) {
    const guest: any = { guest_count: 1 };
    mapping.matches.forEach((m: any) => {
      const value = row[m.from];
      if (value === undefined || value === null || value === "") return;
      if (m.to === "attending") {
        const lower = String(value).toLowerCase();
        if (["yes", "y", "true", "1", "confirmed", "attending"].includes(lower)) guest.attending = "confirmed";
        else if (["no", "n", "false", "0", "declined"].includes(lower)) guest.attending = "declined";
        else if (["maybe", "?", "unsure"].includes(lower)) guest.attending = "maybe";
        else guest.attending = "pending";
      } else if (m.to === "guest_count") {
        const n = parseInt(String(value).replace(/[^\d]/g, ""), 10);
        guest.guest_count = n > 0 ? n : 1;
      } else {
        guest[m.to] = String(value).trim();
      }
    });
    if (!guest.guest_name) {
      const nameCandidates = Object.values(row).filter((value) => typeof value === "string" && String(value).trim().length > 1);
      if (nameCandidates.length) guest.guest_name = String(nameCandidates[0]).trim();
    }
    return guest;
  }

  function validateRows(rows: any[], mapping: any) {
    const warnings: string[] = [];
    const errors: string[] = [];
    const missingNames = rows.filter((r) => !r.guest_name).length;
    if (missingNames > 0) warnings.push(`${missingNames} rows missing a name were skipped.`);
    if (!mapping.matches.find((m: any) => m.to === "attending")) warnings.push("No RSVP status column detected — defaulting to Pending.");
    if (!mapping.matches.find((m: any) => m.to === "email")) warnings.push("No email column detected — guests will not receive email updates.");
    if (mapping.confidence < 70) warnings.push("AI mapping confidence is low — review results before publishing.");
    if (!rows.length) errors.push("CSV contained no usable rows.");
    return { warnings, errors };
  }

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
    { label: "Season Revenue", value: stats.revenue, icon: <DollarSign size={16} />, filter: "all" as StatusFilter },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: <FileText size={16} />, filter: "draft" as StatusFilter },
    { label: "Active Weddings", value: stats.active, icon: <Zap size={16} />, filter: "published" as StatusFilter },
    { label: "Upcoming Weddings", value: stats.upcoming, icon: <Calendar size={16} />, filter: "upcoming" as StatusFilter },
    { label: "Ready to Publish", value: stats.draft, icon: <Edit3 size={16} />, filter: "draft" as StatusFilter },
    { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={16} />, filter: "completed" as StatusFilter },
    { label: "Total Guests", value: stats.guests, icon: <Users size={16} />, filter: "all" as StatusFilter },
    { label: "Confirmed RSVPs", value: stats.rsvps, icon: <FileSpreadsheet size={16} />, filter: "all" as StatusFilter },
    { label: "Wedding Media", value: stats.photos, icon: <Image size={16} />, filter: "all" as StatusFilter },
    { label: "Guest Messages", value: stats.messages, icon: <Bell size={16} />, filter: "all" as StatusFilter },
  ];

  const mostViewed = weddings.slice().sort((a, b) => Number(localStorage.getItem(`wb_viewed_${b.id}`) || 0) - Number(localStorage.getItem(`wb_viewed_${a.id}`) || 0))[0];
  const avgGuests = weddings.length ? Math.round(stats.guests / weddings.length) : 0;
  const avgRsvp = weddings.length ? Math.round(weddings.reduce((sum, w) => sum + rsvpProgress(w.id), 0) / weddings.length) : 0;
  const csvHistory = JSON.parse(localStorage.getItem("fv_csv_import_history") || "[]") as any[];
  const adminGreeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const platformNotifications = [
    { title: "Wedding Published", sub: weddings.find(w => w.published)?.couple_names || "No published weddings yet", tone: "green" },
    { title: "CSV Import", sub: csvHistory[0] ? `${csvHistory[0].count} records · ${csvHistory[0].status}` : "No imports recorded", tone: "gold" },
    { title: "Storage", sub: `${Math.min(96, 28 + stats.photos * 6)}% used`, tone: stats.photos > 8 ? "gold" : "green" },
    { title: "Wedding Tomorrow", sub: weddings.find(w => w.wedding_date && differenceInDays(new Date(w.wedding_date), new Date()) === 1)?.couple_names || "None scheduled", tone: "blue" },
  ];

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] pb-20">
      {/* Floating Top Navigation */}
      <header className="sticky top-4 z-40 mx-auto max-w-[1520px] px-4 md:px-8">
        <div className="glass-obsidian rounded-full h-[70px] px-6 flex items-center justify-between border border-white/[0.1] shadow-2xl">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853]/30 to-[#B8872E]/10 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853]">
              <Shield size={18} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#D4A853] font-semibold">ForeverVow Studio</div>
              <div className="display text-[18px] text-[#FAF7F2] -mt-0.5 font-medium">Wedding Home</div>
            </div>
          </div>

          {/* Desktop Wide Spotlight Search Pill */}
          <button
            onClick={() => setSpotlightOpen(true)}
            className="mx-4 hidden md:flex flex-1 max-w-lg items-center gap-3 px-4.5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#A8A29E] text-[13px] hover:bg-white/[0.08] hover:border-[#D4A853]/40 transition-all group min-h-[44px]"
          >
            <Search size={15} className="text-[#D4A853]" />
            <span className="font-medium text-[#FAF7F2]/80 group-hover:text-[#FAF7F2]">Search weddings, couples, guests, emails, or codes...</span>
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-[#A8A29E]">
              ⌘K
            </span>
          </button>

          {/* Mobile Collapsed Search Magnifying Glass Icon */}
          <button
            onClick={() => setSpotlightOpen(true)}
            className="flex md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] items-center justify-center text-[#D4A853] transition ml-auto mr-2 shrink-0"
            title="Search Weddings"
          >
            <Search size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Client Communication Alerts Bell */}
            <button
              onClick={() => toast.info(`${stats.unreadClientMessages} unread client messages across active celebrations`)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2] relative transition shrink-0"
              title="Client Communication Alerts"
            >
              <Bell size={16} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A853] border-2 border-[#0C0A09] absolute top-2 right-2 animate-pulse" />
            </button>

            {/* Create Button: Full text on desktop, '+' gold circle on mobile */}
            <button
              onClick={() => setShowCreate(true)}
              className="fv-btn-primary !py-2.5 !px-5 text-[12px] hidden sm:inline-flex min-h-[44px] items-center gap-1.5 shrink-0"
            >
              <Plus size={15} /> Create Wedding
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex sm:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8872E] text-[#0C0A09] items-center justify-center shadow-lg hover:scale-105 transition shrink-0"
              title="Create Wedding"
            >
              <Plus size={20} />
            </button>

            <button
              onClick={logout}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2] transition shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1520px] px-4 md:px-8 pt-8 space-y-10">
        {/* Hero Command Banner & Responsive Stacking Order */}
        <section className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-stretch">
          <div className="order-1 lg:col-span-8 glass-obsidian rounded-[36px] p-8 md:p-14 relative overflow-hidden flex flex-col justify-between border border-white/[0.1] min-h-[320px]">
            {/* Ambient luxury lighting */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#D4A853]/20 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#C97B7B]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl py-2">
              <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.24em] text-[#D4A853] font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-[#7A9E7E] animate-pulse" /> {adminGreeting}, Wedding Director
              </div>
              <h1 className="display text-[44px] md:text-[64px] leading-[0.92] text-[#FAF7F2]">
                Wedding Studio <span className="script fv-gradient-text">Headquarters</span>
              </h1>
              <p className="text-[15px] text-[#A8A29E] max-w-xl mt-4 leading-relaxed">
                Manage beautiful wedding celebrations, assist couples, and orchestrate luxury guest experiences with effortless elegance and calm precision.
              </p>
            </div>

            {/* Core Stats inside Hero Card - Essential for mobile when lower stats row is hidden */}
            <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/[0.08]">
              <div>
                <div className="display text-[28px] md:text-[32px] text-[#D4A853]">{stats.total}</div>
                <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Total Weddings</div>
              </div>
              <div>
                <div className="display text-[28px] md:text-[32px] text-[#FAF7F2]">{stats.revenue}</div>
                <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Expected Revenue</div>
              </div>
              <div>
                <div className="display text-[28px] md:text-[32px] text-[#FAF7F2]">{stats.active}</div>
                <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Active Weddings</div>
              </div>
              <div>
                <div className="display text-[28px] md:text-[32px] text-[#7A9E7E]">{stats.guests}</div>
                <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#A8A29E] mt-1 font-medium">Total Guests</div>
              </div>
            </div>
          </div>

          {/* Today's Priorities - Order 2 on Mobile immediately below Hero */}
          <GlassCard variant="frost" padding="md" className="order-2 lg:col-span-4 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="wedding-label">Today's Priorities</span>
                <span className="text-[11px] text-[#D4A853] font-mono flex items-center gap-1.5">
                  <Sparkles size={12} /> HELPFUL ACTIONS
                </span>
              </div>
              <div className="space-y-2.5 pt-1">
                {stats.draft === 0 ? (
                  <div className="p-3 rounded-[14px] bg-white/[0.01] border border-white/[0.03] flex items-center justify-between text-[12px] opacity-60 min-h-[44px]">
                    <span className="text-[#FAF7F2]/80">Weddings waiting for review</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#7A9E7E]">
                      <CheckCircle2 size={13} /> Caught up
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#D4A853]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                    <span className="text-[#FAF7F2] font-medium">Weddings waiting for review</span>
                    <span className="font-mono font-bold text-[#D4A853] bg-[#D4A853]/15 px-2.5 py-0.5 rounded-full">{stats.draft}</span>
                  </div>
                )}
                {stats.upcoming === 0 ? (
                  <div className="p-3 rounded-[14px] bg-white/[0.01] border border-white/[0.03] flex items-center justify-between text-[12px] opacity-60 min-h-[44px]">
                    <span className="text-[#FAF7F2]/80">Weddings happening soon</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8A29E]">
                      <CheckCircle2 size={13} /> None scheduled
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#7A9E7E]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                    <span className="text-[#FAF7F2] font-medium">Weddings happening soon</span>
                    <span className="font-mono font-bold text-[#7A9E7E] bg-[#7A9E7E]/15 px-2.5 py-0.5 rounded-full">{stats.upcoming}</span>
                  </div>
                )}
                {/* Client Communication Alerts */}
                <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#A882DD]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                  <span className="text-[#FAF7F2] font-medium flex items-center gap-2">
                    <MessageCircle size={14} className="text-[#A882DD]" /> Unread client messages
                  </span>
                  <span className="font-mono font-bold text-[#A882DD] bg-[#A882DD]/15 px-2.5 py-0.5 rounded-full">{stats.unreadClientMessages}</span>
                </div>
                {/* Vendor Contract Status */}
                <div className="p-3 rounded-[14px] bg-white/[0.03] border border-[#EAB308]/30 flex items-center justify-between text-[12px] min-h-[44px]">
                  <span className="text-[#FAF7F2] font-medium flex items-center gap-2">
                    <Briefcase size={14} className="text-[#EAB308]" /> Pending vendor contracts
                  </span>
                  <span className="font-mono font-bold text-[#EAB308] bg-[#EAB308]/15 px-2.5 py-0.5 rounded-full">{stats.pendingContracts} Action Req</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions - Order 3 on Mobile further down so it doesn't block core metrics */}
          <GlassCard variant="obsidian" padding="lg" className="order-3 lg:col-span-4 border border-white/[0.1] flex flex-col justify-between">
            <div>
              <div className="wedding-label mb-3">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowCreate(true)}
                  className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-[#D4A853]/10 hover:border-[#D4A853]/30 text-left transition group min-h-[64px]"
                >
                  <Plus className="w-5 h-5 text-[#D4A853] mb-2 group-hover:scale-110 transition" />
                  <div className="text-[13px] font-semibold text-[#FAF7F2]">Create Wedding</div>
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-left transition group min-h-[64px]"
                >
                  <Upload className="w-5 h-5 text-[#D4A853] mb-2 group-hover:scale-110 transition" />
                  <div className="text-[13px] font-semibold text-[#FAF7F2]">Import Wedding</div>
                </button>
                <button
                  onClick={() => setToolPanel("templates")}
                  className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-left transition min-h-[64px]"
                >
                  <LayoutTemplate className="w-5 h-5 text-[#A8A29E] mb-2" />
                  <div className="text-[13px] font-semibold text-[#FAF7F2]">Wedding Templates</div>
                </button>
                <button
                  onClick={exportCsv}
                  className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-left transition min-h-[64px]"
                >
                  <Download className="w-5 h-5 text-[#A8A29E] mb-2" />
                  <div className="text-[13px] font-semibold text-[#FAF7F2]">View Reports</div>
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && importCSV(e.target.files[0])} />
          </GlassCard>
        </section>

        {/* Filter & Metric Arc - Hidden on mobile via hidden md:block for Ruthless Consolidation */}
        <section className="hidden md:block">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {platformCards.slice(0, 6).map(card => (
              <button
                key={card.label}
                onClick={() => setFilter(card.filter)}
                className={`text-left p-5 rounded-[24px] transition-all duration-300 border min-h-[100px] ${
                  filter === card.filter
                    ? "glass-aurora border-[#D4A853]/40 shadow-[0_0_24px_-4px_rgba(212,168,83,0.25)]"
                    : "glass-obsidian border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-[12px] bg-white/[0.06] text-[#D4A853] flex items-center justify-center">
                    {card.icon}
                  </div>
                  {filter === card.filter && <span className="w-2 h-2 rounded-full bg-[#D4A853]" />}
                </div>
                <div className="display text-[28px] text-[#FAF7F2] leading-none">{card.value}</div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#A8A29E] mt-2 font-medium">{card.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Main Wedding Workspace & Activity Feed */}
        <section className="grid xl:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-6">
            <GlassCard variant="obsidian" padding="none" className="border border-white/[0.1] overflow-hidden">
              {/* Header Bar */}
              <div className="p-6 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="wedding-label">Wedding Portfolio</div>
                  <h3 className="display text-[24px] text-[#FAF7F2] mt-0.5">All Weddings ({filteredWeddings.length})</h3>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative min-w-[240px]">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Filter celebrations..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-[13px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                    />
                  </div>

                  <div className="hidden md:inline-flex rounded-full bg-white/[0.04] border border-white/[0.08] p-1">
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`px-4 py-2 min-h-[44px] rounded-full text-[12px] font-medium transition flex items-center justify-center ${viewMode === "cards" ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E]"}`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-4 py-2 min-h-[44px] rounded-full text-[12px] font-medium transition flex items-center justify-center ${viewMode === "table" ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E]"}`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode("timeline")}
                      className={`px-4 py-2 min-h-[44px] rounded-full text-[12px] font-medium transition flex items-center justify-center gap-1.5 ${viewMode === "timeline" ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E]"}`}
                    >
                      <Calendar size={13} /> Timeline
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="px-6 py-3.5 bg-[#D4A853]/10 border-b border-[#D4A853]/20 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-[13px] font-medium text-[#E8C97A]">
                    <strong>{selectedIds.length}</strong> celebrations selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => bulkAction("publish")} className="px-3.5 py-1.5 rounded-full bg-[#D4A853] text-[#0C0A09] text-[12px] font-semibold">Publish</button>
                    <button onClick={() => bulkAction("unpublish")} className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[12px] hover:bg-white/[0.1]">Unpublish</button>
                    <button onClick={() => bulkAction("archive")} className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[12px] hover:bg-white/[0.1]">Archive</button>
                    <button onClick={() => bulkAction("delete")} className="px-3.5 py-1.5 rounded-full bg-[#C97B7B]/20 border border-[#C97B7B]/30 text-[#E4A5A5] text-[12px]">Delete</button>
                  </div>
                </div>
              )}

              {/* Cards Grid View - Default strictly to cards on mobile viewports, or when viewMode is cards */}
              {(viewMode === "cards" || (viewMode !== "cards" && typeof window !== "undefined")) && (
                <div className={`p-6 grid md:grid-cols-2 gap-6 ${viewMode !== "cards" ? "block md:hidden" : "block"}`}>
                  {filteredWeddings.map(w => {
                    const stage = getWeddingStage(w);
                    const statusStyle = getStatusStyle(stage);
                    const guestCount = weddingGuestCount(w.id);
                    const progress = rsvpProgress(w.id);

                    return (
                      <div
                        key={w.id}
                        className="glass-frost rounded-[24px] border border-white/[0.08] overflow-hidden hover:border-[#D4A853]/40 transition-all duration-300 group flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Cover */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={w.cover_image || w.hero_image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-transparent" />
                            
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5 ${statusStyle.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                {statusStyle.label}
                              </span>

                              {(!w.published || w.slug.includes("elara")) && (
                                <span
                                  className="px-2.5 py-1 rounded-full bg-[#0C0A09]/85 backdrop-blur-md border border-[#D4A853] text-[#D4A853] text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(212,168,83,0.4)] animate-pulse"
                                  title="Vendor action required: Contract signature & deposit pending"
                                >
                                  <Briefcase size={12} /> Vendor Req
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="display text-[26px] text-[#FAF7F2] leading-none">{w.couple_names}</div>
                              <div className="flex items-center justify-between gap-2 mt-1.5">
                                <span className="text-[12px] text-[#A8A29E] font-mono">/{w.slug}</span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#FDE047] text-[10px] font-mono font-bold">
                                  <KeyRound size={11} /> Code: {w.access_code}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats details */}
                          <div className="p-5 grid grid-cols-3 gap-2 border-b border-white/[0.06] text-center">
                            <div>
                              <div className="text-[18px] font-mono font-semibold text-[#FAF7F2]">{guestCount}</div>
                              <div className="text-[10px] uppercase tracking-wider text-[#78716C]">Guests</div>
                            </div>
                            <div>
                              <div className="text-[18px] font-mono font-semibold text-[#D4A853]">{progress}%</div>
                              <div className="text-[10px] uppercase tracking-wider text-[#78716C]">RSVP Rate</div>
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-[#FAF7F2] pt-0.5">{w.wedding_date ? format(new Date(w.wedding_date), "MMM d") : "TBD"}</div>
                              <div className="text-[10px] uppercase tracking-wider text-[#78716C]">Ceremony</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions footer with generous 44x44px touch targets */}
                        <div className="p-4 bg-white/[0.02] flex items-center justify-between gap-2">
                          <button
                            onClick={() => setDetailWedding(w)}
                            className="flex-1 py-2.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#FAF7F2] text-[12px] font-medium transition text-center min-h-[44px]"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => { localStorage.setItem("couple_wedding_id", w.id); localStorage.setItem("couple_wedding_slug", w.slug); window.open(`/couple/${w.slug}/dashboard`, "_blank"); }}
                            className="flex-1 py-2.5 px-3 rounded-full bg-[#EAB308] hover:bg-[#FDE047] text-[#09090B] text-[12px] font-semibold transition text-center min-h-[44px]"
                          >
                            Dashboard
                          </button>
                          <button
                            onClick={() => shareCoupleAccess(w)}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#EAB308]/15 hover:bg-[#EAB308]/30 border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] transition shadow-md shrink-0"
                            title={`Copy & Send Couple Access Link (Code: ${w.access_code})`}
                          >
                            <Send size={15} />
                          </button>
                          <Link
                            to={`/wedding/${w.slug}?preview=1`}
                            target="_blank"
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] shrink-0"
                            title="Preview Guest Site"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table View */}
              {viewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-left">
                    <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[11px] uppercase tracking-[0.16em] text-[#78716C]">
                      <tr>
                        <th className="p-4 w-10"><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? filteredWeddings.map(w => w.id) : [])} className="accent-[#D4A853]" /></th>
                        <th className="p-4">Celebration</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Stage</th>
                        <th className="p-4">Guests</th>
                        <th className="p-4">RSVP Rate</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredWeddings.map(w => {
                        const stage = getWeddingStage(w);
                        const statusStyle = getStatusStyle(stage);
                        const guestCount = weddingGuestCount(w.id);
                        const progress = rsvpProgress(w.id);

                        return (
                          <tr key={w.id} className="hover:bg-white/[0.03] transition">
                            <td className="p-4"><input type="checkbox" checked={selectedIds.includes(w.id)} onChange={() => setSelectedIds(ids => ids.includes(w.id) ? ids.filter(x => x !== w.id) : [...ids, w.id])} className="accent-[#D4A853]" /></td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={w.cover_image || w.hero_image} alt="" className="w-11 h-11 rounded-[12px] object-cover border border-white/[0.1]" />
                                <div>
                                  <button onClick={() => setDetailWedding(w)} className="font-semibold text-[#FAF7F2] hover:text-[#D4A853] block">{w.couple_names}</button>
                                  <div className="text-[11px] text-[#78716C] font-mono">/{w.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-[#A8A29E]">{w.wedding_date ? format(new Date(w.wedding_date), "MMM d, yyyy") : "TBD"}</td>
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${statusStyle.bg}`}>{stage}</span></td>
                            <td className="p-4 font-mono text-[#FAF7F2]">{guestCount}</td>
                            <td className="p-4">
                              <div className="w-24">
                                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full bg-[#D4A853]" style={{ width: `${progress}%` }} /></div>
                                <div className="text-[11px] text-[#78716C] mt-1 font-mono">{progress}%</div>
                              </div>
                            </td>
                            <td className="p-4"><span className={`text-[11px] font-semibold ${w.published ? "text-[#7A9E7E]" : "text-[#78716C]"}`}>{w.published ? "Public" : "Private"}</span></td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button onClick={() => { localStorage.setItem("couple_wedding_id", w.id); localStorage.setItem("couple_wedding_slug", w.slug); window.open(`/couple/${w.slug}/dashboard`, "_blank"); }} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#D4A853]" title="Open Dashboard">
                                  <Gauge size={14} />
                                </button>
                                <button onClick={() => shareCoupleAccess(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#EAB308]/20 text-[#EAB308]" title={`Send Couple Link & Code (${w.access_code})`}>
                                  <Send size={14} />
                                </button>
                                <Link to={`/wedding/${w.slug}?preview=1`} target="_blank" className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Preview Site">
                                  <ExternalLink size={14} />
                                </Link>
                                <button onClick={() => togglePublish(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Toggle Publish">
                                  {w.published ? (<EyeOff size={14} />) : (<Eye size={14} />)}
                                </button>
                                <button onClick={() => duplicateWedding(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-[#A8A29E]" title="Duplicate">
                                  <Layers size={14} />
                                </button>
                                <button onClick={() => deleteWedding(w)} className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#C97B7B]/20 text-[#E4A5A5]" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Timeline / Calendar View */}
              {viewMode === "timeline" && (
                <div className="hidden md:block p-8 space-y-8 overflow-x-auto">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div>
                      <h4 className="text-[16px] font-semibold text-[#FAF7F2]">Celebration Milestones & Calendar Roadmap</h4>
                      <p className="text-[12px] text-[#A8A29E]">Visual schedule of cake tastings, dress fittings, vendor deposits, and final walkthroughs across all active studios.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-[11px] font-mono font-semibold border border-[#D4A853]/30">Season 2026</span>
                  </div>

                  <div className="relative pl-8 border-l-2 border-[#D4A853]/30 space-y-8 my-6">
                    {filteredWeddings.map((w) => {
                      const milestones = [
                        { label: "Vendor Contracts Signed & Deposit Due", offset: -30, tone: "text-[#EAB308]", bg: "bg-[#EAB308]/15 border-[#EAB308]/30", icon: <Briefcase size={13} /> },
                        { label: "Menu & Cake Tasting Rehearsal", offset: -21, tone: "text-[#A882DD]", bg: "bg-[#A882DD]/15 border-[#A882DD]/30", icon: <Sparkles size={13} /> },
                        { label: "Final Walk-through & Lighting Setup", offset: -7, tone: "text-[#7A9E7E]", bg: "bg-[#7A9E7E]/15 border-[#7A9E7E]/30", icon: <CheckCircle2 size={13} /> },
                        { label: "Ceremony & Reception Orchestration", offset: 0, tone: "text-[#D4A853]", bg: "bg-[#D4A853]/20 border-[#D4A853]/40", icon: <Calendar size={13} /> },
                      ];

                      return (
                        <div key={w.id} className="relative group">
                          <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-[#0C0A09] border-2 border-[#D4A853] flex items-center justify-center shadow-[0_0_12px_rgba(212,168,83,0.5)]" />
                          <div className="glass-frost p-6 rounded-[22px] border border-white/[0.08] hover:border-[#D4A853]/40 transition">
                            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                              <div className="flex items-center gap-3">
                                <h5 className="display text-[20px] text-[#FAF7F2]">{w.couple_names}</h5>
                                <span className="text-[12px] font-mono text-[#A8A29E] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                                  {w.wedding_date ? format(new Date(w.wedding_date), "MMMM d, yyyy") : "Date TBD"}
                                </span>
                              </div>
                              <button onClick={() => setDetailWedding(w)} className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[12px] font-medium text-[#FAF7F2] transition min-h-[44px]">Manage Celebration</button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                              {milestones.map((m, mIdx) => (
                                <div key={mIdx} className={`p-3.5 rounded-[16px] border ${m.bg} flex flex-col justify-between`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={m.tone}>{m.icon}</span>
                                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${m.tone}`}>{w.wedding_date ? format(new Date(new Date(w.wedding_date).getTime() + m.offset * 86400000), "MMM d") : "TBD"}</span>
                                  </div>
                                  <div className="text-[12px] font-medium text-[#FAF7F2] leading-snug">{m.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Activity Feed & Tools */}
          <aside className="space-y-6">
            <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1]">
              <div className="flex items-center justify-between mb-5">
                <span className="wedding-label">Recent Wedding Activity</span>
                <span className="text-[11px] font-mono text-[#A8A29E]">Live Updates</span>
              </div>

              <div className="space-y-3.5">
                {activity.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => item.wedding && setDetailWedding(item.wedding)}
                    className="w-full text-left flex items-start gap-3.5 p-3 rounded-[16px] bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.08] transition group"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:border-[#D4A853]/30 transition">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#FAF7F2] truncate group-hover:text-[#D4A853] transition">{item.text}</div>
                      <div className="text-[12px] text-[#A8A29E] truncate">{item.sub}</div>
                      <div className="text-[11px] font-mono text-[#A8A29E] mt-1">{formatDistanceToNow(new Date(item.ts), { addSuffix: true })}</div>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard variant="frost" padding="lg" className="border border-white/[0.08]">
              <div className="wedding-label mb-4">Import History</div>
              <div className="space-y-3">
                {csvHistory.length === 0 ? (
                  <div className="py-6 text-center text-[12px] text-[#A8A29E]">No guest imports recorded yet.</div>
                ) : csvHistory.slice(0, 4).map(row => (
                  <div key={row.id} className="p-3 rounded-[14px] bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[12px]">
                    <div className="truncate pr-2">
                      <div className="font-medium text-[#FAF7F2] truncate">{row.file}</div>
                      <div className="text-[11px] text-[#A8A29E]">{formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}</div>
                    </div>
                    <span className="font-mono text-[#7A9E7E] shrink-0">{row.count} rows</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </aside>
        </section>
      </main>

      {/* ────────────────── MODALS & OVERLAYS ────────────────── */}

      {/* Create Wedding Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
          <form onSubmit={createWedding} className="glass-obsidian rounded-[32px] border border-white/[0.15] p-8 w-full max-w-2xl shadow-2xl grid md:grid-cols-2 gap-5 relative">
            <div className="md:col-span-2 flex items-start justify-between">
              <div>
                <div className="wedding-label mb-1">New Wedding Celebration</div>
                <h2 className="display text-[32px] text-[#FAF7F2]">Create Wedding</h2>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2]"><X size={16}/></button>
            </div>

            <div>
              <label className="block wedding-label mb-2">Couple Names</label>
              <input required value={newCouple} onChange={e => setNewCouple(e.target.value)} placeholder="Elara & Julian" className="fv-input" />
            </div>
            <div>
              <label className="block wedding-label mb-2">Custom Slug</label>
              <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="elara-julian" className="fv-input" />
            </div>
            <div>
              <label className="block wedding-label mb-2">Wedding Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="fv-input" />
            </div>
            <div>
              <label className="block wedding-label mb-2">Primary Venue</label>
              <input value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="Villa Rose, Como" className="fv-input" />
            </div>

            <div className="md:col-span-2">
              <label className="block wedding-label mb-3">Design Template</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {templateLibrary.map(t => (
                  <button key={t.name} type="button" onClick={() => setTemplate(t.name)} className={`rounded-[16px] border overflow-hidden text-left transition ${template === t.name ? "border-[#D4A853] ring-2 ring-[#D4A853]/40" : "border-white/[0.08] opacity-60 hover:opacity-100"}`}>
                    <img src={t.image} alt="" className="h-20 w-full object-cover" />
                    <div className="p-2.5 text-[11px] font-semibold text-[#FAF7F2]">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button type="button" onClick={() => setShowCreate(false)} className="fv-btn-ghost !py-3 !px-6 text-[13px]">Cancel</button>
              <button type="submit" className="fv-btn-primary !py-3 !px-7 text-[13px]">Create & Launch Wedding</button>
            </div>
          </form>
        </div>
      )}

      {/* Guest List CSV Import Panel */}
      {importPanel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setImportPanel(null)}>
          <div className="w-full max-w-3xl glass-obsidian rounded-[32px] border border-white/[0.15] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="wedding-label text-[#D4A853]">Guest List Import</div>
                <div className="display text-[26px] text-[#FAF7F2] mt-0.5">{importPanel.file}</div>
              </div>
              <button onClick={() => setImportPanel(null)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"><X size={15}/></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.08]">
                <div><div className="display text-[28px] text-[#FAF7F2]">{importPanel.count}</div><div className="text-[10px] uppercase tracking-wider text-[#78716C]">Imported Guests</div></div>
                <div><div className="display text-[28px] text-[#D4A853]">{importPanel.mapping.confidence}%</div><div className="text-[10px] uppercase tracking-wider text-[#78716C]">Confidence Score</div></div>
                <div><div className="display text-[28px] text-[#7A9E7E]">{importPanel.mapping.matches.length}</div><div className="text-[10px] uppercase tracking-wider text-[#78716C]">Mapped Columns</div></div>
              </div>

              <div>
                <div className="wedding-label mb-3">Field Alignments</div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {importPanel.mapping.matches.map((m: any) => (
                    <div key={m.from} className="flex items-center justify-between rounded-[14px] bg-white/[0.02] border border-white/[0.06] px-4 py-2.5 text-[13px]">
                      <span className="font-semibold text-[#FAF7F2]">{m.from}</span>
                      <span className="text-[#A8A29E]">→ {m.to.replace(/_/g, " ")}</span>
                      <span className="text-[#D4A853] font-mono text-[12px]">{m.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button onClick={() => setImportPanel(null)} className="fv-btn-primary !py-2.5 !px-6 text-[12px]">Complete & Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool Module Panel */}
      {toolPanel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setToolPanel(null)}>
          <div className="w-full max-w-3xl glass-obsidian rounded-[32px] border border-white/[0.15] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
              <div><div className="wedding-label">Wedding Gallery</div><h2 className="display text-[28px] text-[#FAF7F2] capitalize">{toolPanel} Library</h2></div>
              <button onClick={() => setToolPanel(null)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"><X size={15}/></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {templateLibrary.map(t => (
                <div key={t.name} className="rounded-[20px] border border-white/[0.08] overflow-hidden bg-white/[0.02]">
                  <img src={t.image} alt="" className="h-32 w-full object-cover" />
                  <div className="p-4 font-semibold text-[14px] text-[#FAF7F2]">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wedding Detail Slide-Over */}
      {detailWedding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex justify-end" onClick={() => setDetailWedding(null)}>
          <div className="w-full max-w-2xl glass-obsidian h-full overflow-y-auto border-l border-white/[0.1] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
              <div><div className="wedding-label">Wedding Details</div><h2 className="display text-[32px] text-[#FAF7F2]">{detailWedding.couple_names}</h2></div>
              <button onClick={() => setDetailWedding(null)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"><X size={16}/></button>
            </div>

            <div className="space-y-6">
              <img src={detailWedding.cover_image || detailWedding.hero_image} alt="" className="w-full h-56 object-cover rounded-[24px] border border-white/[0.1]" />

              <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="wedding-label">Wedding Access & Links</div>
                <div className="flex items-center justify-between text-[13px]"><span className="text-[#A8A29E]">Guest Portal</span><code className="text-[#D4A853] font-mono">/wedding/{detailWedding.slug}</code></div>
                <div className="flex items-center justify-between text-[13px]"><span className="text-[#A8A29E]">Couple Dashboard</span><code className="text-[#D4A853] font-mono">/couple/{detailWedding.slug}/dashboard</code></div>
                <div className="flex items-center justify-between text-[13px]"><span className="text-[#A8A29E]">Access Code</span><code className="text-[#FAF7F2] font-mono bg-white/[0.08] px-2.5 py-1 rounded">{detailWedding.access_code}</code></div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button onClick={() => shareCoupleAccess(detailWedding)} className="w-full fv-btn-primary !bg-[#EAB308] !text-[#09090B] py-3.5 text-[13px] flex items-center justify-center gap-2 shadow-lg">
                  <Send size={15} /> Copy & Send Couple Access Kit ({detailWedding.access_code})
                </button>
                <div className="flex gap-3">
                  <button onClick={() => { localStorage.setItem("couple_wedding_id", detailWedding.id); localStorage.setItem("couple_wedding_slug", detailWedding.slug); window.open(`/couple/${detailWedding.slug}/dashboard`, "_blank"); }} className="flex-1 fv-btn-ghost py-3 text-[12px]">Launch Couple Dashboard</button>
                  <Link to={`/wedding/${detailWedding.slug}?preview=1`} target="_blank" className="flex-1 fv-btn-ghost py-3 text-[12px] text-center">Preview Guest Site</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight Search Modal */}
      {spotlightOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-start justify-center p-4 pt-[12vh]" onClick={() => setSpotlightOpen(false)}>
          <div className="w-full max-w-xl glass-obsidian rounded-[28px] border border-white/[0.15] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/[0.08] flex items-center gap-3.5">
              <Search size={18} className="text-[#D4A853]" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search celebrations, access codes, guests..." className="w-full bg-transparent text-[15px] text-[#FAF7F2] outline-none placeholder-[#78716C]" />
              <button onClick={() => setSpotlightOpen(false)} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center"><X size={14}/></button>
            </div>
            <div className="max-h-[380px] overflow-y-auto p-3 space-y-1.5">
              {filteredWeddings.slice(0, 6).map(w => (
                <button key={w.id} onClick={() => { setDetailWedding(w); setSpotlightOpen(false); }} className="w-full flex items-center gap-3.5 p-3 rounded-[16px] hover:bg-white/[0.06] text-left transition">
                  <img src={w.cover_image || w.hero_image} alt="" className="w-10 h-10 rounded-[12px] object-cover" />
                  <div className="flex-1 min-w-0"><div className="font-semibold text-[#FAF7F2] truncate">{w.couple_names}</div><div className="text-[11px] font-mono text-[#A8A29E]">/{w.slug}</div></div>
                  <ChevronRight size={15} className="text-[#78716C]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteWeddingConfirm}
        title="Delete Wedding"
        message={`Delete "${deleteWeddingConfirm?.couple_names}"? This removes all linked RSVPs, photos, and guestbook moments permanently.`}
        destructive
        confirmLabel="Delete Celebration"
        onCancel={() => setDeleteWeddingConfirm(null)}
        onConfirm={() => {
          if (deleteWeddingConfirm) {
            performDeleteWedding(deleteWeddingConfirm);
            setDeleteWeddingConfirm(null);
          }
        }}
      />
    </div>
  );
}