import React, { useState } from "react";
import {
  Flower2, Heart, Users, Camera, LogOut, ExternalLink,
  Calendar, MapPin, Settings, Sparkles, Radio, Menu, X, DollarSign,
  Award, Mail, Navigation, Clock, CheckCircle2, UserCheck, Gift,
  Bell, Home, Image as ImageIcon, MessageCircle, Share2, Layers,
  Compass, Briefcase, ShieldCheck, ChevronRight, ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding } from "@/types/wedding";

export type SuiteId = "studio" | "treasury" | "logistics" | "guests" | "media";
export type TabId =
  | "workspace" | "overview" | "budget" | "mood_board" | "gifts"
  | "rsvp" | "crm" | "run_sheet" | "tables" | "tasks" | "broadcasts"
  | "events" | "map" | "accommodations" | "gallery" | "guest_photos"
  | "moments" | "updates" | "share" | "checkins" | "arrivals";

interface SuiteConfig {
  id: SuiteId;
  label: string;
  description: string;
  icon: React.ReactNode;
  items: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[];
}

interface CoupleWorkspaceShellProps {
  wedding: Wedding;
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenSettings: () => void;
  onOpenCockpit: () => void;
  onOpenWalkthrough: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
  unreadCount: number;
  counts: {
    vendors?: number;
    moodItems?: number;
    gifts?: number;
    runSheet?: number;
    tables?: number;
    tasks?: number;
    markers?: number;
    accommodations?: number;
    crm?: number;
    broadcasts?: number;
    rsvps?: number;
    checkins?: number;
    moments?: number;
    events?: number;
    updates?: number;
    gallery?: number;
    guestPhotos?: number;
  };
  searchComponent?: React.ReactNode;
  children: React.ReactNode;
}

