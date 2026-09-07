import { motion } from "framer-motion";
import { Bell } from "lucide-react";

interface WeddingUpdatesProps {
  updates: { id: string; message: string; created_at: string }[];
}

const WeddingUpdates = ({ updates }: WeddingUpdatesProps) => {
  return (
    <section className="wedding-section guest-updates">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="guest-section-heading"
        >
          <p className="guest-kicker">Announcements</p>
          <h2>Updates</h2>
          <p>Important notes from the couple will appear here.</p>
        </motion.div>

        <div className="space-y-4">
          {updates.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`guest-update-card tone-${i % 3}`}
            >
              <Bell className="w-5 h-5 text-wedding-gold shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-body text-sm">{u.message}</p>
                <p className="wedding-label mt-2">
                  {new Date(u.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeddingUpdates;
