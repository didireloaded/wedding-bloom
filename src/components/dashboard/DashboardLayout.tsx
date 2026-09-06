import { ReactNode, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import './couple-theme.css';
import { Bell, CalendarDays, Camera, Home, User, Users, X } from "lucide-react";

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
  const firstName = coupleName || "Your wedding";
  const location = useLocation();
  const scrollRef = useRef<HTMLElement>(null);
  useEffect(() => {
    document.body.classList.add('fv-couple-theme');
    return () => document.body.classList.remove('fv-couple-theme');
  }, []);
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, [location.search]);
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "guests", label: "Guests", icon: Users },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "moments", label: "Memories", icon: Camera },
    { id: "updates", label: "Updates", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="couple-app h-screen h-[100dvh] overflow-hidden bg-[#080808] md:p-6">
      <div className="mobile-pwa-frame relative mx-auto w-full max-w-[430px] overflow-hidden bg-[#111111] text-[#f7f7f2] shadow-2xl md:rounded-[34px] md:border md:border-white/10">
        <header className="relative z-30 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] sm:px-5 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={heroImage || "/apple-touch-icon.png"}
                alt=""
                className="w-11 h-11 rounded-full object-cover border border-white shadow-sm"
              />
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold leading-none">{getGreetingLabel()}</p>
                <p className="font-body text-xs text-white/55 mt-1 truncate">{firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <>
                  <button
                    onClick={() => setShowNotifications((visible) => !visible)}
                    className="relative w-12 h-12 rounded-full border border-white/10 bg-[#242424] text-white flex items-center justify-center"
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
                    <div className="absolute right-5 top-[calc(env(safe-area-inset-top)+76px)] z-50 w-[calc(100vw-40px)] max-w-[390px] rounded-[24px] border border-white/10 bg-[#181818]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-between"><h3 className="font-body text-base font-semibold">Notifications</h3><button onClick={() => setShowNotifications(false)} aria-label="Close notifications"><X className="h-4 w-4" /></button></div>
                      <div className="mt-3 space-y-2">{notifications.length ? notifications.slice(0, 6).map((notification) => <button key={notification.id} onClick={() => { setShowNotifications(false); if (notification.targetTab) onTabChange?.(notification.targetTab); }} className="w-full rounded-2xl border border-white/10 bg-[#232323] p-3 text-left"><p className="font-body text-sm font-medium">{notification.title}</p><p className="mt-1 font-body text-xs text-white/55">{notification.body}</p></button>) : <p className="py-4 text-center font-body text-sm text-white/55">You’re all caught up.</p>}</div>
                    </div>
                  )}
              </>
            </div>
          </div>
        </header>

        <main ref={scrollRef} className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4 pt-1 sm:px-5">
          {children}
        </main>

        <div className="relative z-40 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 sm:px-5 sm:pb-[max(env(safe-area-inset-bottom),14px)]">
          <nav className="flex h-[68px] items-center justify-between rounded-[24px] border border-white/10 bg-[#252525]/95 px-1 shadow-[0_16px_40px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:h-[72px] sm:rounded-[28px] sm:px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`flex h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 transition-all sm:h-14 ${
                    selected ? "bg-[#ff6245] text-white shadow-lg" : "text-white/60 hover:text-white"
                  }`}
                  aria-label={tab.label}
                  aria-current={selected ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-body text-[9px] leading-none min-[360px]:text-[10px]">{tab.label}</span>
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
