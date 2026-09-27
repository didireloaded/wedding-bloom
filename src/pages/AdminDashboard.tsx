import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Plus, LogOut, Calendar, MapPin, Users, Clock, Search, ArrowUpRight, SlidersHorizontal, Heart, CalendarDays, CheckCircle2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import CSVImporter from "@/components/admin/CSVImporter";
import AIChatAssistant from "@/components/dashboard/AIChatAssistant";

interface Wedding {
  id: string;
  couple_names: string;
  slug: string;
  wedding_date: string | null;
  ceremony_venue: string | null;
  cover_image: string | null;
  published: boolean;
  rsvp_confirmed?: number;
  rsvp_pending?: number;
}

type AdminSection = "overview" | "weddings" | "tools";
const sectionFromHash = (): AdminSection => {
  const section = window.location.hash.slice(1);
  return section === "weddings" || section === "tools" ? section : "overview";
};

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCouple, setNewCouple] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "live" | "draft">("all");
  const [sort, setSort] = useState<"recent" | "date">("recent");
  const [countsReady, setCountsReady] = useState(false);
  const [section, setSection] = useState<AdminSection>(sectionFromHash);

  useEffect(() => {
    const syncSection = () => setSection(sectionFromHash());
    window.addEventListener("hashchange", syncSection);
    window.addEventListener("popstate", syncSection);
    return () => { window.removeEventListener("hashchange", syncSection); window.removeEventListener("popstate", syncSection); };
  }, []);

  const openSection = (next: AdminSection) => {
    window.history.pushState(null, "", `#${next}`);
    setSection(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchWeddings();
  }, [user, isAdmin]);

  const fetchWeddings = async () => {
    setLoadingData(true);
    setCountsReady(false);

    const { data: weddingsData, error } = await supabase
      .from("weddings")
      .select("id, couple_names, slug, wedding_date, ceremony_venue, cover_image, published")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setWeddings([]);
      setLoadingData(false);
      return;
    }

    const baseWeddings = (weddingsData || []).map((w) => ({
      ...w,
      rsvp_confirmed: 0,
      rsvp_pending: 0,
    }));

    setWeddings(baseWeddings);
    setLoadingData(false);

    if (!baseWeddings.length) {
      setCountsReady(true);
      return;
    }

    const counts = await Promise.allSettled(
      baseWeddings.map(async (w) => {
        const [confirmedResult, pendingResult] = await Promise.all([
          supabase
            .from("rsvps")
            .select("id", { count: "exact", head: true })
            .eq("wedding_id", w.id)
            .eq("attending", true),
          supabase
            .from("rsvps")
            .select("id", { count: "exact", head: true })
            .eq("wedding_id", w.id)
            .is("attending", null),
        ]);

        if (confirmedResult.error) throw confirmedResult.error;
        if (pendingResult.error) throw pendingResult.error;

        return {
          weddingId: w.id,
          confirmed: confirmedResult.count || 0,
          pending: pendingResult.count || 0,
        };
      })
    );

    const countsMap = new Map<string, { confirmed: number; pending: number }>();

    counts.forEach((result) => {
      if (result.status === "fulfilled") {
        countsMap.set(result.value.weddingId, {
          confirmed: result.value.confirmed,
          pending: result.value.pending,
        });
      }
    });

    if (counts.some((result) => result.status === "rejected")) {
      toast.error("Some RSVP totals could not be loaded. Refresh to try again.");
    }

    setWeddings((prev) =>
      prev.map((w) => {
        const item = countsMap.get(w.id);
        if (!item) return w;

        return {
          ...w,
          rsvp_confirmed: item.confirmed,
          rsvp_pending: item.pending,
        };
      })
    );
    setCountsReady(counts.every((result) => result.status === "fulfilled"));
  };

  const createWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newSlug || newCouple.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("weddings").insert({
      couple_names: newCouple,
      slug,
      admin_user_id: user!.id,
    });
    if (error) {
      if (error.code === "23505" || error.message?.includes("unique") || error.message?.includes("duplicate")) {
        toast.error("A wedding with this URL slug already exists. Please choose a different one.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Wedding created!");
      setShowCreate(false);
      setNewCouple("");
      setNewSlug("");
      fetchWeddings();
    }
  };

  const liveCount = weddings.filter((wedding) => wedding.published).length;
  const draftCount = weddings.length - liveCount;
  const upcomingCount = weddings.filter((wedding) => wedding.wedding_date && new Date(`${wedding.wedding_date}T23:59:59`).getTime() >= Date.now()).length;
  const confirmedCount = weddings.reduce((total, wedding) => total + (wedding.rsvp_confirmed || 0), 0);
  const pendingCount = weddings.reduce((total, wedding) => total + (wedding.rsvp_pending || 0), 0);
  const featuredWeddings = [...weddings]
    .filter((wedding) => wedding.wedding_date && new Date(`${wedding.wedding_date}T23:59:59`).getTime() >= Date.now())
    .sort((left, right) => left.wedding_date!.localeCompare(right.wedding_date!))
    .slice(0, 3);
  const calendarMonths = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(new Date().getFullYear(), new Date().getMonth() + index, 1);
    const key = format(month, "yyyy-MM");
    return { key, label: format(month, "MMM"), count: weddings.filter((wedding) => wedding.wedding_date?.startsWith(key)).length };
  });
  const maxMonthlyCount = Math.max(1, ...calendarMonths.map((month) => month.count));
  const visibleWeddings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = weddings.filter((wedding) =>
      (status === "all" || wedding.published === (status === "live")) &&
      (!query || `${wedding.couple_names} ${wedding.slug} ${wedding.ceremony_venue || ""}`.toLowerCase().includes(query))
    );
    if (sort === "date") matches.sort((left, right) =>
      (left.wedding_date || "9999-12-31").localeCompare(right.wedding_date || "9999-12-31")
    );
    return matches;
  }, [weddings, search, status, sort]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="wedding-label">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-app min-h-screen bg-[#f3f3f5] text-[#19191d]">
      <nav className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff6245] text-white"><Heart className="h-5 w-5" fill="currentColor" /></span><div><p className="font-body text-[11px] font-semibold text-black/45">ForeverVow</p><h1 className="font-body text-lg font-semibold capitalize leading-tight">{section}</h1></div></div>
        <div className="hidden items-center gap-1 rounded-full bg-[#f3f3f5] p-1 sm:flex" aria-label="Admin sections">
          {(["overview", "weddings", "tools"] as const).map((item) => <button key={item} type="button" onClick={() => openSection(item)} aria-current={section === item ? "page" : undefined} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${section === item ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black"}`}>{item}</button>)}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowCreate(true)}
            aria-label="Create wedding"
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-foreground px-3 py-2 font-body text-xs font-semibold text-background transition-colors hover:bg-foreground/90 sm:px-4"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Wedding</span>
          </button>
          <button onClick={signOut} className="grid h-11 w-11 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-foreground" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 sm:hidden" aria-label="Admin sections">
          {(["overview", "weddings", "tools"] as const).map((item) => <button key={item} type="button" onClick={() => openSection(item)} aria-current={section === item ? "page" : undefined} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold capitalize ${section === item ? "bg-black text-white" : "bg-[#f3f3f5] text-black/65"}`}>{item}</button>)}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-body text-xs font-medium text-black/50">Wedding management</p>
            <h2 className="mt-1 font-body text-2xl font-semibold text-black sm:text-3xl">{section === "overview" ? "Your celebrations at a glance" : section === "weddings" ? "Weddings" : "Tools"}</h2>
            <p className="mt-2 font-body text-sm text-black/55">{section === "overview" ? "A clear view of weddings, guests, and what comes next." : section === "weddings" ? "Find and manage every celebration." : "Import celebrations and get answers about your weddings."}</p>
          </div>
          <p className="font-body text-xs text-black/45">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        {showCreate && (
          <motion.form
            onSubmit={createWedding}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 space-y-4 rounded-[28px] border border-white/80 bg-white p-6 shadow-sm"
          >
            <h2 className="font-body text-xl font-semibold">Create new wedding</h2>
            <div>
              <label className="wedding-label block mb-2">Couple names</label>
              <input
                required
                value={newCouple}
                onChange={(e) => setNewCouple(e.target.value)}
                placeholder="John & Anna"
                className="w-full rounded-2xl border border-black/10 bg-[#f6f6f6] px-4 py-3 font-body text-sm outline-none focus:border-black/30"
              />
            </div>
            <div>
              <label className="wedding-label block mb-2">URL slug (optional)</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="john-anna"
                className="w-full rounded-2xl border border-black/10 bg-[#f6f6f6] px-4 py-3 font-body text-sm outline-none focus:border-black/30"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-foreground px-6 py-3 font-body text-xs font-semibold text-background">
                Create wedding
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-full border border-black/10 bg-white px-6 py-3 font-body text-xs font-semibold">
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {section === "overview" && <><section aria-label="Wedding overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "All weddings", value: weddings.length, icon: Heart, color: "bg-[#ffe4dc] text-[#df563a]" },
            { label: "Published", value: liveCount, icon: CheckCircle2, color: "bg-[#e6f2d4] text-[#5a7e26]" },
            { label: "Upcoming", value: upcomingCount, icon: CalendarDays, color: "bg-[#dbf4f0] text-[#21877d]" },
            { label: "Confirmed replies", value: countsReady ? confirmedCount : "—", icon: Users, color: "bg-[#f8e4ea] text-[#b45972]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="min-w-0 rounded-lg border border-black/5 bg-white p-4 sm:p-5">
              <span className={`grid h-9 w-9 place-items-center rounded-full ${color}`}><Icon className="h-4 w-4" /></span>
              <p className="mt-5 text-xs font-medium text-black/55">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-black sm:text-3xl">{value}</p>
            </div>
          ))}
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="rounded-lg border border-black/5 bg-white p-5 sm:p-6" aria-labelledby="admin-calendar-title">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 id="admin-calendar-title" className="text-base font-semibold">Wedding calendar</h3><p className="mt-1 text-xs text-black/50">Scheduled celebrations over the next six months</p></div><CalendarDays className="h-5 w-5 text-[#df563a]" /></div>
            <div className="mt-6 grid h-44 grid-cols-6 items-end gap-2 sm:gap-4" role="img" aria-label={calendarMonths.map((month) => `${month.label}: ${month.count} weddings`).join(", ")}>
              {calendarMonths.map((month) => <div key={month.key} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold tabular-nums text-black/65">{month.count}</span>
                <div className="flex h-32 w-full items-end rounded-md bg-[#f3f3f5]"><div className="w-full rounded-md bg-[#ff6245]" style={{ height: `${month.count ? Math.max(10, (month.count / maxMonthlyCount) * 100) : 0}%` }} /></div>
                <span className="text-[11px] text-black/55">{month.label}</span>
              </div>)}
            </div>
          </section>
          <section className="rounded-lg border border-black/5 bg-white p-5 sm:p-6" aria-labelledby="admin-response-title">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 id="admin-response-title" className="text-base font-semibold">Guest responses</h3><p className="mt-1 text-xs text-black/50">Confirmed and undecided replies across every wedding</p></div><Users className="h-5 w-5 text-[#21877d]" /></div>
            {countsReady ? <div className="mt-7 flex items-center gap-5 sm:gap-8">
              <div className="grid h-32 w-32 shrink-0 place-items-center rounded-full" role="img" aria-label={`${confirmedCount} confirmed, ${pendingCount} undecided`} style={{ background: confirmedCount + pendingCount ? `conic-gradient(#22c4b5 ${confirmedCount / (confirmedCount + pendingCount) * 100}%, #f5a5b9 0)` : "#e9e9ed" }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center"><div><p className="text-2xl font-semibold tabular-nums">{confirmedCount + pendingCount}</p><p className="text-[10px] text-black/55">responses</p></div></div></div>
              <div className="min-w-0 space-y-3 text-xs"><p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#22c4b5]" /> Confirmed <strong className="ml-auto tabular-nums">{confirmedCount}</strong></p><p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f5a5b9]" /> Undecided <strong className="ml-auto tabular-nums">{pendingCount}</strong></p></div>
            </div> : <p className="mt-8 text-sm text-black/55">Response totals are unavailable. Refresh to try again.</p>}
            <div className="mt-6 border-t border-black/5 pt-4 text-xs text-black/55">{draftCount} drafts awaiting publication</div>
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-black/5 bg-white p-5 sm:p-6" aria-labelledby="upcoming-weddings-title">
          <div className="flex items-start justify-between gap-3"><div><h3 id="upcoming-weddings-title" className="text-base font-semibold">Coming up</h3><p className="mt-1 text-xs text-black/50">Weddings with the nearest dates</p></div><button type="button" onClick={() => openSection("weddings")} className="text-xs font-semibold text-[#b4412c] hover:underline">See all weddings</button></div>
          {featuredWeddings.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{featuredWeddings.map((wedding) => <button key={wedding.id} onClick={() => navigate(`/admin/wedding/${wedding.id}`)} className="group flex min-h-32 items-center gap-4 overflow-hidden rounded-lg border border-black/10 bg-[#fafafa] p-3 text-left hover:border-black/25">
            {wedding.cover_image ? <img src={wedding.cover_image} alt="" className="h-28 w-auto max-w-[42%] shrink-0 rounded-md object-contain" /> : <span className="grid h-28 w-20 shrink-0 place-items-center rounded-md bg-[#e9eeed]"><Heart className="h-7 w-7 text-[#ff6245]" /></span>}
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="min-w-0 text-sm font-semibold text-black">{wedding.couple_names}</p><ArrowUpRight className="h-4 w-4 shrink-0 text-black/40 group-hover:text-black" /></div><p className="mt-2 text-xs leading-relaxed text-black/55">{format(new Date(`${wedding.wedding_date}T12:00:00`), "d MMM yyyy")}{wedding.ceremony_venue ? ` · ${wedding.ceremony_venue}` : ""}</p></div>
          </button>)}</div> : <p className="mt-5 text-sm text-black/55">No upcoming wedding dates yet.</p>}
        </section></>}

        {section === "weddings" && <section id="weddings" aria-label="Wedding list" className="scroll-mt-24">
          <div className="mb-4"><h2 className="text-lg font-semibold">All weddings</h2><p className="mt-1 text-xs text-black/50">Find a celebration and open its details.</p></div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-full bg-white p-1 self-start" aria-label="Filter weddings">
              {(["all", "live", "draft"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setStatus(option)} aria-pressed={status === option} className={`min-h-9 rounded-full px-4 font-body text-xs font-semibold capitalize ${status === option ? "bg-black text-white" : "text-black/55 hover:text-black"}`}>
                  {option === "live" ? "Published" : option === "draft" ? "Drafts" : "All"}
                </button>
              ))}
            </div>
            <div className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-4">
                <Search className="h-4 w-4 shrink-0 text-black/45" />
                <span className="sr-only">Search weddings</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search weddings" className="min-h-11 w-full bg-transparent font-body text-sm outline-none placeholder:text-black/40" />
              </label>
              <label className="flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-white px-3 text-black/60" title="Sort weddings">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Sort weddings</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as "recent" | "date")} className="min-h-11 max-w-[7rem] bg-transparent font-body text-xs outline-none">
                  <option value="recent">Recent</option>
                  <option value="date">Wedding date</option>
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-black/5 bg-white">
            {visibleWeddings.map((w) => (
              <div key={w.id} className="flex flex-col gap-4 border-b border-black/5 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-body text-base font-semibold text-black">{w.couple_names}</h3>
                    <span className={`rounded-full px-2.5 py-1 font-body text-[10px] font-semibold ${w.published ? "bg-[#d9f06e] text-black" : "bg-black/5 text-black/55"}`}>
                      {w.published ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-black/55">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{w.wedding_date ? format(new Date(`${w.wedding_date}T12:00:00`), "dd MMM yyyy") : "Date not set"}</span>
                    {w.ceremony_venue && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{w.ceremony_venue}</span>}
                    <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{countsReady ? w.rsvp_confirmed : "—"} confirmed</span>
                    {countsReady && (w.rsvp_pending || 0) > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{w.rsvp_pending} undecided</span>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {w.published && <a href={`/wedding/${w.slug}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 rounded-full border border-black/10 px-4 font-body text-xs font-semibold text-black hover:bg-black/5">View <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                  <button onClick={() => navigate(`/admin/wedding/${w.id}`)} className="inline-flex min-h-10 items-center rounded-full bg-black px-5 font-body text-xs font-semibold text-white hover:bg-black/80">Open wedding</button>
                </div>
              </div>
            ))}
            {visibleWeddings.length === 0 && <p className="px-5 py-12 text-center font-body text-sm text-black/55">{weddings.length ? "No weddings match this view." : "No weddings yet. Add the first one to begin."}</p>}
          </div>
        </section>}
        {section === "tools" && user && isAdmin && <section id="tools" className="scroll-mt-24" aria-label="Wedding tools">
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-black/5 bg-white p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold"><Wrench className="h-4 w-4 text-[#df563a]" />Import weddings</h3>
              <p className="mt-1 text-xs text-black/55">Bring in wedding details from a spreadsheet. Review every entry before saving.</p>
              <div className="mt-5"><CSVImporter adminUserId={user.id} onComplete={fetchWeddings} /></div>
            </div>
            {weddings.length > 0 && <div className="min-w-0 rounded-lg border border-black/5 bg-white p-5 sm:p-6">
              <h3 className="text-base font-semibold">Ask about weddings</h3>
              <p className="mt-1 text-xs text-black/55">Check guest responses, dates, and what needs attention.</p>
              <div className="mt-5"><AIChatAssistant isAdmin={true} /></div>
            </div>}
          </div>
        </section>}
      </main>
    </div>
  );
};

export default AdminDashboard;
