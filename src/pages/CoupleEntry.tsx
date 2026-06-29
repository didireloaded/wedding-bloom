import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Flower2, LockKeyhole, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";

const cormorant = `"Cormorant Garamond", Georgia, serif`;
const manrope = `"Manrope", system-ui, sans-serif`;

type Mode = "cards" | "explore" | "signin" | "signup";

export default function CoupleEntry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("cards");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const wedding = useMemo(
    () => store.find("weddings", (w: any) => w.slug === slug),
    [slug]
  ) as any;

  const inspiration = useMemo(
    () => store.all("weddings").filter((w: any) => w.published),
    []
  ) as any[];

  useEffect(() => {
    if (!wedding) return;
    const activeWeddingId = localStorage.getItem("couple_wedding_id") || sessionStorage.getItem("couple_wedding_id");
    if (activeWeddingId === wedding.id) {
      navigate(`/couple/${wedding.slug}/dashboard`, { replace: true });
    }
  }, [wedding, navigate]);

  const openWorkspace = (matchedWedding: any, usedCode: string) => {
    localStorage.setItem("couple_wedding_id", matchedWedding.id);
    localStorage.setItem("couple_wedding_slug", matchedWedding.slug);
    localStorage.setItem("couple_access_code", usedCode);
    localStorage.setItem("couple_email", email.trim());
    if (name.trim()) localStorage.setItem("couple_name", name.trim());

    sessionStorage.setItem("couple_wedding_id", matchedWedding.id);
    sessionStorage.setItem("couple_wedding_slug", matchedWedding.slug);
    sessionStorage.setItem("couple_access_code", usedCode);

    toast.success(`Welcome to ${matchedWedding.couple_names}`);
    navigate(`/couple/${matchedWedding.slug}/dashboard`);
  };

  const validateAccess = (e: React.FormEvent, createAccount = false) => {
    e.preventDefault();
    if (!wedding) return;

    if (!email.trim() || !password.trim() || !code.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (createAccount) {
      if (!name.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    const normalized = code.trim().toUpperCase();
    if (normalized !== wedding.access_code) {
      toast.error("Invalid Couple Access Code");
      return;
    }

    openWorkspace(wedding, normalized);
  };

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-6" style={{ fontFamily: manrope }}>
        <style>{`.display { font-family: ${cormorant}; } .wedding-label { letter-spacing:.26em;text-transform:uppercase;font-size:11px;color:#b7834c; }`}</style>
        <div className="text-center max-w-md">
          <div className="wedding-label mb-3">Couple Link</div>
          <h1 className="display text-[44px] text-[#2a231d]">Wedding not found</h1>
          <p className="text-[14.5px] text-[#6b5d4f] mt-3">This couple dashboard link does not match an existing wedding.</p>
          <Link to="/admin/login" className="mt-6 inline-block px-5 py-3 rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13px]">Admin login</Link>
        </div>
      </div>
    );
  }

  const hero = wedding.cover_image || wedding.hero_image;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2e2b28]" style={{ fontFamily: manrope }}>
      <style>{`
        .display { font-family: ${cormorant}; }
        .wedding-label { letter-spacing:.26em;text-transform:uppercase;font-size:11px;color:#b7834c; }
      `}</style>

      <div className="relative min-h-[46vh] overflow-hidden flex items-end">
        {hero && <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
        <div className="relative z-10 px-6 pb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white/80 text-[11px] tracking-[0.2em] uppercase mb-5">
            <Flower2 size={13} /> ForeverVow Couple Portal
          </div>
          <h1 className="display text-[52px] md:text-[72px] text-white leading-[0.9]">{wedding.couple_names}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-white/80">
            {wedding.wedding_date && <span>{format(new Date(wedding.wedding_date), "d MMMM yyyy")}</span>}
            {wedding.ceremony_venue && <span>{wedding.ceremony_venue}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {mode !== "cards" && (
          <button onClick={() => setMode("cards")} className="mb-5 inline-flex items-center gap-2 text-[13px] text-[#6b5d4f] hover:text-[#b0743c]">
            <ArrowLeft size={14} /> Back
          </button>
        )}

        {mode === "cards" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="wedding-label mb-3">Your wedding workspace is ready</div>
            <h2 className="display text-[36px] md:text-[46px] text-[#221e1b] leading-[1] mb-3">Before you begin.</h2>
            <p className="text-[15px] text-[#6b5d4f] max-w-2xl leading-7 mb-8">
              ForeverVow has prepared your private wedding workspace. Explore past weddings for inspiration, sign in, or create your couple account using the access code sent by your administrator.
            </p>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                { id: "explore", title: "Explore Weddings", text: "Browse beautiful wedding websites for inspiration.", icon: <Eye size={19} />, action: () => setMode("explore") },
                { id: "signin", title: "Sign In", text: "Access your existing couple account.", icon: <LockKeyhole size={19} />, action: () => setMode("signin") },
                { id: "signup", title: "Create Account", text: "Create your account and connect it to this wedding.", icon: <UserPlus size={19} />, action: () => setMode("signup") },
              ].map(card => (
                <button key={card.id} onClick={card.action} className="text-left bg-white rounded-[24px] border border-[#e6d4be] p-6 hover:border-[#d3a76b] hover:-translate-y-1 hover:shadow-xl transition-all">
                  <div className="w-11 h-11 rounded-[14px] bg-[#f8eee0] border border-[#e8d2b6] flex items-center justify-center text-[#b0743c] mb-5">{card.icon}</div>
                  <h3 className="display text-[26px] text-[#2a231d]">{card.title}</h3>
                  <p className="text-[14px] text-[#6b5d4f] leading-6 mt-2 min-h-[48px]">{card.text}</p>
                  <div className="mt-5 text-[13px] text-[#b0743c] flex items-center gap-2">Continue <ArrowRight size={14} /></div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === "explore" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="wedding-label mb-3">Explore Weddings</div>
            <h2 className="display text-[34px] text-[#221e1b] mb-2">Inspiration from real designs.</h2>
            <p className="text-[14px] text-[#6b5d4f] mb-6 max-w-xl">Browse published ForeverVow weddings to imagine how your own invitation could look. Preview mode is read-only.</p>
            {inspiration.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#e6d4be] bg-white p-12 text-center">
                <Eye size={28} className="mx-auto text-[#b0743c] mb-4" />
                <div className="display text-[24px] text-[#2a231d]">No weddings to preview yet</div>
                <p className="text-[13.5px] text-[#8d7962] mt-2 max-w-md mx-auto leading-relaxed">
                  Published weddings will appear here for inspiration. Once an admin creates and publishes a wedding, it becomes viewable.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {inspiration.map((w: any) => (
                  <button key={w.id} onClick={() => navigate(`/wedding/${w.slug}?preview=1`)} className="text-left bg-white rounded-[24px] border border-[#e6d4be] overflow-hidden hover:shadow-xl transition-all">
                    <div className="relative aspect-[16/9]">
                      <img src={w.cover_image || w.hero_image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="display text-[30px] text-white leading-none">{w.couple_names}</div>
                        <div className="text-white/80 text-[11px] uppercase tracking-[0.18em] mt-1">{w.theme?.template || "ForeverVow Wedding"}</div>
                      </div>
                    </div>
                    <div className="p-4 text-[13px] text-[#6b5d4f] flex items-center justify-between">
                      <span>{w.venue_address?.split(",").slice(-2).join(",").trim() || w.ceremony_venue || "Location private"}</span>
                      <span className="text-[#b0743c]">Preview</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {(mode === "signin" || mode === "signup") && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-white rounded-[28px] border border-[#e6d4be] p-6 md:p-8">
            <div className="text-center mb-7">
              <div className="wedding-label mb-2">{mode === "signin" ? "Sign In" : "Create Account"}</div>
              <h2 className="display text-[34px] text-[#221e1b]">{wedding.couple_names}</h2>
            </div>
            <form onSubmit={(e) => validateAccess(e, mode === "signup")} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="wedding-label block mb-2">Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
                </div>
              )}
              <div>
                <label className="wedding-label block mb-2">Email Address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
              </div>
              <div>
                <label className="wedding-label block mb-2">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="wedding-label block mb-2">Confirm Password</label>
                  <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 outline-none focus:border-[#d3a76b]" />
                </div>
              )}
              <div>
                <label className="wedding-label block mb-2">Couple Access Code</label>
                <input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter your access code" className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 text-center tracking-[0.18em] uppercase outline-none focus:border-[#d3a76b]" />
              </div>
              <button className="w-full py-4 rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13px] font-medium tracking-[0.08em] uppercase hover:bg-[#392f29] transition">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>
            <p className="mt-5 text-center text-[12.5px] text-[#8d7962] leading-relaxed">
              Your ForeverVow administrator will share your unique access code via your dashboard link.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}