import { Check, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SetupProgressProps {
  wedding: any;
  eventsCount: number;
  hasSharedLink: boolean;
}

const SetupProgress = ({ wedding, eventsCount, hasSharedLink }: SetupProgressProps) => {
  const steps = [
    { label: "Wedding Details Added", done: !!wedding?.couple_names && !!wedding?.wedding_date },
    { label: "Venue Added", done: !!wedding?.ceremony_venue },
    { label: "Events Added", done: eventsCount > 0 },
    { label: "Theme Selected", done: !!wedding?.theme_id || !!wedding?.theme },
    { label: "Invitation Shared", done: hasSharedLink || !!wedding?.published },
  ];

  const completed = steps.filter((s) => s.done).length;
  const percent = Math.round((completed / steps.length) * 100);

  return (
    <div className="border border-border bg-background p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body text-xs tracking-[0.15em] uppercase">Wedding Setup Progress</h3>
        <span className="font-body text-xs text-muted-foreground">
          {completed} / {steps.length} completed
        </span>
      </div>

      <Progress value={percent} className="h-2 mb-5" />

      <ul className="space-y-3">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-3">
            {step.done ? (
              <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-background" />
              </div>
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
            )}
            <span
              className={`font-body text-sm ${
                step.done ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SetupProgress;
