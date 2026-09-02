import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import heroImg1 from "@/assets/wedding-hero-1.jpg";

interface WeddingStoryProps {
  story?: string;
  weddingDate?: string | null;
  onAddToCalendar?: () => void;
  storyImage?: string | null;
}

const WeddingStory = ({ story, weddingDate, onAddToCalendar, storyImage }: WeddingStoryProps) => {
  const defaultStory = "We met on a warm September evening at a friend's dinner party. What started as a conversation about travel and coffee turned into hours of laughter. Three years of adventures later, on a quiet Valentine's evening overlooking the Amalfi Coast, John got down on one knee. Now we're ready for our greatest adventure yet — and we want you to be part of it.";

  return (
    <section className="wedding-section bg-wedding-blush/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            <div className="arch-image aspect-[3/4] max-w-sm mx-auto lg:mx-0 shadow-2xl shadow-foreground/5">
              <img src={storyImage || heroImg1} alt="Our story" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <p className="wedding-label mb-4">OUR STORY</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light italic mb-8 leading-tight">
              A love story written in the stars
            </h2>
            <div className="wedding-divider lg:!mx-0 mb-8" />
            <p className="font-body text-sm md:text-base font-light leading-[2] text-muted-foreground max-w-lg mx-auto lg:mx-0">
              {story || defaultStory}
            </p>

            {weddingDate && onAddToCalendar && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-10 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center"
              >
                <p className="font-body text-xs text-muted-foreground tracking-wide">
                  Don't forget to save the date
                </p>
                <button
                  onClick={onAddToCalendar}
                  className="inline-flex items-center gap-2 border border-foreground/20 px-6 py-2.5 font-body text-[10px] tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-all min-h-[44px]"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> ADD TO CALENDAR
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WeddingStory;
