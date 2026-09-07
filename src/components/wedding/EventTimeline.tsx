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

  if (items.length === 0) return <section className="wedding-section font-body"><h2 className="text-2xl font-semibold">Wedding schedule</h2><p className="mt-4 text-sm text-muted-foreground">The couple will share the schedule here when it is ready.</p></section>;

  return (
    <section className="wedding-section guest-schedule">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="guest-section-heading"
        >
          <p className="guest-kicker">The celebration</p>
          <h2>Wedding schedule</h2>
          <p>Everything happening on the day, in one place.</p>
        </motion.div>

        <div className="guest-event-list">
          {items.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className={`guest-event-card tone-${i % 3}`}
            >
              <div>
                {event.event_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                    <span className="font-body text-xs font-semibold">{event.event_time}</span>
                  </div>
                )}
                <h3 className="font-body text-lg font-semibold">{event.title}</h3>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" strokeWidth={1.8} />
                    <span className="font-body text-xs">{event.location}</span>
                  </div>
                )}
                {event.description && (
                  <p className="font-body text-xs leading-relaxed pt-2">{event.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventTimeline;
