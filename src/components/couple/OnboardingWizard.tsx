import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const steps = ["The Two of You", "Your Wedding", "Your Story", "The Celebration", "Guest Information", "Your Photos", "Review"];
type Draft = { names: string; date: string; story: string; ceremonyVenue: string; receptionVenue: string; dressCode: string };
const emptyDraft: Draft = { names: "", date: "", story: "", ceremonyVenue: "", receptionVenue: "", dressCode: "" };

const makeSlug = (names: string) => names.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const storageKey = `forevervow_onboarding_${user?.id || "signed-out"}`;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const photoPreview = useMemo(() => photo ? URL.createObjectURL(photo) : "", [photo]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);
  useEffect(() => {
    if (!loading && !user) navigate("/couple-login", { replace: true });
    if (!user) return;
    try { setDraft({ ...emptyDraft, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }); } catch { setDraft(emptyDraft); }
  }, [loading, navigate, storageKey, user]);
  useEffect(() => { if (user) localStorage.setItem(storageKey, JSON.stringify(draft)); }, [draft, storageKey, user]);

  const update = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const chooseImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 8 * 1024 * 1024) return toast.error("Please choose an image under 8 MB.");
    setPhoto(file);
  };

  const finish = async () => {
    if (!user) return navigate("/couple-login");
    if (!draft.names.trim()) { setStep(0); return toast.error("Add your names before continuing."); }
    setSaving(true);
    const baseSlug = makeSlug(draft.names) || "our-wedding";
    const requestedSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
    const { data, error } = await supabase.rpc("create_couple_wedding" as never, {
      requested_names: draft.names.trim(), requested_slug: requestedSlug, requested_date: draft.date || null,
      requested_venue: draft.ceremonyVenue || null, requested_reception_venue: draft.receptionVenue || null,
      requested_dress_code: draft.dressCode || null, requested_story: draft.story || null,
    } as never);
    const wedding = data as unknown as { id: string; slug: string; access_code: string } | null;
    if (error || !wedding) { setSaving(false); toast.error(error?.message || "Could not create your wedding."); return; }

    let coverImage: string | null = null;
    if (photo) {
      const extension = photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `couples/${user.id}/${wedding.id}-cover.${extension}`;
      const uploaded = await supabase.storage.from("wedding-images").upload(path, photo, { contentType: photo.type, upsert: false });
      if (uploaded.error) toast.warning("Your wedding was created, but the photo could not be uploaded yet.");
      else coverImage = supabase.storage.from("wedding-images").getPublicUrl(path).data.publicUrl;
    }

    const updates: Record<string, string | null> = {};
    if (coverImage) updates.cover_image = coverImage;
    await supabase.from("weddings").update(updates).eq("id", wedding.id);
    sessionStorage.setItem("couple_wedding_id", wedding.id);
    sessionStorage.setItem("couple_wedding_slug", wedding.slug);
    sessionStorage.setItem("couple_access_code", wedding.access_code || "");
    localStorage.removeItem(storageKey);
    navigate(`/couple-dashboard?slug=${wedding.slug}`, { replace: true });
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#e8e8e8]"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return (
    <main className="min-h-screen bg-[#e8e8e8] px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-[430px] overflow-hidden rounded-[30px] bg-[#fbf8f4] shadow-xl">
        <header className="bg-gradient-to-br from-[#f5d9d3] via-[#f6e4e7] to-[#ddd5ef] px-6 pb-7 pt-7">
          <p className="font-body text-xs font-semibold text-black/55">ForeverVow</p>
          <div className="mt-6 flex items-center justify-between"><span className="font-body text-xs">Step {step + 1} of {steps.length}</span><span className="font-body text-xs text-black/55">{Math.round(((step + 1) / steps.length) * 100)}%</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-black/10"><div className="h-1.5 rounded-full bg-[#202020] transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        </header>
        <section className="px-6 pb-7 pt-7">
          <h1 className="font-body text-3xl font-semibold">{steps[step]}</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">Add what you know now. Everything can be changed later.</p>
          <div className="mt-7 space-y-4">
            {step === 0 && <Field label="Your names" value={draft.names} onChange={(v) => update("names", v)} placeholder="Towa & Mathew" />}
            {step === 1 && <><Field label="Wedding date" type="date" value={draft.date} onChange={(v) => update("date", v)} /><Field label="Ceremony venue" value={draft.ceremonyVenue} onChange={(v) => update("ceremonyVenue", v)} placeholder="Where will you say your vows?" /></>}
            {step === 2 && <TextField label="Your story" value={draft.story} onChange={(v) => update("story", v)} placeholder="Tell guests how your story began..." />}
            {step === 3 && <Field label="Reception venue" value={draft.receptionVenue} onChange={(v) => update("receptionVenue", v)} placeholder="Where will you celebrate?" />}
            {step === 4 && <Field label="Dress code" value={draft.dressCode} onChange={(v) => update("dressCode", v)} placeholder="Garden formal, black tie, or come as you are" />}
            {step === 5 && <PhotoField preview={photoPreview} onChoose={chooseImage} onRemove={() => setPhoto(null)} />}
            {step === 6 && <Review draft={draft} hasPhoto={Boolean(photo)} />}
          </div>
          <div className="mt-7 flex gap-3">
            {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white" aria-label="Previous step"><ArrowLeft className="h-5 w-5" /></button>}
            <button type="button" disabled={saving} onClick={step === steps.length - 1 ? finish : () => setStep((current) => current + 1)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#202020] px-4 font-body text-xs font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : step === steps.length - 1 ? "Create Wedding" : "Save & Continue"}{!saving && step < steps.length - 1 && <ArrowRight className="h-4 w-4" />}</button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="block"><span className="mb-2 block font-body text-xs font-semibold">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 font-body text-sm outline-none focus:border-black/30" /></label>; }
function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="block"><span className="mb-2 block font-body text-xs font-semibold">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-32 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-4 font-body text-sm outline-none focus:border-black/30" /></label>; }
function PhotoField({ preview, onChoose, onRemove }: { preview: string; onChoose: (file?: File) => void; onRemove: () => void }) { return <div><p className="mb-2 font-body text-xs font-semibold">Couple photo</p>{preview ? <div className="relative overflow-hidden rounded-2xl"><img src={preview} alt="Selected couple" className="h-56 w-full object-cover" /><button type="button" aria-label="Remove photo" onClick={onRemove} className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"><X className="h-4 w-4" /></button></div> : <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-white text-center"><ImagePlus className="mb-3 h-7 w-7" /><span className="font-body text-sm font-medium">Add a couple photo</span><span className="mt-1 font-body text-xs text-muted-foreground">JPG, PNG, or WEBP up to 8 MB</span><input type="file" accept="image/*" onChange={(e) => onChoose(e.target.files?.[0])} className="sr-only" /></label>}</div>; }
function Review({ draft, hasPhoto }: { draft: Draft; hasPhoto: boolean }) { return <div className="rounded-2xl bg-black/[0.04] p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#202020] text-white"><Check className="h-5 w-5" /></span><div><p className="font-body text-sm font-semibold">Ready to create your wedding</p><p className="mt-1 font-body text-xs text-muted-foreground">Your private workspace starts empty.</p></div></div><dl className="mt-5 space-y-3 font-body text-sm"><Summary label="Couple" value={draft.names || "Not added"} /><Summary label="Date" value={draft.date || "Not added"} /><Summary label="Ceremony" value={draft.ceremonyVenue || "Not added"} /><Summary label="Reception" value={draft.receptionVenue || "Not added"} /><Summary label="Dress code" value={draft.dressCode || "Not added"} /><Summary label="Photo" value={hasPhoto ? "Ready" : "Not added"} /></dl></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-black/10 pb-2"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium">{value}</dd></div>; }
