import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";

interface WeddingStoryProps {
  story?: string;
  weddingDate?: string | null;
  onAddToCalendar?: () => void;
  storyImage?: string | null;
}

const WeddingStory = ({ story, weddingDate, onAddToCalendar, storyImage }: WeddingStoryProps) => {
  return (
    <section className="wedding-section bg-wedding-blush/50">
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 gap-12 items-center ${storyImage ? "lg:grid-cols-2 lg:gap-20" : ""}`}>
          {storyImage && <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            <div className="arch-image aspect-[3/4] max-w-sm mx-auto lg:mx-0 shadow-2xl shadow-foreground/5">
              <img src={storyImage} alt="Our story" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </motion.div>}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <p className="mb-3 font-body text-xs font-semibold text-muted-foreground">Our story</p>
            <h2 className="mb-5 font-body text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              How we found each other
            </h2>
            <p className="mx-auto max-w-lg font-body text-sm leading-7 text-muted-foreground md:text-base lg:mx-0">
              {story}
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
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-body text-xs font-semibold text-background transition-opacity hover:opacity-85"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Add to calendar
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
