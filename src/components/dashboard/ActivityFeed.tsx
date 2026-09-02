import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "rsvp" | "rsvp_declined" | "guestbook" | "photo" | "checkin" | "moment";
  name: string;
  detail: string;
  timestamp: string;
}

interface ActivityFeedProps {
  rsvps: any[];
  guestbookMessages: any[];
  guestPhotos: any[];
  checkins: any[];
  moments?: any[];
}

const ActivityFeed = ({ rsvps, guestbookMessages, guestPhotos, checkins, moments = [] }: ActivityFeedProps) => {
  const activities: ActivityItem[] = [
    ...rsvps.slice(0, 10).map((r) => ({
      id: `rsvp-${r.id}`,
      type: (r.attending === false ? "rsvp_declined" : "rsvp") as ActivityItem["type"],
      name: r.guest_name,
      detail:
        r.attending === true
          ? `is coming!${r.guest_count >= 3 ? " 🎉" : ""} (${r.guest_count} guest${r.guest_count === 1 ? "" : "s"})`
          : r.attending === false
          ? "won't be able to make it"
          : "submitted an RSVP",
      timestamp: r.submitted_at,
    })),
    ...guestbookMessages.slice(0, 10).map((m) => ({
      id: `guestbook-${m.id}`,
      type: "guestbook" as const,
      name: m.guest_name,
      detail: "left you a message",
      timestamp: m.created_at,
    })),
    ...guestPhotos.slice(0, 10).map((p) => ({
      id: `photo-${p.id}`,
      type: "photo" as const,
      name: p.guest_name || "A guest",
      detail: "uploaded a photo",
      timestamp: p.created_at,
    })),
    ...checkins.slice(0, 10).map((c) => ({
      id: `checkin-${c.id}`,
      type: "checkin" as const,
      name: c.guest_name,
      detail: "has arrived! 🎊",
      timestamp: c.checkin_time,
    })),
    ...moments.slice(0, 10).map((m) => ({
      id: `moment-${m.id}`,
      type: "moment" as const,
      name: m.guest_name,
      detail: m.message ? "shared a moment" : "shared a photo",
      timestamp: m.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  const getDotColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "rsvp": return "bg-wedding-sage";
      case "rsvp_declined": return "bg-muted-foreground";
      case "guestbook": return "bg-primary";
      case "photo": return "bg-wedding-gold";
      case "checkin": return "bg-amber-500";
      case "moment": return "bg-purple-500";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isNew = (timestamp: string) => {
    return new Date().getTime() - new Date(timestamp).getTime() < 3600000;
  };

  return (
    <div className="border border-border bg-background">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Activity className="w-4 h-4 text-wedding-gold" />
        <h3 className="font-body text-xs tracking-[0.15em] uppercase">What's Happening</h3>
      </div>

      <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getDotColor(activity.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm">
                  <span className="font-medium">{activity.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.detail}</span>
                  {isNew(activity.timestamp) && (
                    <span className="ml-2 inline-block bg-wedding-gold/20 text-wedding-gold font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5">
                      NEW
                    </span>
                  )}
                </p>
                <p className="font-body text-[10px] text-muted-foreground/70 mt-0.5">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Activity className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" strokeWidth={1} />
            <p className="font-body text-sm text-muted-foreground">No activity yet</p>
            <p className="font-body text-xs text-muted-foreground/70 mt-1">
              Guest interactions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
