import { ArrowLeft, ArrowUpRight, CalendarDays, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublishedWeddings } from "@/hooks/usePublishedWeddings";

export default function WeddingsShowcase() {
  const weddings = usePublishedWeddings();
  return <main className="couple-app min-h-screen bg-[#101010] px-4 pb-12 pt-[max(24px,env(safe-area-inset-top))] text-[#f7f7f2]">
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between">
        <Link to="/" aria-label="Back home" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#202020]"><ArrowLeft className="h-4 w-4" /></Link>
        <span className="flex items-center gap-2 text-sm font-semibold"><Heart className="h-4 w-4 fill-[#ff6245] text-[#ff6245]" />ForeverVow</span>
      </header>
      <div className="pb-8 pt-10">
        <p className="text-xs font-semibold text-[#ff765d]">Real celebrations</p>
        <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">See how ForeverVow brings each wedding together.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Explore published wedding experiences created by couples using ForeverVow.</p>
      </div>
      {weddings.isLoading && <div role="status" className="rounded-[26px] bg-[#202020] p-6 text-sm text-white/60">Loading weddings...</div>}
      {weddings.error && <div role="alert" className="rounded-[26px] bg-[#321010] p-6 text-sm text-[#ffaaa4]">Weddings could not be loaded right now.</div>}
      {!weddings.isLoading && !weddings.error && !weddings.data?.length && <div className="rounded-[26px] border border-white/10 bg-[#202020] p-6"><h2 className="text-xl font-semibold">The showcase is coming together</h2><p className="mt-2 text-sm text-white/55">Published weddings will appear here as couples choose to share them.</p></div>}
      <section className="grid gap-4 sm:grid-cols-2">
        {weddings.data?.map((wedding, index) => {
          const image = wedding.cover_image;
          return <Link key={wedding.id} to={"/wedding/" + wedding.slug} className="group relative min-h-[390px] overflow-hidden rounded-[28px] bg-[#202020]">
            {image ? <><img src={image} alt="" aria-hidden="true" loading="lazy" className="absolute -inset-5 h-[calc(100%+40px)] w-[calc(100%+40px)] object-cover blur-xl opacity-70" /><img src={image} alt={wedding.couple_names + " wedding"} loading="lazy" className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" /></> : <div className={"absolute inset-0 " + (index % 2 ? "bg-[#22c4b5]" : "bg-[#b2dc6b]")} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5"><div className="flex items-end justify-between gap-4">
              <div><h2 className="text-2xl font-semibold">{wedding.couple_names}</h2>
                {wedding.wedding_date && <p className="mt-2 flex items-center gap-2 text-xs text-white/70"><CalendarDays className="h-4 w-4" />{new Date(wedding.wedding_date.slice(0,10) + "T12:00:00").toLocaleDateString(undefined,{ day: "numeric", month: "long", year: "numeric" })}</p>}
                {wedding.ceremony_venue && <p className="mt-1 flex items-center gap-2 text-xs text-white/70"><MapPin className="h-4 w-4" />{wedding.ceremony_venue}</p>}
              </div>
              <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#ff6245] text-black"><ArrowUpRight className="h-5 w-5" /></span>
            </div></div>
          </Link>;
        })}
      </section>
    </div>
  </main>;
}
