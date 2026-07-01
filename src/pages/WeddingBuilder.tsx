import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Plus, Send, Trash2, Upload, Sparkles, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";
import { GlassCard } from "@/components/ui/GlassCard";

type TimelineItem = {
  event_name: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
};

type AccommodationItem = {
  name: string;
  address: string;
  maps: string;
  phone: string;
  website: string;
  distance: string;
  parking: string;
  notes: string;
};

type VendorItem = {
  role: string;
  business_name: string;
  contact: string;
  instagram: string;
  website: string;
  logo: string;
};

const sections = [
  "About You",
  "Your Story",
  "Wedding Details",
  "Ceremony Venue",
  "Reception Venue",
  "Timeline",
  "Accommodation",
  "Venue Map",
  "Images",
  "Guest Experience",
  "Guest Features",
  "Vendors",
  "Design Inspiration",
  "Final Notes",
  "Review & Submit",
];

const vendorRoles = [
  "Photographer", "Videographer", "DJ", "MC", "Decorator", "Florist",
  "Wedding Planner", "Hair Stylist", "Makeup Artist", "Cake Designer", "Entertainment"
];

const timelineDefaults = [
  "Guests Arrive", "Ceremony", "Cocktail Hour", "Family Photos", "Reception",
  "Dinner", "Speeches", "Cake Cutting", "First Dance", "Party"
];

const initialTimeline = timelineDefaults.map((name, index) => ({
  event_name: name,
  start_time: index === 0 ? "14:30" : "",
  end_time: "",
  location: "",
  description: "",
}));

