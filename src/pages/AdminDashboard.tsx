import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Plus, LogOut, Calendar, MapPin, Users, Clock } from "lucide-react";
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
  access_code: string;
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
      .select("id, couple_names, slug, wedding_date, ceremony_venue, published, access_code")
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex min-h-11 items-center gap-2 rounded-full bg-foreground px-4 py-2 font-body text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            <Plus className="w-4 h-4" /> New Wedding
          </button>
          <button onClick={signOut} className="grid h-11 w-11 place-items-center rounded-full bg-black/5 text-muted-foreground hover:text-foreground" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/admin/wedding/${w.id}`)}
              className="group cursor-pointer rounded-[24px] border border-white/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-body text-xl font-semibold transition-colors">
                  {w.couple_names}
                </h3>
                <span className={`rounded-full px-3 py-1 font-body text-[10px] font-semibold ${w.published ? "bg-[#d9f06e] text-black" : "bg-muted text-muted-foreground"}`}>
                  {w.published ? "LIVE" : "DRAFT"}
                </span>
              </div>

              {w.wedding_date && (
                <p className="flex items-center gap-2 text-muted-foreground font-body text-xs mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(w.wedding_date), "dd MMMM yyyy")}
                </p>
              )}
              {w.ceremony_venue && (
                <p className="flex items-center gap-2 text-muted-foreground font-body text-xs mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {w.ceremony_venue}
                </p>
              )}

              <div className="flex gap-4 pt-4 border-t border-border">
                <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" /> {w.rsvp_confirmed} confirmed
                </span>
                <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {w.rsvp_pending} pending
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {weddings.length === 0 && (
          <div className="rounded-[28px] bg-white py-20 text-center shadow-sm">
            <p className="mb-4 font-body text-xl font-semibold text-muted-foreground">No weddings yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-full bg-foreground px-8 py-3 font-body text-xs font-semibold text-background"
            >
              CREATE YOUR FIRST WEDDING
            </button>
          </div>
        )}

        {/* AI Assistant for Admin */}
        {user && isAdmin && weddings.length > 0 && (
          <div className="mt-10">
            <AIChatAssistant isAdmin={true} />
          </div>
        )}

        {/* AI CSV Import Section */}
        {user && (
          <div className="mt-10">
            <CSVImporter adminUserId={user.id} onComplete={fetchWeddings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
