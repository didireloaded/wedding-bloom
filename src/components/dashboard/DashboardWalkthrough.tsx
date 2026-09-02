import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WalkthroughStep {
  title: string;
  description: string;
  targetId?: string;
}

const STEPS: WalkthroughStep[] = [
  {
    title: "Welcome to Your Wedding Dashboard",
    description:
      "Here you can manage your wedding website, add details for your guests, and track RSVPs.",
  },
  {
    title: "Your Wedding Link",
    description:
      "This is your personal wedding link. Send this link to your guests so they can view your invitation and RSVP.",
    targetId: "share-wedding-section",
  },
  {
    title: "Digital Invitation",
    description:
      "This section controls your digital wedding invitation. Guests will see this when they open your wedding link.",
    targetId: "dashboard-overview",
  },
  {
    title: "Wedding Events",
    description:
      "Add your ceremony, reception, dinner, and other important events here so guests know the schedule.",
    targetId: "dashboard-overview",
  },
  {
    title: "Guests & RSVPs",
    description:
      "Here you can see which guests confirmed attendance and who has not responded yet.",
    targetId: "dashboard-overview",
  },
  {
    title: "Gallery & Photos",
    description:
      "Guests can upload photos during the celebration. You can review and manage them here.",
    targetId: "dashboard-photos",
  },
  {
    title: "Wedding Theme",
    description: "Choose the design style for your wedding website.",
    targetId: "dashboard-overview",
  },
  {
    title: "You're All Set!",
    description:
      "Your wedding page is now ready to share. Send your wedding link to guests so they can view your invitation and RSVP.",
  },
];

interface DashboardWalkthroughProps {
  weddingId: string;
  show: boolean;
  onComplete: () => void;
}

const DashboardWalkthrough = ({ weddingId, show, onComplete }: DashboardWalkthroughProps) => {
  const [step, setStep] = useState(-1); // -1 = welcome modal, 0+ = steps
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) setStep(-1);
  }, [show]);

  const complete = useCallback(async () => {
    setVisible(false);
    await supabase
      .from("weddings")
      .update({ dashboard_tour_completed: true } as any)
      .eq("id", weddingId);
    onComplete();
  }, [weddingId, onComplete]);

  const scrollToTarget = (targetId?: string) => {
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      complete();
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    scrollToTarget(STEPS[nextStep].targetId);
  };

  const prev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      scrollToTarget(STEPS[prevStep].targetId);
    }
  };

  if (!visible) return null;

  // Welcome modal (step === -1)
  if (step === -1) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-background border border-border max-w-md w-full mx-4 p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-light mb-2">
              Welcome to ForeverVow
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Here you can manage your wedding website, add details for your guests, and track RSVPs.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={complete}
              className="px-5 py-2.5 border border-border font-body text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors min-h-[44px]"
            >
              Skip
            </button>
            <button
              onClick={() => {
                setStep(0);
                scrollToTarget(STEPS[0].targetId);
              }}
              className="px-5 py-2.5 bg-foreground text-background font-body text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors min-h-[44px]"
            >
              Start Tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={complete} />

      {/* Tooltip card */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[101] pointer-events-auto w-full max-w-lg mx-4">
        <div className="bg-background border border-border p-6 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={complete}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress */}
          <div className="flex gap-1 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <h3 className="font-display text-lg font-light mb-1">{current.title}</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
            {current.description}
          </p>

          <div className="flex items-center justify-between">
            <p className="font-body text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
              {step + 1} / {STEPS.length}
            </p>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="p-2 border border-border hover:bg-muted transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-body text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors min-h-[40px]"
              >
                {isLast ? "Finish" : "Next"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWalkthrough;
