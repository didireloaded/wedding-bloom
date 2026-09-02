import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, Camera, Check, Globe2, Home, Plus, User, Users, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  coupleName: string;
  weddingSlug: string;
  weddingDate?: string;
  heroImage?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  notificationCount?: number;
  onRestartTour?: () => void;
}

const getCountdown = (dateStr?: string) => {
  if (!dateStr) return null;
  const weddingDay = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDay.setHours(0, 0, 0, 0);
  const diff = Math.round((weddingDay.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Your wedding is today! 🎉";
  if (diff > 0) return `${diff} day${diff === 1 ? "" : "s"} to go`;
  return `Married ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} ago ✨`;
};

const DashboardLayout = ({
  children,
  coupleName,
  weddingSlug,
  weddingDate,
  heroImage,
  activeTab = "home",
  onTabChange,
  notificationCount = 0,
  onRestartTour,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const firstName = coupleName.split("&")[0]?.trim() || "there";
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "guests", label: "Guests", icon: Users },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "moments", label: "Moments", icon: Camera },
    { id: "website", label: "Website", icon: Globe2 },
    { id: "profile", label: "Profile", icon: User },
  ];

  const closePreview = () => {
    sessionStorage.removeItem("couple_wedding_id");
    sessionStorage.removeItem("couple_wedding_slug");
    sessionStorage.removeItem("couple_access_code");
    navigate("/couple-login");
  };

  return (
    <div className="min-h-screen bg-[#dedede] md:py-6">
      <div className="mobile-pwa-frame relative mx-auto min-h-screen md:min-h-[880px] md:max-h-[920px] md:w-[430px] overflow-hidden bg-[linear-gradient(145deg,#ffd9c9_0%,#f8f4ef_48%,#d9b5f1_100%)] shadow-2xl md:rounded-[34px] md:border-[10px] md:border-[#f1f1f1]">
        <div className="absolute top-[calc(env(safe-area-inset-top)+13px)] left-0 right-0 z-50 pointer-events-none">
          <div className="mx-auto h-8 w-[104px] rounded-full bg-black" />
          <div className="absolute left-8 top-1 font-body text-[12px] font-bold text-black">11:30</div>
          <div className="absolute right-8 top-1 flex items-center gap-1 text-black">
            <span className="h-3 w-4 rounded-[2px] border border-black block" />
            <span className="h-2 w-2 rounded-full bg-black block" />
          </div>
        </div>
        <header className="sticky top-0 z-30 px-5 pt-[calc(env(safe-area-inset-top)+56px)] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={heroImage || "/apple-touch-icon.png"}
                alt=""
                className="w-11 h-11 rounded-full object-cover border border-white shadow-sm"
              />
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold leading-none">{activeTab === "add-task" ? "Add New Task" : getGreetingLabel()}</p>
                <p className="font-body text-xs text-muted-foreground mt-1 truncate">{activeTab === "add-task" ? "" : firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "add-task" ? (
                <button
                  onClick={() => onTabChange?.("home")}
                  className="w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center shadow-sm"
                  aria-label="Save task"
                >
                  <Check className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onTabChange?.("add-task")}
                    className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm"
                    aria-label="Add task"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    className="relative w-12 h-12 rounded-full bg-white border border-white/70 flex items-center justify-center shadow-sm"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-body flex items-center justify-center border-2 border-background">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="h-[calc(100dvh-110px)] md:h-[calc(880px-110px)] overflow-y-auto px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+104px)]">
          {children}
        </main>

        {activeTab !== "add-task" && (
        <div className="absolute left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+18px)] z-40">
          <nav className="h-[76px] rounded-[28px] bg-white/78 backdrop-blur-2xl border border-white/75 shadow-[0_18px_45px_rgba(30,24,20,0.18)] px-2 flex items-center justify-between">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`h-14 min-w-0 flex-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    selected ? "bg-foreground text-background shadow-lg" : "text-black hover:text-foreground"
                  }`}
                  aria-label={tab.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-body text-[8px] leading-none">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        )}
        {activeTab === "add-task" && (
          <button
            onClick={closePreview}
            className="absolute left-5 top-[calc(env(safe-area-inset-top)+56px)] z-40 w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const getGreetingLabel = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default DashboardLayout;
