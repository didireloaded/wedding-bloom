import { ReactNode, useState } from "react";
import { Bell, CalendarDays, Camera, Globe2, Home, User, Users, X } from "lucide-react";

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
  notifications?: { id: string; title: string; body: string; targetTab?: string }[];
}

const getCountdown = (dateStr?: string) => {
  if (!dateStr) return null;
  const weddingDay = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDay.setHours(0, 0, 0, 0);
  const diff = Math.round((weddingDay.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Your wedding is today!";
  if (diff > 0) return `${diff} day${diff === 1 ? "" : "s"} to go`;
  return `Married ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} ago`;
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
  notifications = [],
}: DashboardLayoutProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const firstName = coupleName.split("&")[0]?.trim() || "there";
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "guests", label: "Guests", icon: Users },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "moments", label: "Memories", icon: Camera },
    { id: "updates", label: "Updates", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="couple-app min-h-screen bg-[#dedede] md:py-6">
      <div className="mobile-pwa-frame relative mx-auto min-h-screen w-full max-w-[430px] md:min-h-[880px] md:max-h-[920px] overflow-hidden bg-[linear-gradient(145deg,#ffd9c9_0%,#f8f4ef_48%,#d9b5f1_100%)] shadow-2xl md:rounded-[34px] md:border-[10px] md:border-[#f1f1f1]">
        <header className="sticky top-0 z-30 px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={heroImage || "/apple-touch-icon.png"}
                alt=""
                className="w-11 h-11 rounded-full object-cover border border-white shadow-sm"
              />
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold leading-none">{getGreetingLabel()}</p>
                <p className="font-body text-xs text-muted-foreground mt-1 truncate">{firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <>
                  <button
                    onClick={() => setShowNotifications((visible) => !visible)}
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
                  {showNotifications && (
                    <div className="absolute right-5 top-[calc(env(safe-area-inset-top)+76px)] z-50 w-[calc(100vw-40px)] max-w-[390px] rounded-[24px] border border-white/80 bg-[#fbf8f4]/95 p-4 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-between"><h3 className="font-body text-base font-semibold">Notifications</h3><button onClick={() => setShowNotifications(false)} aria-label="Close notifications"><X className="h-4 w-4" /></button></div>
                      <div className="mt-3 space-y-2">{notifications.length ? notifications.slice(0, 6).map((notification) => <button key={notification.id} onClick={() => { setShowNotifications(false); if (notification.targetTab) onTabChange?.(notification.targetTab); }} className="w-full rounded-2xl bg-white p-3 text-left"><p className="font-body text-sm font-medium">{notification.title}</p><p className="mt-1 font-body text-xs text-muted-foreground">{notification.body}</p></button>) : <p className="py-4 text-center font-body text-sm text-muted-foreground">You’re all caught up.</p>}</div>
                    </div>
                  )}
              </>
            </div>
          </div>
        </header>

        <main className="h-[calc(100dvh-82px)] md:h-[calc(880px-82px)] overflow-y-auto px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+104px)]">
          {children}
        </main>

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
