import { ArrowRight, Heart, Images } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { featuredWeddingForWeek, usePublishedWeddings } from "@/hooks/usePublishedWeddings";

const Index = () => {
  const weddings = usePublishedWeddings();
  const featured = featuredWeddingForWeek((weddings.data || []).filter((wedding) => wedding.cover_image));
  const featuredImage = featured?.cover_image;

  return <main className="couple-app min-h-[100svh] bg-[#171717] text-white">
    <div className="relative mx-auto min-h-[100svh] max-w-[520px] overflow-hidden bg-black">
      {featuredImage && <img src={featuredImage} alt={featured.couple_names + " on their wedding day"} className="absolute inset-0 h-full w-full object-cover" />}
      {!featuredImage && <div className="absolute inset-0 bg-[linear-gradient(145deg,#222_0%,#111_48%,#193c38_100%)]" />}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="relative flex min-h-[100svh] flex-col px-6 pb-[max(32px,env(safe-area-inset-bottom))] pt-[max(32px,env(safe-area-inset-top))]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-black"><Heart className="h-4 w-4 fill-current" /></span>ForeverVow
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.65 }} className="mt-auto">
          {featured && <p className="mb-3 text-xs font-semibold text-white/70">Featured wedding · {featured.couple_names}</p>}
          <h1 className="max-w-sm text-4xl font-semibold leading-tight">Your wedding, beautifully connected.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Plan together, welcome your guests, collect RSVPs, and keep every memory close.</p>
          <Link to="/couple-login" className="mt-7 flex h-14 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-semibold text-black">Get started<span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><ArrowRight className="h-4 w-4" /></span></Link>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link to="/couple-login" className="flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 text-xs font-semibold backdrop-blur">Sign in</Link>
            <Link to="/weddings" className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-semibold backdrop-blur"><Images className="h-4 w-4" />View weddings</Link>
          </div>
        </motion.div>
      </div>
    </div>
  </main>;
};

export default Index;
