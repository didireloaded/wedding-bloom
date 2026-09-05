import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface WeddingFooterProps {
  coupleNames?: string;
  date?: string;
  venue?: string;
}

const WeddingFooter = ({ coupleNames = "John & Anna", date = "24 JUNE 2026", venue = "TUSCANY, ITALY" }: WeddingFooterProps) => {
  return (
    <footer className="bg-foreground px-6 py-16 text-background md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="mb-6 flex justify-center">
            <Heart className="w-5 h-5 text-background/30" strokeWidth={1} fill="currentColor" />
          </div>

          <h2 className="mb-4 font-body text-3xl font-semibold sm:text-4xl">
            {coupleNames}
          </h2>

          <p className="mb-4 font-body text-xs opacity-60">
            {date}{venue ? ` · ${venue}` : ""}
          </p>

          <div className="w-12 h-px bg-background/20 mx-auto my-10" />

          <p className="mx-auto max-w-md font-body text-sm leading-relaxed opacity-70 sm:text-base">
            "We look forward to celebrating with you."
          </p>

          <p className="mt-10 font-body text-xs opacity-40">
            Made with ForeverVow
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default WeddingFooter;
