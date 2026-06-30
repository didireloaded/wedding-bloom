import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Plus, Send, Trash2, Upload
} from "lucide-react";
import { toast } from "sonner";
import { store } from "@/store/weddingStore";

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
  const displayName = form.display_name || [form.bride, form.groom].filter(Boolean).join(" & ") || "Your Wedding";
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
      toast.error("Please complete all required fields before submitting.");
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
        caption: index === 0 ? "Wedding gallery" : null,
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
    toast.success("ForeverVow wedding generated successfully.");
  };

  const Field = ({ label, name, required, type = "text", textarea = false, options }: any) => (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#a67c54] mb-2">{label}{required ? " *" : ""}</label>
      {options ? (
        <select value={form[name]} onChange={e => update(name, e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#d3a76b]">
          {options.map((option: string) => <option key={option}>{option}</option>)}
        </select>
      ) : textarea ? (
        <textarea value={form[name]} onChange={e => update(name, e.target.value)} rows={4} className="w-full rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#d3a76b] resize-none" />
      ) : (
        <input type={type} value={form[name]} onChange={e => update(name, type === "checkbox" ? e.target.checked : e.target.value)} className="w-full rounded-[14px] border border-[#e0ccb2] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#d3a76b]" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f3ed]">



      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-[#e6d4be]">
        <div className="mx-auto max-w-6xl px-5 h-[72px] flex items-center justify-between gap-4">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-[13px] text-[#6b5d4f] hover:text-[#b0743c]"><ArrowLeft size={15}/> Admin</Link>
          <div className="text-center">
            <div className="wedding-label">ForeverVow Wedding Builder</div>
            <div className="display text-[18px] text-[#2a231d] -mt-1">{displayName}</div>
          </div>
          <div className="text-[12px] text-[#8d7962]">{progress}% complete</div>
        </div>
        <div className="h-1 bg-[#f0e4d4]"><div className="h-full bg-[#b0743c] transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="lg:sticky lg:top-[96px] lg:self-start">
          <div className="bg-white rounded-[24px] border border-[#e6d4be] p-3">
            {sections.map((section, index) => (
              <button key={section} onClick={() => setStep(index)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left text-[13px] transition ${step === index ? "bg-[#2b2723] text-white" : "text-[#5a4735] hover:bg-[#fbf3e8]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === index ? "bg-white/15" : "bg-[#f5efe7] text-[#b0743c]"}`}>{index + 1}</span>
                <span className="flex-1">{section}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-white rounded-[30px] border border-[#e6d4be] p-6 md:p-8 shadow-sm">
          <div className="mb-8">
            <div className="wedding-label mb-2">Section {step + 1}</div>
            <h1 className="display text-[38px] md:text-[48px] text-[#221e1b] leading-[1]">{sections[step]}</h1>
            {step === 0 && <p className="mt-4 text-[15px] leading-7 text-[#6b5d4f] max-w-2xl">Congratulations on your engagement. This builder helps us create your personal ForeverVow wedding website. You can update everything later from your Couple Dashboard.</p>}
          </div>

          <div className="space-y-8">
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Bride's Full Name" name="bride" required />
                <Field label="Groom's Full Name" name="groom" required />
                <Field label="Preferred Display Name" name="display_name" required />
                <Field label="Primary Email Address" name="email" type="email" required />
                <Field label="Phone Number" name="phone" required />
                <Field label="Wedding Hashtag" name="hashtag" />
                <Field label="Instagram Handle" name="instagram" />
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5">
                <Field label="How did you meet?" name="how_met" textarea required />
                <Field label="Tell us your love story" name="love_story" textarea required />
                <Field label="Tell us about the proposal" name="proposal" textarea required />
                <Field label="Welcome message for your guests" name="welcome_message" textarea required />
              </div>
            )}

            {step === 2 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Wedding Date" name="wedding_date" type="date" required />
                <Field label="Ceremony Start Time" name="ceremony_time" type="time" required />
                <Field label="Reception Start Time" name="reception_time" type="time" />
                <Field label="Wedding Theme" name="theme" options={["Luxury", "Classic", "Modern", "Garden", "Beach", "Rustic", "Traditional", "Minimal", "Other"]} required />
                <Field label="Wedding Colours" name="colors" />
                <Field label="Dress Code" name="dress_code" options={["Black Tie", "Formal", "Semi Formal", "Smart Casual", "Traditional", "Other"]} />
                <Field label="Wedding Website URL" name="slug" />
                <div className="md:col-span-2 text-[12.5px] text-[#8d7962] bg-[#f8eee0] border border-[#e8d2b6] rounded-[14px] p-4">Suggested URL: <strong className="text-[#b0743c]">/wedding/{suggestedSlug}</strong></div>
              </div>
            )}

            {step === 3 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Venue Name" name="ceremony_venue" required />
                <Field label="Street Address" name="ceremony_address" required />
                <Field label="City" name="city" required />
                <Field label="Country" name="country" required />
                <div className="md:col-span-2"><Field label="Google Maps Link" name="ceremony_maps" required /></div>
                <div className="md:col-span-2"><Field label="Parking Instructions" name="parking" textarea /></div>
                <div className="md:col-span-2"><Field label="Venue Notes" name="venue_notes" textarea /></div>
              </div>
            )}

            {step === 4 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Reception Venue Name" name="reception_venue" />
                <Field label="Reception Address" name="reception_address" />
                <div className="md:col-span-2"><Field label="Google Maps Link" name="reception_maps" /></div>
                <div className="md:col-span-2"><Field label="Parking Information" name="reception_parking" textarea /></div>
                <div className="md:col-span-2"><Field label="Reception Notes" name="reception_notes" textarea /></div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="rounded-[20px] border border-[#e6d4be] p-4 grid md:grid-cols-5 gap-3">
                    <input value={item.event_name} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, event_name: e.target.value } : x))} placeholder="Event Name" className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />
                    <input type="time" value={item.start_time} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, start_time: e.target.value } : x))} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />
                    <input type="time" value={item.end_time} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, end_time: e.target.value } : x))} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />
                    <input value={item.location} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, location: e.target.value } : x))} placeholder="Location" className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />
                    <input value={item.description} onChange={e => setTimeline(list => list.map((x, i) => i === index ? { ...x, description: e.target.value } : x))} placeholder="Description" className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />
                  </div>
                ))}
                <button onClick={() => setTimeline([...timeline, { event_name: "", start_time: "", end_time: "", location: "", description: "" }])} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d9c6ae] text-[#5a4735]"><Plus size={14}/> Add Event</button>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <Field label="Will you provide accommodation?" name="has_accommodation" options={["No", "Yes"]} />
                {accommodations.map((a, index) => (
                  <div key={index} className="rounded-[20px] border border-[#e6d4be] p-4 grid md:grid-cols-2 gap-3 relative">
                    <button onClick={() => setAccommodations(list => list.filter((_, i) => i !== index))} className="absolute right-3 top-3 text-[#a64838]"><Trash2 size={14}/></button>
                    {Object.keys(a).map(key => <input key={key} value={(a as any)[key]} onChange={e => setAccommodations(list => list.map((x, i) => i === index ? { ...x, [key]: e.target.value } : x))} placeholder={key.replace(/_/g, " ")} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />)}
                  </div>
                ))}
                <button onClick={() => setAccommodations([...accommodations, { name: "", address: "", maps: "", phone: "", website: "", distance: "", parking: "", notes: "" }])} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d9c6ae] text-[#5a4735]"><Plus size={14}/> Add Accommodation</button>
              </div>
            )}

            {step === 7 && (
              <div className="grid gap-5">
                <Field label="Will your venue require a map?" name="needs_map" options={["No", "Yes"]} />
                <Field label="Venue map URL or uploaded file link" name="venue_map_url" />
                <Field label="Optional map notes and important locations" name="map_notes" textarea />
                <div className="rounded-[18px] bg-[#fcf7f1] border border-[#eadfd1] p-4 text-[13px] text-[#6b5d4f]">Default markers generated: Parking, Bathrooms, Dance Floor, Food Area, Bar, Photo Booth, Gift Table, Emergency Exit, VIP Area, Kids Area, Wheelchair Access.</div>
              </div>
            )}

            {step === 8 && (
              <div className="grid gap-5">
                <Field label="Hero Image URL" name="hero_image" required />
                <Field label="Cover Image URL" name="cover_image" required />
                <Field label="Story Images" name="story_images" textarea />
                <Field label="Engagement Photos" name="engagement_photos" textarea />
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-[#a67c54] mb-2">Gallery Photos</label>
                  <div className="space-y-2">
                    {galleryUrls.map((url, index) => <input key={index} value={url} onChange={e => setGalleryUrls(list => list.map((x, i) => i === index ? e.target.value : x))} placeholder="Image URL" className="w-full rounded-[14px] border border-[#e0ccb2] px-4 py-3 text-[14px]" />)}
                  </div>
                  <button onClick={() => setGalleryUrls([...galleryUrls, ""])} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d9c6ae] text-[#5a4735]"><Upload size={14}/> Add Image</button>
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Estimated Number of Guests" name="estimated_guests" type="number" required />
                <Field label="Maximum Capacity" name="capacity" type="number" />
                <Field label="Children Allowed?" name="children_allowed" options={["Yes", "No"]} />
                <Field label="Plus Ones Allowed?" name="plus_ones" options={["Yes", "No"]} />
                <Field label="RSVP Deadline" name="rsvp_deadline" type="date" required />
              </div>
            )}

            {step === 10 && (
              <div className="grid md:grid-cols-2 gap-5">
                {["dietary", "guest_messages", "guestbook", "guest_moments", "guest_photos", "live_updates", "live_mode"].map(key => <Field key={key} label={key.replace(/_/g, " ")} name={key} options={["Yes", "No"]} />)}
              </div>
            )}

            {step === 11 && (
              <div className="space-y-4">
                {vendors.map((v, index) => (
                  <div key={v.role} className="rounded-[20px] border border-[#e6d4be] p-4">
                    <div className="font-semibold text-[#2a231d] mb-3">{v.role}</div>
                    <div className="grid md:grid-cols-5 gap-3">
                      {(["business_name", "contact", "instagram", "website", "logo"] as const).map(key => <input key={key} value={v[key]} onChange={e => setVendors(list => list.map((x, i) => i === index ? { ...x, [key]: e.target.value } : x))} placeholder={key.replace(/_/g, " ")} className="rounded-[12px] border border-[#e0ccb2] px-3 py-2 text-[13px]" />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 12 && (
              <div className="grid gap-5">
                <Field label="Pinterest Board" name="pinterest" />
                <Field label="Instagram Inspiration" name="instagram_inspiration" />
                <Field label="Mood Board" name="mood_board" />
                <Field label="Additional Design Notes" name="design_notes" textarea />
              </div>
            )}

            {step === 13 && (
              <div className="grid gap-5">
                <Field label="Anything else guests should know?" name="guest_info" textarea />
                <Field label="Special Requests" name="special_requests" textarea />
                <Field label="Additional Information" name="additional_info" textarea />
              </div>
            )}

            {step === 14 && (
              <div className="space-y-6">
                <div className="rounded-[22px] bg-[#fcf7f1] border border-[#eadfd1] p-5">
                  <h3 className="display text-[26px] text-[#2a231d]">Review</h3>
                  <div className="mt-3 text-[14px] text-[#6b5d4f] grid md:grid-cols-2 gap-2">
                    <div>Couple: <strong>{displayName}</strong></div>
                    <div>Date: <strong>{form.wedding_date ? format(new Date(form.wedding_date), "d MMM yyyy") : "Missing"}</strong></div>
                    <div>Venue: <strong>{form.ceremony_venue || "Missing"}</strong></div>
                    <div>URL: <strong>/wedding/{suggestedSlug}</strong></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    ["confirm_date", "Wedding date is correct"],
                    ["confirm_venue", "Venue details are correct"],
                    ["confirm_maps", "Google Maps links are correct"],
                    ["confirm_images", "Images have been uploaded"],
                    ["confirm_timeline", "Timeline is complete"],
                    ["confirm_guests", "Guest settings are correct"],
                    ["confirm_contact", "Contact information is correct"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 rounded-[14px] border border-[#e6d4be] p-3 text-[13.5px] text-[#5a4735]"><input type="checkbox" checked={!!form[key]} onChange={e => update(key as string, e.target.checked)} /> {label}</label>
                  ))}
                </div>
                <button onClick={submit} className="w-full py-4 rounded-full bg-[#2b2723] text-[#f9f2e8] font-semibold flex items-center justify-center gap-2"><Send size={16}/> Submit and Generate Wedding</button>
              </div>
            )}

            {generated && (
              <div className="mt-8 rounded-[24px] border border-[#d2e2d0] bg-[#eff6ee] p-6">
                <div className="flex items-center gap-3 mb-4 text-[#4f7a56]"><CheckCircle2 size={22}/><div className="display text-[28px]">Wedding Generated</div></div>
                <div className="grid gap-3 text-[13.5px] text-[#2a231d]">
                  <div>Wedding ID: <code>{generated.wedding.id}</code></div>
                  <div>Couple Link: <code>{generated.coupleLink}</code></div>
                  <div>Guest Link: <code>{generated.guestLink}</code></div>
                  <div>Access Code: <code className="tracking-[0.18em]">{generated.accessCode}</code></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/couple/${generated.wedding.slug}`} className="px-5 py-3 rounded-full bg-[#2b2723] text-[#f9f2e8] text-[13px]">Open Couple Link</Link>
                  <Link to={`/wedding/${generated.wedding.slug}?preview=1`} className="px-5 py-3 rounded-full border border-[#d9c6ae] text-[#5a4735] text-[13px]">Preview Guest Site</Link>
                  <Link to="/admin/dashboard" className="px-5 py-3 rounded-full border border-[#d9c6ae] text-[#5a4735] text-[13px]">Back to Admin</Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#e6d4be]">
            <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-full border border-[#d9c6ae] text-[#5a4735] disabled:opacity-40 flex items-center gap-2"><ArrowLeft size={14}/> Previous</button>
            {step < sections.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-3 rounded-full bg-[#2b2723] text-[#f9f2e8] flex items-center gap-2">Next <ArrowRight size={14}/></button>
            ) : (
              <button onClick={submit} className="px-6 py-3 rounded-full bg-[#2b2723] text-[#f9f2e8] flex items-center gap-2">Submit <Send size={14}/></button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}