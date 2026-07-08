import React from "react";
import { differenceInDays } from "date-fns";
import {
  Sparkles, CheckCircle2, Circle, Clock, ArrowRight,
  DollarSign, Users, Calendar, Award, Heart, Briefcase,
  AlertCircle, ChevronRight, Check
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, TaskItem, VendorItem, BudgetItem, RSVP } from "@/types/wedding";
import type { TabId } from "@/components/nav/CoupleWorkspaceShell";

interface PlanningDashboardViewProps {
  wedding: Wedding;
  tasks: TaskItem[];
  vendors: VendorItem[];
  budgets: BudgetItem[];
  rsvps: RSVP[];
  onNavigate: (tab: TabId) => void;
}

export function PlanningDashboardView({
  wedding,
  tasks,
  vendors,
  budgets,
  rsvps,
  onNavigate
}: PlanningDashboardViewProps) {
  const daysToGo = wedding.wedding_date
    ? differenceInDays(new Date(wedding.wedding_date), new Date())
    : 0;

  // Task progress calculation
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  // Budget calculations
  const totalBudget = budgets.reduce((sum, b) => sum + (b.estimated_cost || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.actual_cost || 0), 0);

  // Vendor status breakdown
  const bookedVendors = vendors.filter(v => !v.pending_decision).length;
  const totalVendors = vendors.length || 1;

  // Curated AI next steps based on current status
  const nextSteps = [];
  if (completedTasks < 3) {
    nextSteps.push({
      title: "Establish your core budget breakdown",
      subtitle: "Allocate funds across major categories",
      action: "Open Budgeter →",
      tab: "budget" as TabId
    });
  }
  if (bookedVendors === 0) {
    nextSteps.push({
      title: "Lock in your primary reception venue",
      subtitle: "Secure date before booking other vendors",
      action: "Explore Vendors →",
      tab: "budget" as TabId
    });
  }
  if (rsvps.length === 0) {
    nextSteps.push({
      title: "Import your preliminary guest list",
      subtitle: "Start collecting addresses and dietary needs",
      action: "Manage Guests →",
      tab: "rsvp" as TabId
    });
  }
  if (nextSteps.length === 0) {
    nextSteps.push({
      title: "Review your day-of timeline schedule",
      subtitle: "Ensure smooth transitions between ceremony & dinner",
      action: "View Run Sheet →",
      tab: "run_sheet" as TabId
    });
    nextSteps.push({
      title: "Finalize table seating arrangements",
      subtitle: "Assign confirmed RSVPs to dinner tables",
      action: "Open Seating Chart →",
      tab: "tables" as TabId
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1">
            Planning Journey
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            The Prologue & Execution
          </h1>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.1] px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm">
          <Heart size={16} className="text-primary-container fill-primary-container/20 animate-pulse" />
          <span className="font-headline-sm text-sm text-ivory font-bold">
            {daysToGo > 0 ? `${daysToGo} Days to Go` : "Celebration Week"}
          </span>
        </div>
      </div>

      {/* Bento Grid Layout (Stitch Design Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hero Progress Card (Spans 8 cols on desktop) */}
        <GlassCard variant="obsidian" padding="lg" className="md:col-span-8 border border-white/[0.12] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Circular Progress Gauge */}
          <div className="relative w-36 h-36 rounded-full flex items-center justify-center shrink-0 border-4 border-white/[0.06] bg-obsidian shadow-inner">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#d4af37"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-headline-md text-2xl text-primary-container font-bold">{progressPercent}%</span>
              <span className="text-[10px] uppercase tracking-wider text-muted font-medium">Complete</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left z-10 space-y-4">
            <div>
              <h3 className="font-headline-sm text-xl text-ivory font-bold mb-1">Vision & Milestone Progress</h3>
              <p className="text-sm text-muted">
                You are laying a beautiful foundation. The major anchors of your day are falling into place cleanly.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
              <button
                onClick={() => onNavigate("budget")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  bookedVendors > 0
                    ? "bg-sage/20 text-sage border border-sage/30"
                    : "bg-white/[0.06] text-muted hover:bg-white/[0.1]"
                }`}
              >
                <Check size={13} className={bookedVendors > 0 ? "text-sage" : "text-muted"} />
                <span>Vendors ({bookedVendors}/{totalVendors})</span>
              </button>

              <button
                onClick={() => onNavigate("tasks")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  completedTasks > 0
                    ? "bg-primary-container/20 text-primary-fixed border border-primary-container/30"
                    : "bg-white/[0.06] text-muted hover:bg-white/[0.1]"
                }`}
              >
                <Check size={13} className={completedTasks > 0 ? "text-primary-fixed" : "text-muted"} />
                <span>Tasks ({completedTasks}/{tasks.length})</span>
              </button>

              <button
                onClick={() => onNavigate("budget")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] text-ivory border border-white/[0.1] hover:bg-white/[0.1] transition cursor-pointer"
              >
                <DollarSign size={13} className="text-primary-container" />
                <span>Budget (${totalSpent.toLocaleString()} spent)</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* AI Recommendations Card (Spans 4 cols on desktop) */}
        <GlassCard variant="obsidian" padding="md" className="md:col-span-4 border border-white/[0.12] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.08]">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-label-md text-xs text-primary-container uppercase tracking-wider font-bold">
                Curated Next Steps
              </h3>
            </div>
            <div className="space-y-2.5">
              {nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate(step.tab)}
                  className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-primary-container/30 transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-ivory group-hover:text-primary-fixed transition-colors mb-0.5">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-muted mb-1.5">
                    {step.subtitle}
                  </p>
                  <div className="flex items-center justify-end text-[11px] font-semibold text-primary-container group-hover:translate-x-1 transition-transform">
                    <span>{step.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Focus Areas: Large Editorial Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-xl text-ivory font-bold">Core Focus Areas</h3>
          <button
            onClick={() => onNavigate("tasks")}
            className="text-xs font-semibold text-primary-container hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tasks</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Editorial Card 1: Vendor & Budget Hub */}
          <div
            onClick={() => onNavigate("budget")}
            className="group relative bg-obsidian rounded-2xl overflow-hidden border border-white/[0.12] shadow-xl aspect-[4/5] cursor-pointer hover-lift"
          >
            <img
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
              alt="Vendor Hub"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 text-ivory space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">
                <Briefcase size={12} className="text-primary-fixed" />
                <span>{vendors.length} Vendors Tracked</span>
              </span>
              <h4 className="font-headline-sm text-xl font-bold">Vendor & Contract Hub</h4>
              <p className="text-xs text-muted">
                Manage payments, due dates, and contracts in one vault.
              </p>
            </div>
          </div>

          {/* Editorial Card 2: Seating & Floor Plan */}
          <div
            onClick={() => onNavigate("tables")}
            className="group relative bg-obsidian rounded-2xl overflow-hidden border border-white/[0.12] shadow-xl aspect-[4/5] cursor-pointer hover-lift"
          >
            <img
              src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80"
              alt="Seating Floor Plan"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 text-ivory space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">
                <Users size={12} className="text-sage-light" />
                <span>Interactive Floor Plan</span>
              </span>
              <h4 className="font-headline-sm text-xl font-bold">Table Seating Studio</h4>
              <p className="text-xs text-muted">
                Assign confirmed guests to dinner tables and manage meal preferences.
              </p>
            </div>
          </div>

          {/* Editorial Card 3: Day-Of Run Sheet */}
          <div
            onClick={() => onNavigate("run_sheet")}
            className="group relative bg-obsidian rounded-2xl overflow-hidden border border-white/[0.12] shadow-xl aspect-[4/5] cursor-pointer hover-lift"
          >
            <img
              src="https://images.unsplash.com/photo-1519225336804-91fe1573f734?auto=format&fit=crop&w=800&q=80"
              alt="Run Sheet Timeline"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 text-ivory space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">
                <Clock size={12} className="text-rose-light" />
                <span>Minute-by-Minute</span>
              </span>
              <h4 className="font-headline-sm text-xl font-bold">Live Day-Of Run Sheet</h4>
              <p className="text-xs text-muted">
                Synchronize coordinators, photographers, and DJ timelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List (Stitch Design Specification) */}
      <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.12]">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
          <h3 className="font-label-md text-xs text-primary-container uppercase tracking-wider font-bold">
            Recent Milestone Activity
          </h3>
          <span className="text-xs text-muted font-mono">{tasks.length + vendors.length} items logged</span>
        </div>

        <div className="space-y-3 relative">
          {/* Vertical line for timeline */}
          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-white/[0.1]" />

          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              onClick={() => onNavigate("tasks")}
              className="flex items-start gap-4 p-3.5 hover:bg-white/[0.04] transition-colors rounded-xl group relative z-10 cursor-pointer border border-transparent hover:border-white/[0.08]"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-obsidian ${
                task.status === "done"
                  ? "bg-sage/20 text-sage"
                  : "bg-primary-container/20 text-primary-container"
              }`}>
                {task.status === "done" ? <Check size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ivory group-hover:text-primary-fixed transition-colors">
                  {task.title}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {task.category || "General Task"} • {task.status === "done" ? "Completed" : "In Progress"}
                </p>
              </div>
              {task.due_date && (
                <span className="text-[11px] font-mono text-muted/80 bg-white/[0.04] px-2 py-1 rounded-md">
                  Due {task.due_date}
                </span>
              )}
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted text-sm">
              No tasks logged yet. Click "Delegation Board" to add your first checklist items!
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
