import { ExternalLink, CalendarPlus, Image, Users, Pencil } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
  weddingSlug: string;
  onEditDetails: () => void;
  onTabChange?: (tab: string) => void;
}

const QuickActions = ({ weddingSlug, onEditDetails, onTabChange }: QuickActionsProps) => {
  const scrollTo = (id: string) => {
    if (id === "dashboard-activity" && onTabChange) {
      onTabChange("guests");
      return;
    }
    if (id === "dashboard-photos" && onTabChange) {
      onTabChange("moments");
      return;
    }
    if (id === "dashboard-messages" && onTabChange) {
      onTabChange("guests");
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      toast.info("This section is available below — scroll down to find it.");
    }
  };

  return (
    <div className="border border-border bg-background p-5">
      <h3 className="font-body text-xs tracking-[0.15em] uppercase mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onEditDetails}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border font-body text-xs tracking-[0.1em] uppercase hover:bg-muted transition-colors min-h-[40px]"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Wedding Details
        </button>
        <button
          onClick={() => scrollTo("dashboard-activity")}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border font-body text-xs tracking-[0.1em] uppercase hover:bg-muted transition-colors min-h-[40px]"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          View RSVPs
        </button>
        <button
          onClick={() => scrollTo("dashboard-photos")}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border font-body text-xs tracking-[0.1em] uppercase hover:bg-muted transition-colors min-h-[40px]"
        >
          <Image className="w-3.5 h-3.5" />
          Manage Photos
        </button>
        <button
          onClick={() => scrollTo("dashboard-messages")}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border font-body text-xs tracking-[0.1em] uppercase hover:bg-muted transition-colors min-h-[40px]"
        >
          <Users className="w-3.5 h-3.5" />
          View Guest Messages
        </button>
        <a
          href={`/wedding/${weddingSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border font-body text-xs tracking-[0.1em] uppercase hover:bg-muted transition-colors min-h-[40px]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Preview Invitation
        </a>
      </div>
    </div>
  );
};

export default QuickActions;