const makeCode = () => Math.random().toString(16).slice(2, 10).toUpperCase();
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export default function WeddingBuilder() {
  const [step, setStep] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>(vendorRoles.map(role => ({ role, business_name: "", contact: "", instagram: "", website: "", logo: "" })));
  const [galleryUrls, setGalleryUrls] = useState<string[]>([""]);
  const [generated, setGenerated] = useState<any | null>(null);

  const [form, setForm] = useState<Record<string, any>>({
    bride: "",
    groom: "",
    display_name: "",
    email: "",
    phone: "",
    hashtag: "",
    instagram: "",
    how_met: "",
    love_story: "",
    proposal: "",
    welcome_message: "",
    wedding_date: "",
    ceremony_time: "",
    reception_time: "",
    theme: "Luxury",
    colors: "",
    dress_code: "Formal",
    slug: "",
    ceremony_venue: "",
    ceremony_address: "",
    city: "",
    country: "",
    ceremony_maps: "",
    parking: "",
    venue_notes: "",
    reception_venue: "",
    reception_address: "",
    reception_maps: "",
    reception_parking: "",
    reception_notes: "",
    has_accommodation: "No",
    needs_map: "No",
    venue_map_url: "",
    map_notes: "",
    hero_image: "https://images.pexels.com/photos/17019893/pexels-photo-17019893.jpeg?auto=compress&cs=tinysrgb&w=1400",
    cover_image: "https://images.pexels.com/photos/17487414/pexels-photo-17487414.jpeg?auto=compress&cs=tinysrgb&w=1400",
    story_images: "",
    engagement_photos: "",
    estimated_guests: "",
    capacity: "",
    children_allowed: "Yes",
    plus_ones: "Yes",
    rsvp_deadline: "",
    dietary: "Yes",
    guest_messages: "Yes",
    guestbook: "Yes",
    guest_moments: "Yes",
    guest_photos: "Yes",
    live_updates: "Yes",
    live_mode: "Yes",
    pinterest: "",
    instagram_inspiration: "",
    mood_board: "",
    design_notes: "",
    guest_info: "",
    special_requests: "",
    additional_info: "",
    confirm_date: false,
    confirm_venue: false,
    confirm_maps: false,
    confirm_images: false,
    confirm_timeline: false,
    confirm_guests: false,
    confirm_contact: false,
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const progress = useMemo(() => Math.round(((step + 1) / sections.length) * 100), [step]);
  const displayName = form.display_name || [form.bride, form.groom].filter(Boolean).join(" & ") || "New Celebration";
  const suggestedSlug = form.slug || slugify(displayName);

  const requiredComplete = Boolean(
    form.bride && form.groom && form.display_name && form.email && form.phone &&
    form.how_met && form.love_story && form.proposal && form.welcome_message &&
    form.wedding_date && form.ceremony_time && form.ceremony_venue && form.ceremony_address &&
    form.city && form.country && form.ceremony_maps && form.hero_image && form.cover_image &&
    form.estimated_guests && form.rsvp_deadline
  );

  const submit = () => {
    if (!requiredComplete) {
      toast.error("Please complete all required fields before deploying.");
      return;
    }

    const slug = suggestedSlug;
    const accessCode = makeCode();
    const wedding = store.insert("weddings", {
      slug,
      access_code: accessCode,
      couple_names: form.display_name,
      wedding_date: form.wedding_date,
      ceremony_time: form.ceremony_time,
      ceremony_venue: form.ceremony_venue,
      venue_address: `${form.ceremony_address}, ${form.city}, ${form.country}`,
      venue_map_url: form.venue_map_url || null,
      cover_image: form.cover_image,
      hero_image: form.hero_image,
      story: `${form.welcome_message}\n\nHow we met: ${form.how_met}\n\nOur story: ${form.love_story}\n\nThe proposal: ${form.proposal}`,
      dress_code: `${form.dress_code}${form.colors ? ` · Colours: ${form.colors}` : ""}`,
      hashtag: form.hashtag || form.display_name.replace(/[^a-zA-Z]/g, ""),
      published: false,
      legacy_mode: false,
      soundtrack_url: null,
      theme: { background: "38 35% 97%", foreground: "30 20% 15%", primary: "30 55% 42%", accent: "30 55% 52%", template: form.theme },
      builder_payload: { ...form, vendors, timeline, accommodations, galleryUrls },
    }) as any;

    timeline.filter(item => item.event_name && item.start_time).forEach((item, index) => {
      store.insert("events", {
        wedding_id: wedding.id,
        title: item.event_name,
        description: item.description || null,
        location: item.location || null,
        event_date: form.wedding_date,
        event_time: item.start_time,
        sort_order: index + 1,
      });
    });

    accommodations.filter(a => a.name).forEach(a => {
      store.insert("accommodations", {
        wedding_id: wedding.id,
        name: a.name,
        photo_url: null,
        price: null,
        phone: a.phone || null,
        distance: a.distance || null,
        booking_url: a.website || null,
        address: a.address,
        maps: a.maps,
        parking: a.parking,
        notes: a.notes,
      });
    });

    galleryUrls.filter(Boolean).forEach((url, index) => {
      store.insert("gallery", {
        wedding_id: wedding.id,
        url,
        caption: index === 0 ? "Official Gallery" : null,
        is_official: true,
        created_at: new Date().toISOString(),
      });
    });

    if (form.needs_map === "Yes") {
      ["Parking", "Bathrooms", "Dance Floor", "Food Area", "Bar", "Photo Booth", "Gift Table", "Emergency Exit", "VIP Area", "Kids Area", "Wheelchair Access"].forEach((title, index) => {
        store.insert("venue_markers", {
          wedding_id: wedding.id,
          title,
          category: title,
          icon: "MapPin",
          description: null,
          x: 15 + ((index * 17) % 70),
          y: 20 + ((index * 11) % 60),
        });
      });
    }

    const generatedData = {
      wedding,
      coupleLink: `${window.location.origin}/couple/${slug}`,
      guestLink: `${window.location.origin}/wedding/${slug}`,
      accessCode,
    };
    setGenerated(generatedData);
    toast.success("ForeverVow celebration generated successfully!");
  };

  const Field = ({ label, name, required, type = "text", textarea = false, options }: any) => (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-[#D4A853] mb-2">{label}{required ? " *" : ""}</label>
      {options ? (
        <select value={form[name]} onChange={e => update(name, e.target.value)} className="fv-input w-full">
          {options.map((option: string) => <option key={option} value={option} className="bg-[#1C1917] text-[#FAF7F2]">{option}</option>)}
        </select>
      ) : textarea ? (
        <textarea value={form[name]} onChange={e => update(name, e.target.value)} rows={4} className="fv-input w-full resize-none" />
      ) : (
        <input type={type} value={form[name]} onChange={e => update(name, type === "checkbox" ? e.target.checked : e.target.value)} className="fv-input w-full" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF7F2]">
      <header className="sticky top-0 z-30 glass-heavy border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-6 h-[76px] flex items-center justify-between gap-4">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#A8A29E] hover:text-[#D4A853] transition"><ArrowLeft size={16}/> Back to Admin Command Center</Link>
          <div className="text-center">
            <div className="wedding-label text-[10px] text-[#D4A853]">Celebration Architect</div>
            <div className="display text-[20px] text-[#FAF7F2] -mt-0.5">{displayName}</div>
          </div>
          <div className="text-[12px] font-mono text-[#A8A29E]">{progress}% Complete</div>
        </div>
        <div className="h-1 bg-white/[0.06]"><div className="h-full bg-gradient-to-r from-[#D4A853] to-[#E6C587] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 grid lg:grid-cols-[300px_1fr] gap-8">
        <aside className="lg:sticky lg:top-[100px] lg:self-start">
          <GlassCard variant="obsidian" padding="md" className="border border-white/[0.1] space-y-1 max-h-[80vh] overflow-y-auto">
            {sections.map((section, index) => (
              <button key={section} onClick={() => setStep(index)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left text-[13px] font-medium transition ${step === index ? "bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/40" : "text-[#A8A29E] hover:bg-white/[0.04] hover:text-[#FAF7F2]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 ${step === index ? "bg-[#D4A853] text-[#0C0A09] font-bold" : "bg-white/[0.06] text-[#A8A29E]"}`}>{index + 1}</span>
                <span className="truncate">{section}</span>
              </button>
            ))}
          </GlassCard>
        </aside>

        <section>
          <GlassCard variant="obsidian" padding="xl" className="border border-white/[0.1] shadow-2xl">
            <div className="mb-8 border-b border-white/[0.08] pb-6">
              <div className="wedding-label text-[#D4A853] mb-1.5">Section {step + 1} of {sections.length}</div>
              <h1 className="display text-[38px] md:text-[46px] text-[#FAF7F2] leading-tight">{sections[step]}</h1>
              {step === 0 && <p className="mt-3 text-[14.5px] leading-relaxed text-[#A8A29E] max-w-2xl">Design your celebration blueprint. This wizard provisions all database structures, timeline events, and interactive guest portals.</p>}
            </div>

            <div className="space-y-8">
              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Bride's Full Name" name="bride" required />
                  <Field label="Groom's Full Name" name="groom" required />
                  <Field label="Preferred Display Name" name="display_name" required />
                  <Field label="Primary Email Address" name="email" type="email" required />
                  <Field label="Phone Number" name="phone" required />
                  <Field label="Celebration Hashtag" name="hashtag" />
                  <Field label="Instagram Handle" name="instagram" />
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-6">
                  <Field label="How did you meet?" name="how_met" textarea required />
                  <Field label="Tell us your love story" name="love_story" textarea required />
                  <Field label="The Proposal Story" name="proposal" textarea required />
                  <Field label="Welcome message for your guests" name="welcome_message" textarea required />
                </div>
              )}

              {step === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Celebration Date" name="wedding_date" type="date" required />
                  <Field label="Ceremony Start Time" name="ceremony_time" type="time" required />
                  <Field label="Reception Start Time" name="reception_time" type="time" />
                  <Field label="Aesthetic Theme" name="theme" options={["Luxury", "Classic", "Modern", "Garden", "Beach", "Rustic", "Traditional", "Minimal", "Other"]} required />
                  <Field label="Color Palette Tokens" name="colors" />
                  <Field label="Dress Code Guidance" name="dress_code" options={["Black Tie", "Formal", "Semi Formal", "Smart Casual", "Traditional", "Other"]} />
                  <Field label="Custom URL Slug" name="slug" />
                  <div className="md:col-span-2 text-[13px] text-[#A8A29E] bg-white/[0.03] border border-white/[0.08] rounded-[16px] p-4 font-mono">
                    Provisioned URL: <span className="text-[#D4A853]">/wedding/{suggestedSlug}</span>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Ceremony Venue Name" name="ceremony_venue" required />
                  <Field label="Street Address" name="ceremony_address" required />
                  <Field label="City" name="city" required />
                  <Field label="Country" name="country" required />
                  <div className="md:col-span-2"><Field label="Google Maps Embed Link" name="ceremony_maps" required /></div>
                  <div className="md:col-span-2"><Field label="Parking Instructions" name="parking" textarea /></div>
                  <div className="md:col-span-2"><Field label="Logistical Venue Notes" name="venue_notes" textarea /></div>
                </div>
              )}

              {step === 4 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Reception Venue Name" name="reception_venue" />
                  <Field label="Reception Address" name="reception_address" />
                  <div className="md:col-span-2"><Field label="Google Maps Embed Link" name="reception_maps" /></div>
                  <div className="md:col-span-2"><Field label="Parking Information" name="reception_parking" textarea /></div>
                  <div className="md:col-span-2"><Field label="Reception Notes" name="reception_notes" textarea /></div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="rounded-[18px] bg-white/[0.03] border border-white/[0.08] p-4 grid md:grid-cols-5 gap-3">
                      <input value={item.event_name} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, event_name: e.target.value } : x))} placeholder="Event Title" className="fv-input !py-2 text-[13px]" />
                      <input type="time" value={item.start_time} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, start_time: e.target.value } : x))} className="fv-input !py-2 text-[13px]" />
                      <input type="time" value={item.end_time} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, end_time: e.target.value } : x))} className="fv-input !py-2 text-[13px]" />
                      <input value={item.location} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, location: e.target.value } : x))} placeholder="Location" className="fv-input !py-2 text-[13px]" />
                      <input value={item.description} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, description: e.target.value } : x))} placeholder="Description" className="fv-input !py-2 text-[13px]" />
                    </div>
                  ))}
                  <button onClick={() => setTimeline([...timeline, { event_name: "", start_time: "", end_time: "", location: "", description: "" }])} className="fv-btn-ghost !py-2.5 text-[12px] flex items-center gap-2"><Plus size={14}/> Append Schedule Event</button>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <Field label="Provide Recommended Accommodations?" name="has_accommodation" options={["No", "Yes"]} />
                  {accommodations.map((a, index) => (
                    <div key={index} className="rounded-[18px] bg-white/[0.03] border border-white/[0.08] p-5 grid md:grid-cols-2 gap-4 relative">
                      <button onClick={() => setAccommodations(list => list.filter((_, i) => i !== index))} className="absolute right-4 top-4 text-[#C97B7B] hover:text-red-400 transition"><Trash2 size={16}/></button>
                      {Object.keys(a).map(key => <input key={key} value={(a as any)[key]} onChange={e => setAccommodations(list => list.map((x, i) => i === index ? { ...x, [key]: e.target.value } : x))} placeholder={key.replace(/_/g, " ").toUpperCase()} className="fv-input !py-2 text-[13px]" />)}
                    </div>
                  ))}
                  <button onClick={() => setAccommodations([...accommodations, { name: "", address: "", maps: "", phone: "", website: "", distance: "", parking: "", notes: "" }])} className="fv-btn-ghost !py-2.5 text-[12px] flex items-center gap-2"><Plus size={14}/> Add Hospitality Partner</button>
                </div>
              )}

              {step === 7 && (
                <div className="grid gap-6">
                  <Field label="Enable Interactive Blueprint Map?" name="needs_map" options={["No", "Yes"]} />
                  <Field label="Venue Blueprint Asset URL" name="venue_map_url" />
                  <Field label="Interactive Map Overview Notes" name="map_notes" textarea />
                  <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.08] p-4 text-[13px] text-[#A8A29E] font-mono">Provisioned Interactive Markers: Parking, Bathrooms, Dance Floor, Food Area, Bar, Photo Booth, Gift Table, Emergency Exit, VIP Area, Kids Area, Wheelchair Access.</div>
                </div>
              )}

              {step === 8 && (
                <div className="grid gap-6">
                  <Field label="Hero Banner Asset URL" name="hero_image" required />
                  <Field label="Cover Thumbnail Asset URL" name="cover_image" required />
                  <Field label="Editorial Story Images URLs (One per line)" name="story_images" textarea />
                  <Field label="Engagement Vault Photos URLs" name="engagement_photos" textarea />
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-[#D4A853] mb-3">Official Gallery Assets</label>
                    <div className="space-y-3">
                      {galleryUrls.map((url, index) => <input key={index} value={url} onChange={e => setGalleryUrls(list => list.map((x, i) => i === index ? e.target.value : x))} placeholder="https://..." className="fv-input w-full" />)}
                    </div>
                    <button onClick={() => setGalleryUrls([...galleryUrls, ""])} className="mt-4 fv-btn-ghost !py-2 !px-4 text-[12px] flex items-center gap-2"><Upload size={14}/> Append Gallery Asset</button>
                  </div>
                </div>
              )}

              {step === 9 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Estimated Guest Headcount" name="estimated_guests" type="number" required />
                  <Field label="Venue Maximum Capacity" name="capacity" type="number" />
                  <Field label="Children Welcome?" name="children_allowed" options={["Yes", "No"]} />
                  <Field label="Plus Ones Permitted?" name="plus_ones" options={["Yes", "No"]} />
                  <Field label="RSVP Submission Deadline" name="rsvp_deadline" type="date" required />
                </div>
              )}

              {step === 10 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {["dietary", "guest_messages", "guestbook", "guest_moments", "guest_photos", "live_updates", "live_mode"].map(key => <Field key={key} label={key.replace(/_/g, " ").toUpperCase()} name={key} options={["Yes", "No"]} />)}
                </div>
              )}

              {step === 11 && (
                <div className="space-y-5">
                  {vendors.map((v, index) => (
                    <div key={v.role} className="rounded-[20px] bg-white/[0.03] border border-white/[0.08] p-5">
                      <div className="font-bold text-[#D4A853] mb-3 uppercase tracking-wider text-[12px]">{v.role}</div>
                      <div className="grid md:grid-cols-5 gap-3">
                        {(["business_name", "contact", "instagram", "website", "logo"] as const).map(key => <input key={key} value={v[key]} onChange={e => setVendors(list => list.map((x, i) => i === index ? { ...x, [key]: e.target.value } : x))} placeholder={key.replace(/_/g, " ").toUpperCase()} className="fv-input !py-2 text-[12px]" />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 12 && (
                <div className="grid gap-6">
                  <Field label="Pinterest Mood Board URL" name="pinterest" />
                  <Field label="Instagram Inspiration Profile" name="instagram_inspiration" />
                  <Field label="Creative Mood Board Link" name="mood_board" />
                  <Field label="Architectural Design Notes" name="design_notes" textarea />
                </div>
              )}

              {step === 13 && (
                <div className="grid gap-6">
                  <Field label="Important Guest Advisories" name="guest_info" textarea />
                  <Field label="Special VIP Requests" name="special_requests" textarea />
                  <Field label="Additional Logistical Notes" name="additional_info" textarea />
                </div>
              )}

              {step === 14 && (
                <div className="space-y-8">
                  <div className="rounded-[24px] bg-white/[0.03] border border-white/[0.1] p-6">
                    <h3 className="display text-[28px] text-[#FAF7F2] mb-4">Deployment Pre-Check</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-[14px] text-[#A8A29E] font-mono">
                      <div>Celebration Name: <strong className="text-[#FAF7F2]">{displayName}</strong></div>
                      <div>Date: <strong className="text-[#FAF7F2]">{form.wedding_date ? format(new Date(form.wedding_date), "d MMM yyyy") : "Pending"}</strong></div>
                      <div>Primary Venue: <strong className="text-[#FAF7F2]">{form.ceremony_venue || "Pending"}</strong></div>
                      <div>Provisioned URL: <strong className="text-[#D4A853]">/wedding/{suggestedSlug}</strong></div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      ["confirm_date", "Celebration schedule confirmed"],
                      ["confirm_venue", "Venue locations verified"],
                      ["confirm_maps", "Geographic coordinates confirmed"],
                      ["confirm_images", "Media assets validated"],
                      ["confirm_timeline", "Schedule events configured"],
                      ["confirm_guests", "Guest permissions finalized"],
                      ["confirm_contact", "Security contacts verified"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 rounded-[14px] bg-white/[0.02] border border-white/[0.08] p-3.5 text-[13px] font-medium text-[#FAF7F2] cursor-pointer hover:border-[#D4A853]/40 transition">
                        <input type="checkbox" checked={!!form[key]} onChange={e => update(key as string, e.target.checked)} className="rounded border-white/20 text-[#D4A853] focus:ring-[#D4A853]" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={submit} className="fv-btn-primary w-full !py-4 text-[14px] flex items-center justify-center gap-2"><Send size={16}/> Deploy Celebration Workspace</button>
                </div>
              )}

              {generated && (
                <div className="mt-8 rounded-[24px] border border-[#7A9E7E]/40 bg-[#7A9E7E]/10 p-6">
                  <div className="flex items-center gap-3 mb-4 text-[#7A9E7E] font-bold"><CheckCircle2 size={24}/><div className="display text-[28px] text-[#FAF7F2]">Workspace Deployed Successfully</div></div>
                  <div className="grid gap-2.5 text-[13.5px] font-mono text-[#A8A29E]">
                    <div>Workspace UUID: <code className="text-[#FAF7F2]">{generated.wedding.id}</code></div>
                    <div>Command Center URL: <code className="text-[#D4A853]">{generated.coupleLink}</code></div>
                    <div>Guest Experience URL: <code className="text-[#D4A853]">{generated.guestLink}</code></div>
                    <div>Security Passcode: <code className="text-[#FAF7F2] font-bold tracking-[0.2em]">{generated.accessCode}</code></div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link to={`/couple/${generated.wedding.slug}`} className="fv-btn-primary !py-3 !px-6 text-[13px]">Open Command Center</Link>
                    <Link to={`/wedding/${generated.wedding.slug}?preview=1`} className="fv-btn-ghost !py-3 !px-6 text-[13px]">Preview Guest Portal</Link>
                    <Link to="/admin/dashboard" className="fv-btn-ghost !py-3 !px-6 text-[13px]">Return to Admin</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/[0.08]">
              <button disabled={step === 0} onClick={() => setStep(step - 1)} className="fv-btn-ghost !py-2.5 !px-5 text-[13px] disabled:opacity-30 flex items-center gap-2"><ArrowLeft size={14}/> Previous Section</button>
              {step < sections.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="fv-btn-primary !py-2.5 !px-6 text-[13px] flex items-center gap-2">Proceed <ArrowRight size={14}/></button>
              ) : (
                <button onClick={submit} className="fv-btn-primary !py-3 !px-8 text-[13px] flex items-center gap-2">Deploy <Send size={14}/></button>
              )}
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
}