export function CoupleWorkspaceShell({
  wedding,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenCockpit,
  onOpenWalkthrough,
  onOpenNotifications,
  onLogout,
  unreadCount,
  counts,
  searchComponent,
  children
}: CoupleWorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define the 5 high-level suites to simplify the 21 tabs
  const suites: SuiteConfig[] = [
    {
      id: "studio",
      label: "Studio Cockpit",
      description: "Overview, Story & Timeline",
      icon: <Home size={18} />,
      items: [
        { id: "workspace", label: "Studio Cockpit", icon: <Home size={15} /> },
        { id: "overview", label: "Overview & Story", icon: <Heart size={15} /> },
        { id: "events", label: "Timeline Events", icon: <Calendar size={15} />, count: counts.events },
        { id: "updates", label: "Announcements", icon: <Radio size={15} />, count: counts.updates },
        { id: "share", label: "QR & Share Links", icon: <Share2 size={15} /> },
      ]
    },
    {
      id: "treasury",
      label: "Treasury & Vision",
      description: "Budgets, Vendors & Moods",
      icon: <DollarSign size={18} />,
      items: [
        { id: "budget", label: "Budget & Vendor Hub", icon: <Briefcase size={15} />, count: counts.vendors },
        { id: "mood_board", label: "Vision & Mood Board", icon: <Sparkles size={15} />, count: counts.moodItems },
        { id: "gifts", label: "Thank-You Tracker", icon: <Gift size={15} />, count: counts.gifts },
      ]
    },
    {
      id: "logistics",
      label: "Execution Logistics",
      description: "Run Sheet, Seating & Maps",
      icon: <Clock size={18} />,
      items: [
        { id: "run_sheet", label: "Day-of Run Sheet", icon: <Clock size={15} />, count: counts.runSheet },
        { id: "tables", label: "Seating Floor Plan", icon: <Users size={15} />, count: counts.tables },
        { id: "tasks", label: "Delegation Board", icon: <CheckCircle2 size={15} />, count: counts.tasks },
        { id: "arrivals", label: "Live Guest Arrivals", icon: <Navigation size={15} /> },
        { id: "map", label: "Interactive Map", icon: <MapPin size={15} />, count: counts.markers },
        { id: "accommodations", label: "Hotels & Stay", icon: <Compass size={15} />, count: counts.accommodations },
      ]
    },
    {
      id: "guests",
      label: "Guest Intelligence",
      description: "RSVPs, CRM & Broadcasts",
      icon: <UserCheck size={18} />,
      items: [
        { id: "rsvp", label: "RSVP Manager", icon: <UserCheck size={15} />, count: counts.rsvps },
        { id: "crm", label: "Guest CRM Database", icon: <Award size={15} />, count: counts.crm },
        { id: "broadcasts", label: "Batch Communications", icon: <Mail size={15} />, count: counts.broadcasts },
        { id: "checkins", label: "Day-of Check-ins", icon: <CheckCircle2 size={15} />, count: counts.checkins },
      ]
    },
    {
      id: "media",
      label: "Media Vault",
      description: "Gallery, Vault & Memories",
      icon: <ImageIcon size={18} />,
      items: [
        { id: "gallery", label: "Curated Portfolio", icon: <ImageIcon size={15} />, count: counts.gallery },
        { id: "guest_photos", label: "Guest Photo Vault", icon: <Camera size={15} />, count: counts.guestPhotos },
        { id: "moments", label: "Memory Wall", icon: <MessageCircle size={15} />, count: counts.moments },
      ]
    }
  ];

  // Determine which suite is currently active based on activeTab
  const activeSuite = suites.find(s => s.items.some(i => i.id === activeTab)) || suites[0];

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-28 md:pb-24 font-body-md">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 glass-obsidian border-b border-white/[0.1] shadow-2xl">
        <div className="mx-auto max-w-[1520px] px-4 md:px-8 h-[74px] flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-ivory"
            aria-label="Toggle Navigation Sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container shrink-0">
              <Flower2 size={18} />
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary-container font-semibold">Couple OS</div>
              <div className="font-headline-sm text-[18px] text-ivory -mt-0.5 truncate">{wedding.couple_names}</div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden md:block">
            {searchComponent}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={onOpenCockpit}
              className="inline-flex items-center gap-1.5 !py-2 !px-3.5 text-[12px] rounded-xl bg-sage/20 hover:bg-sage text-sage hover:text-obsidian border border-sage/30 transition shadow-sm font-semibold cursor-pointer"
              title="Enter Day-Of Coordinator Cockpit Mode"
            >
              <Radio size={14} className="animate-pulse" />
              <span className="hidden sm:inline">Live Cockpit</span>
            </button>

            <button
              onClick={onOpenWalkthrough}
              className="inline-flex items-center gap-1.5 fv-btn-ghost !py-2 !px-3 text-[12px] text-primary-fixed border-primary-container/30 hover:bg-primary-container/10 transition cursor-pointer"
              title="Concierge Walkthrough Tour"
            >
              <Sparkles size={14} className="text-primary-container animate-pulse" />
              <span className="hidden sm:inline">Walkthrough</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center text-ivory transition cursor-pointer"
              title="Live Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary-container text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <Link
              to={`/wedding/${wedding.slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 fv-btn-ghost !py-2 !px-4 text-[12px]"
            >
              <ExternalLink size={14} className="text-primary-container" /> Live Site
            </Link>

            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-rose/20 text-muted hover:text-rose-light flex items-center justify-center transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          {searchComponent}
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="mx-auto max-w-[1520px] px-4 md:px-8 pt-8 grid md:grid-cols-[280px_1fr] gap-8">
        {/* Desktop & Mobile Sidebar Navigation */}
        <aside className={`${sidebarOpen ? "block" : "hidden md:block"} md:sticky md:top-[96px] md:self-start z-20`}>
          <GlassCard variant="obsidian" padding="md" className="border border-white/[0.1] space-y-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-primary-container px-3 pb-1 font-bold">
              Workspace Suites
            </div>

            {/* 5 Suite Accordion / Selector */}
            <div className="space-y-2">
              {suites.map((suite) => {
                const isSuiteActive = activeSuite.id === suite.id;
                return (
                  <div key={suite.id} className="space-y-1">
                    <button
                      onClick={() => {
                        // When clicking a suite, default to its first item
                        onSelectTab(suite.items[0].id);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-semibold transition cursor-pointer ${
                        isSuiteActive
                          ? "bg-primary-container text-obsidian font-bold shadow-lg shadow-primary-container/20"
                          : "text-muted hover:bg-white/[0.06] hover:text-ivory"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={isSuiteActive ? "text-obsidian" : "text-primary-container"}>
                          {suite.icon}
                        </span>
                        <div className="text-left min-w-0">
                          <div className="truncate leading-tight">{suite.label}</div>
                          <div className={`text-[10px] truncate font-normal ${isSuiteActive ? "text-obsidian/80" : "text-muted/70"}`}>
                            {suite.description}
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={14} className={`transform transition-transform ${isSuiteActive ? "rotate-180 text-obsidian" : "-rotate-90 text-muted/50"}`} />
                    </button>

                    {/* Secondary items for active suite */}
                    {isSuiteActive && (
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-primary-container/30 ml-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        {suite.items.map((item) => {
                          const isItemActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                onSelectTab(item.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition cursor-pointer ${
                                isItemActive
                                  ? "bg-white/[0.12] text-ivory font-bold border border-white/[0.15]"
                                  : "text-muted hover:bg-white/[0.04] hover:text-ivory"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={isItemActive ? "text-primary-fixed" : "text-muted/70"}>
                                  {item.icon}
                                </span>
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.count !== undefined && item.count > 0 && (
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                  isItemActive ? "bg-primary-container text-obsidian font-bold" : "bg-white/[0.06] text-muted"
                                }`}>
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => { onOpenSettings(); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold text-muted hover:bg-white/[0.06] hover:text-ivory transition cursor-pointer"
              >
                <Settings size={16} className="text-primary-container" />
                <span>Wedding Settings</span>
              </button>
            </div>
          </GlassCard>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0">
          {/* Sub-navigation pill bar for mobile/quick switching within active suite */}
          <div className="mb-6 flex items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-2 rounded-2xl overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-primary-container px-2.5 py-1 bg-primary-container/10 rounded-lg flex items-center gap-1.5">
                {activeSuite.icon}
                {activeSuite.label}:
              </span>
              {activeSuite.items.map((item) => {
                const isItemActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      isItemActive
                        ? "bg-white/[0.12] text-ivory font-bold border border-white/[0.2] shadow-sm"
                        : "text-muted hover:bg-white/[0.05] hover:text-ivory"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] opacity-75">({item.count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
