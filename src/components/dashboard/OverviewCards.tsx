import { motion } from "framer-motion";
import { Users, Clock, UserX, UserCheck, Camera, Utensils } from "lucide-react";

interface DietaryItem {
  label: string;
  count: number;
}

interface OverviewCardsProps {
  confirmedGuests: number;
  pendingRsvps: number;
  declinedGuests: number;
  checkins: number;
  photoUploads: number;
  dietarySummary: DietaryItem[];
  pendingMoments?: number;
}

const OverviewCards = ({
  confirmedGuests,
  pendingRsvps,
  declinedGuests,
  checkins,
  photoUploads,
  dietarySummary,
  pendingMoments = 0,
}: OverviewCardsProps) => {
  const dietaryTotal = dietarySummary.reduce((sum, d) => sum + d.count, 0);

  const stats = [
    { label: "Confirmed Guests", value: confirmedGuests, icon: Users, color: "text-wedding-sage", border: "border-t-wedding-sage" },
    { label: "Pending RSVPs", value: pendingRsvps, icon: Clock, color: "text-amber-500", border: "border-t-amber-500" },
    { label: "Declined", value: declinedGuests, icon: UserX, color: "text-muted-foreground", border: "border-t-muted-foreground" },
    { label: "Checked In", value: checkins, icon: UserCheck, color: "text-wedding-gold", border: "border-t-wedding-gold" },
    { label: "Photos Uploaded", value: photoUploads, icon: Camera, color: "text-primary", border: "border-t-primary" },
    { label: "Dietary Requests", value: dietaryTotal, icon: Utensils, color: "text-wedding-sage", border: "border-t-wedding-sage", dietary: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className={`p-4 sm:p-5 border border-border border-t-2 ${stat.border} bg-background hover:bg-wedding-champagne/10 transition-colors`}
        >
          <div className="flex items-center justify-between mb-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
          </div>
          <p className="font-display text-3xl sm:text-4xl font-light">{stat.value}</p>
          <p className="font-body text-[10px] sm:text-xs tracking-[0.1em] text-muted-foreground mt-1 uppercase">
            {stat.label}
          </p>
          {stat.dietary && (
            <p className="font-body text-[9px] text-muted-foreground mt-2 leading-relaxed">
              {dietarySummary.length > 0
                ? dietarySummary.slice(0, 3).map((d) => `${d.label} · ${d.count}`).join("   ")
                : "None reported"}
            </p>
          )}
        </motion.div>
      ))}
      {pendingMoments > 0 && (
        <div className="col-span-2 md:col-span-3 lg:col-span-6 flex items-center gap-2 p-3 border border-amber-200/60 bg-amber-50/30 dark:bg-amber-900/10">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <p className="font-body text-xs text-amber-800 dark:text-amber-300">
            <span className="font-medium">{pendingMoments} moment{pendingMoments > 1 ? "s" : ""}</span> waiting for approval in the Live Feed.
          </p>
        </div>
      )}
    </div>
  );
};

export default OverviewCards;
