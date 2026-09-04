import { ArrowRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import weddingCover from "@/assets/wedding-cover.jpg";

const Index = () => (
  <main className="couple-app min-h-[100svh] bg-[#171717] text-white">
    <div className="relative mx-auto min-h-[100svh] max-w-[520px] overflow-hidden bg-black">
      <img src={weddingCover} alt="A joyful newlywed couple" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black via-black/65 to-transparent" />

      <div className="relative flex min-h-[100svh] flex-col px-6 pb-8 pt-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-black"><Heart className="h-4 w-4 fill-current" /></span>
          ForeverVow
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.65 }} className="mt-auto">
          <p className="text-xs font-semibold text-white/70">YOUR WEDDING, ALL TOGETHER</p>
          <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-tight">A beautiful place for everything that matters.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Plan together, welcome your guests, collect RSVPs, and keep every memory close.</p>

          <Link to="/couple-login" className="mt-7 flex h-14 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-semibold text-black">
            Get started
            <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><ArrowRight className="h-4 w-4" /></span>
          </Link>
          <div className="mt-5 flex items-center justify-between text-xs text-white/65">
            <Link to="/couple-login">Already have an account? <span className="font-semibold text-white">Sign in</span></Link>
            <Link to="/admin/login" className="font-semibold text-white">Owner access</Link>
          </div>
        </motion.div>
      </div>
    </div>
  </main>
);

export default Index;
