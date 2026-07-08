import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { Wedding } from "@/types/wedding";
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
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import { QRCodeModal } from "@/components/wedding/QRCodeModal";
import { CreateWeddingWizard, SystemHealthModule } from "@/components/admin";
import {
  AdminOverviewView,
  AdminUserManagementView,
  AdminVendorDirectoryView,
  AdminWeddingDetailsView,
  AdminAnalyticsReportsView,
  AdminSettingsView,
} from "@/features/admin/views";
import { supabase } from "@/utils/supabase";
import { WeddingService } from "@/services";
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
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "vendors" | "reports" | "settings">("overview");
  const [weddings, setWeddings] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards" | "timeline">("cards");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailWedding, setDetailWedding] = useState<any | null>(null);
  const [importPanel, setImportPanel] = useState<any | null>(null);
  const [toolPanel, setToolPanel] = useState<"templates" | "themes" | "assets" | "reports" | "users" | "settings" | "health" | null>(null);
  const [template, setTemplate] = useState(templateLibrary[0].name);
  const [newCouple, setNewCouple] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [deleteWeddingConfirm, setDeleteWeddingConfirm] = useState<any | null>(null);
  const [qrWedding, setQrWedding] = useState<any | null>(null);

  useEffect(() => {
    // ProtectedAdminRoute already verified the Supabase session + admin role.
    // Refresh data here.
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
    const allAnalytics = store.all("analytics");
    const views = allAnalytics.filter((r: Record<string, unknown>) => r.event_type === "page_view").length;
    const qr = allAnalytics.filter((r: Record<string, unknown>) => r.event_type === "qr_scan").length;
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

  const createWedding = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCouple.trim()) return;
    const slug = (newSlug.trim() || newCouple.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 60);
    const selectedTemplate = templateLibrary.find(t => t.name === template) || templateLibrary[0];
    
    const { data: wedding, error } = await WeddingService.createWeddingWithDefaults({
      slug,
      couple_names: newCouple.trim(),
      wedding_date: newDate || null,
      ceremony_time: "16:00",
      ceremony_venue: newVenue || null,
      cover_image: selectedTemplate.image,
      hero_image: selectedTemplate.image,
    }, template);

    if (error || !wedding) {
      toast.error(error || "Failed to create wedding");
      return;
    }

    toast.success(`Celebration created! Access Code: ${wedding.access_code}`);
    setDetailWedding(wedding);
    setNewCouple(""); setNewSlug(""); setNewDate(""); setNewVenue(""); setShowCreate(false);
    refresh();
  };

  const duplicateWedding = async (w: any) => {
    const copyNames = `${w.couple_names} Copy`;
    const { data: newWedding, error } = await WeddingService.duplicateWedding(w.id, copyNames);
    if (error || !newWedding) {
      toast.error(error || "Failed to duplicate celebration");
      return;
    }
    toast.success(`Duplicated celebration: ${copyNames}`);
    setDetailWedding(newWedding);
    refresh();
  };

  const archiveWedding = async (w: any) => {
    await WeddingService.archiveWedding(w.id);
    toast.success(`${w.couple_names} archived`);
    refresh();
  };

  const togglePublish = async (w: any) => {
    if (w.published) {
      await WeddingService.archiveWedding(w.id);
      toast.success("Wedding unpublished");
    } else {
      await WeddingService.publishWedding(w.id);
      toast.success("Wedding published");
    }
    refresh();
  };

  const deleteWedding = (w: any) => {
    setDeleteWeddingConfirm(w);
  };

  const performDeleteWedding = async (w: any) => {
    const { success, error } = await WeddingService.deleteWedding(w.id);
    if (!success) {
      toast.error(error || "Failed to delete wedding");
      return;
    }
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

  const logout = async () => {
    await supabase.auth.signOut();
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

  const mostViewed = weddings.slice().sort((a, b) => {
    const bViews = store.all("analytics").filter((r: Record<string, unknown>) => r.wedding_id === b.id && r.event_type === "page_view").length;
    const aViews = store.all("analytics").filter((r: Record<string, unknown>) => r.wedding_id === a.id && r.event_type === "page_view").length;
    return bViews - aViews;
  })[0];
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
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2] pb-24 md:pb-20">
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
        {/* Top Suite Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/[0.08] pb-4">
          {[
            { id: "overview", label: "Overview & Celebrations", icon: <Gauge size={16} /> },
            { id: "users", label: "Studio & Couple Users", icon: <Users size={16} /> },
            { id: "vendors", label: "Partner & Vendor Directory", icon: <Briefcase size={16} /> },
            { id: "reports", label: "Analytics & Export Cockpit", icon: <BarChart3 size={16} /> },
            { id: "settings", label: "Studio Governance Settings", icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setToolPanel(null);
              }}
              className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === tab.id
                  ? "bg-[#D4A853] text-[#0C0A09] border-[#D4A853] shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                  : "bg-white/[0.03] text-[#A8A29E] border-white/[0.08] hover:bg-white/[0.08] hover:text-[#FAF7F2]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <AdminOverviewView
            weddings={weddings}
            filteredWeddings={filteredWeddings}
            stats={stats}
            query={query}
            onQueryChange={setQuery}
            filter={filter}
            onFilterChange={setFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onBulkAction={bulkAction}
            onSelectWedding={setDetailWedding}
            onShareWedding={shareCoupleAccess}
            onTogglePublish={togglePublish}
            onDuplicateWedding={duplicateWedding}
            onDeleteWedding={(w) => setDeleteWeddingConfirm(w)}
            onOpenQR={setQrWedding}
            activity={activity}
            csvHistory={csvHistory}
            onShowCreate={() => setShowCreate(true)}
            onImportClick={() => fileRef.current?.click()}
            onOpenToolPanel={(panel) => {
              if (panel === "reports") setActiveTab("reports");
              else setToolPanel(panel as any);
            }}
            adminGreeting={adminGreeting}
            platformCards={platformCards}
            getWeddingStage={getWeddingStage}
            weddingGuestCount={weddingGuestCount}
            rsvpProgress={rsvpProgress}
          />
        )}

        {activeTab === "users" && (
          <AdminUserManagementView
            weddings={weddings}
            onSelectWedding={setDetailWedding}
            onShareWedding={shareCoupleAccess}
          />
        )}

        {activeTab === "vendors" && (
          <AdminVendorDirectoryView
            weddings={weddings}
            onSelectWedding={setDetailWedding}
          />
        )}

        {activeTab === "reports" && (
          <AdminAnalyticsReportsView
            weddings={weddings}
            stats={stats}
            onExportCsv={exportCsv}
          />
        )}

        {activeTab === "settings" && (
          <AdminSettingsView stats={stats} />
        )}
      </main>

      {/* ────────────────── MODALS & OVERLAYS ────────────────── */}

      {/* Create Wedding Wizard Modal */}
      {showCreate && (
        <CreateWeddingWizard
          onClose={() => setShowCreate(false)}
          onCreated={(newWed) => {
            setShowCreate(false);
            setDetailWedding(newWed);
            refresh();
          }}
        />
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
      {toolPanel === "health" && (
        <div className="fixed inset-0 z-50 bg-[#0C0A09] overflow-y-auto">
          <div className="fixed top-6 right-6 z-50">
            <button
              onClick={() => setToolPanel(null)}
              className="px-5 py-2.5 rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white font-bold text-sm flex items-center gap-2 border border-white/[0.2] backdrop-blur-md shadow-2xl transition"
            >
              <X size={18} /> Close Cockpit
            </button>
          </div>
          <SystemHealthModule />
        </div>
      )}
      {toolPanel && toolPanel !== "health" && (
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
        <AdminWeddingDetailsView
          wedding={detailWedding}
          onClose={() => setDetailWedding(null)}
          onShareAccess={shareCoupleAccess}
          onTogglePublish={togglePublish}
          onDuplicate={duplicateWedding}
          onDelete={(w) => deleteWedding(w)}
          onOpenQR={setQrWedding}
          getStage={getWeddingStage}
          guestCount={weddingGuestCount(detailWedding.id)}
          rsvpRate={rsvpProgress(detailWedding.id)}
        />
      )}

      <QRCodeModal
        open={!!qrWedding}
        onClose={() => setQrWedding(null)}
        slug={qrWedding?.slug || ""}
        coupleNames={qrWedding?.couple_names}
      />

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
      <MobileBottomNav
        items={[
          { id: "home", label: "Home", icon: <Gauge size={20} />, active: activeTab === "overview" && !toolPanel, onClick: () => { setActiveTab("overview"); setToolPanel(null); window.scrollTo({ top: 0, behavior: "smooth" }); } },
          { id: "search", label: "Search", icon: <Search size={20} />, onClick: () => setSpotlightOpen(true) },
          { id: "create", label: "Create", icon: <Plus size={22} />, accent: true, onClick: () => setShowCreate(true) },
          { id: "reports", label: "Reports", icon: <BarChart3 size={20} />, active: activeTab === "reports", onClick: () => { setActiveTab("reports"); setToolPanel(null); window.scrollTo({ top: 0, behavior: "smooth" }); } },
          { id: "signout", label: "Sign Out", icon: <LogOut size={20} />, onClick: logout },
        ]}
      />
    </div>
  );
}