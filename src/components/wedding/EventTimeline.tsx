import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

interface Event {
  id: string;
  title: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
}

interface EventTimelineProps {
  events?: Event[];
}

const EventTimeline = ({ events }: EventTimelineProps) => {
  const items = events || [];

  if (items.length === 0) return null;

  return (
    <section className="wedding-section bg-wedding-champagne/40">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="mb-3 font-body text-xs font-semibold text-muted-foreground">The celebration</p>
          <h2 className="font-body text-3xl font-semibold">Wedding schedule</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-wedding-gold/20 lg:-translate-x-px" />

          {items.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="relative mb-4 last:mb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-6 lg:left-1/2 top-1 w-3 h-3 -translate-x-1.5 lg:-translate-x-1.5 rounded-full bg-wedding-gold/60 border-2 border-background z-10" />

              {/* Mobile: simple left-aligned stack */}
              <div className="ml-12 space-y-1 rounded-2xl bg-white/75 p-4 shadow-sm lg:hidden">
                {event.event_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-wedding-gold/70" strokeWidth={1.5} />
                    <span className="font-body text-xs font-semibold text-foreground">{event.event_time}</span>
                  </div>
                )}
                <h3 className="font-body text-lg font-semibold">{event.title}</h3>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground/60" strokeWidth={1.5} />
                    <span className="font-body text-xs text-muted-foreground">{event.location}</span>
                  </div>
                )}
                {event.description && (
                  <p className="font-body text-xs font-light text-muted-foreground leading-relaxed pt-1">{event.description}</p>
                )}
              </div>

              {/* Desktop: zigzag layout */}
              <div className={`hidden lg:grid lg:grid-cols-2 lg:gap-12`}>
                <div className={`${i % 2 === 0 ? "text-right pr-12" : "order-2 pl-12"}`}>
                  <div className={`flex items-center gap-2 ${i % 2 === 0 ? "justify-end" : ""}`}>
                    <Clock className="w-3.5 h-3.5 text-wedding-gold/70" strokeWidth={1.5} />
                    <span className="font-display text-xl font-light text-wedding-gold">{event.event_time}</span>
                  </div>
                  {event.location && (
                    <div className={`flex items-center gap-2 mt-1 ${i % 2 === 0 ? "justify-end" : ""}`}>
                      <MapPin className="w-3 h-3 text-muted-foreground/60" strokeWidth={1.5} />
                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{event.location}</span>
                    </div>
                  )}
                </div>
                <div className={`${i % 2 === 0 ? "pl-12" : "order-1 text-right pr-12"}`}>
                  <h3 className="font-display text-3xl font-light mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="font-body text-sm font-light text-muted-foreground leading-relaxed">{event.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventTimeline;
