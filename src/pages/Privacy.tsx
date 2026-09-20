import { ArrowLeft, Camera, Contact, Cookie, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  { icon: Contact, title: "RSVP information", body: "Your name, response, party size, optional contact details, dietary information, and message are available to the couple and authorised wedding managers so they can organise the event." },
  { icon: Camera, title: "Photos and messages", body: "Guest photos, moments, and guestbook messages are held for review. Content approved by the couple can appear on that wedding's guest page, where other invited guests may see it." },
  { icon: Cookie, title: "This device", body: "ForeverVow stores a wedding-specific guest session in this browser so you can update your response, receive in-app reminders, share memories, and check in without creating an account." },
  { icon: ShieldCheck, title: "Your choices", body: "Contact the couple if you need your RSVP corrected or removed, or want an approved photo or message taken down. Do not upload content you do not have permission to share." },
];

const Privacy = () => {
  const navigate = useNavigate();
  return <main className="min-h-screen bg-[#111111] px-5 py-8 text-white sm:py-14">
    <div className="mx-auto max-w-2xl">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 font-body text-xs font-semibold text-white/80">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <p className="mt-10 font-body text-xs font-semibold text-[#b2dc6b]">Guest privacy</p>
      <h1 className="mt-3 font-body text-3xl font-semibold sm:text-5xl">How wedding information is used</h1>
      <p className="mt-4 max-w-xl font-body text-sm leading-7 text-white/60">This notice covers information guests provide through a ForeverVow wedding invitation. Each couple manages the information collected for their wedding.</p>
      <div className="mt-10 space-y-3">
        {sections.map(({ icon: Icon, title, body }) => (
          <section key={title} className="rounded-[24px] border border-white/10 bg-[#202020] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff6245] text-black"><Icon className="h-5 w-5" /></span>
              <div><h2 className="font-body text-base font-semibold">{title}</h2><p className="mt-2 font-body text-sm leading-6 text-white/60">{body}</p></div>
            </div>
          </section>
        ))}
      </div>
    </div>
  </main>
};

export default Privacy;
