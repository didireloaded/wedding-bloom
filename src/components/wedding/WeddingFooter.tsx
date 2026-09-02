import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface WeddingFooterProps {
  coupleNames?: string;
  date?: string;
  venue?: string;
}

const WeddingFooter = ({ coupleNames = "John & Anna", date = "24 JUNE 2026", venue = "TUSCANY, ITALY" }: WeddingFooterProps) => {
  return (
    <footer className="py-24 md:py-32 px-6 bg-foreground text-background">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="wedding-ornament mb-8">
            <Heart className="w-5 h-5 text-background/30" strokeWidth={1} fill="currentColor" />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-light mb-6 tracking-wide">
            {coupleNames}
          </h2>

          <p className="font-body text-[10px] sm:text-xs tracking-[0.4em] uppercase opacity-50 mb-4">
            {date}{venue ? ` · ${venue}` : ""}
          </p>

          <div className="w-12 h-px bg-background/20 mx-auto my-10" />

          <p className="font-display text-lg sm:text-xl italic font-light opacity-60 max-w-md mx-auto leading-relaxed">
            "We look forward to celebrating with you."
          </p>

          <p className="font-body text-[9px] tracking-[0.3em] uppercase opacity-20 mt-16">
            MADE WITH LOVE
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default WeddingFooter;
