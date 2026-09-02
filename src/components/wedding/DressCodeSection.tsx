import { motion } from "framer-motion";
import { Shirt } from "lucide-react";

interface DressCodeSectionProps {
  dressCode?: string | null;
}

const DressCodeSection = ({ dressCode }: DressCodeSectionProps) => {
  const code = dressCode || "Formal Attire";

  return (
    <section className="py-16 md:py-24 px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="w-14 h-14 rounded-full bg-wedding-champagne/50 flex items-center justify-center mx-auto mb-6">
          <Shirt className="w-6 h-6 text-wedding-gold" strokeWidth={1} />
        </div>
        <p className="wedding-label mb-3">DRESS CODE</p>
        <h3 className="font-display text-2xl sm:text-3xl font-light italic">{code}</h3>
        <div className="wedding-divider mt-6" />
      </motion.div>
    </section>
  );
};

export default DressCodeSection;
