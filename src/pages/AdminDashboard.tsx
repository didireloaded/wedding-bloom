import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Plus, LogOut, Calendar, MapPin, Users, Clock, Search, ArrowUpRight, SlidersHorizontal, ChevronDown } from "lucide-react";
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
  published: boolean;
  rsvp_confirmed?: number;
  rsvp_pending?: number;
}

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

    const { data: weddingsData, error } = await supabase
      .from("weddings")
      .select("id, couple_names, slug, wedding_date, ceremony_venue, published")
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

    if (!baseWeddings.length) return;

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
  const upcomingCount = weddings.filter((wedding) => wedding.wedding_date && new Date(`${wedding.wedding_date}T23:59:59`).getTime() >= Date.now()).length;
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
    <div className="admin-app min-h-screen bg-[#f1f1f1]">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div><p className="font-body text-[10px] font-semibold text-black/45">ForeverVow</p><h1 className="font-body text-xl font-semibold">Weddings</h1></div>
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
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-body text-xs font-medium text-black/50">Your weddings</p>
            <h2 className="mt-1 font-body text-2xl font-semibold text-black sm:text-3xl">Every celebration, in one place.</h2>
            <p className="mt-2 font-body text-sm text-black/55">
              {weddings.length} total <span aria-hidden="true">·</span> {liveCount} published <span aria-hidden="true">·</span> {upcomingCount} upcoming
            </p>
          </div>
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
              <label className="wedding-label block mb-2">COUPLE NAMES</label>
              <input
                required
                value={newCouple}
                onChange={(e) => setNewCouple(e.target.value)}
                placeholder="John & Anna"
                className="w-full rounded-2xl border border-black/10 bg-[#f6f6f6] px-4 py-3 font-body text-sm outline-none focus:border-black/30"
              />
            </div>
            <div>
              <label className="wedding-label block mb-2">URL SLUG (optional)</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="john-anna"
                className="w-full rounded-2xl border border-black/10 bg-[#f6f6f6] px-4 py-3 font-body text-sm outline-none focus:border-black/30"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-foreground px-6 py-3 font-body text-xs font-semibold text-background">
                CREATE
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-full border border-black/10 bg-white px-6 py-3 font-body text-xs font-semibold">
                CANCEL
              </button>
            </div>
          </motion.form>
        )}

        <section aria-label="Wedding list">
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

          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
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
                    <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{w.rsvp_confirmed} confirmed</span>
                    {(w.rsvp_pending || 0) > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{w.rsvp_pending} undecided</span>}
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
        </section>
        {user && isAdmin && <section className="mt-8 border-t border-black/10 pt-6" aria-label="More wedding tools">
          <h2 className="mb-3 font-body text-base font-semibold text-black">More wedding tools</h2>
          <details className="border-b border-black/10 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-medium text-black">Import weddings <ChevronDown className="h-4 w-4" /></summary>
            <div className="pt-4"><CSVImporter adminUserId={user.id} onComplete={fetchWeddings} /></div>
          </details>
          {weddings.length > 0 && <details className="border-b border-black/10 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-medium text-black">Ask about a wedding <ChevronDown className="h-4 w-4" /></summary>
            <div className="pt-4"><AIChatAssistant isAdmin={true} /></div>
          </details>}
        </section>}
      </main>
    </div>
  );
};

export default AdminDashboard;
