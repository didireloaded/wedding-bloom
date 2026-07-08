import React, { useState } from "react";
import { format } from "date-fns";
import {
  CheckSquare, Plus, Trash2, Calendar, User, Clock,
  AlertCircle, Sparkles, Filter, CheckCircle2, Circle, ArrowRight
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, TaskItem } from "@/types/wedding";

interface DelegationBoardViewProps {
  wedding: Wedding;
  tasks: TaskItem[];
  onAddTask: (taskData: Partial<TaskItem>) => void;
  onUpdateTaskStatus: (id: string, status: TaskItem["status"]) => void;
  onRemoveTask: (id: string) => void;
}

export function DelegationBoardView({
  wedding,
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onRemoveTask
}: DelegationBoardViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Logistics");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskItem["priority"]>("normal");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      category: category.trim() || "Logistics",
      assignee: assignee.trim() || null,
      due_date: dueDate || null,
      priority,
      status: "todo"
    });
    setTitle("");
    setAssignee("");
    setDueDate("");
    setPriority("normal");
    setShowForm(false);
  };

  const categories = ["all", ...Array.from(new Set(tasks.map(t => t.category || "Logistics")))];
  const filteredTasks = tasks.filter(t => filterCategory === "all" || t.category === filterCategory);

  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress");
  const doneTasks = filteredTasks.filter(t => t.status === "done");

  const totalCount = tasks.length || 1;
  const completedCount = tasks.filter(t => t.status === "done").length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <CheckSquare size={13} className="text-primary-container" />
            <span>Kanban Execution & Accountability Board</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Task Delegation Board
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Distribute milestones across your planning team, assign exact due dates, and track completion progress from backlog to execution.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Plus size={15} />
          <span>{showForm ? "Close Form" : "Create Task"}</span>
        </button>
      </div>

      {/* Progress Bar Widget */}
      <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-mono text-ivory/50 uppercase tracking-wider">Overall Planning Velocity</span>
            <div className="font-display-lg text-2xl text-ivory font-bold">{completedCount} of {tasks.length} Milestones Achieved</div>
          </div>
        </div>
        <div className="w-full md:max-w-md space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-ivory/60">
            <span>Progress Index</span>
            <span className="text-primary-container font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(212,175,55,0.4)]" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </GlassCard>

      {/* Create Task Form */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-container" />
              <h3 className="font-headline-sm text-lg text-ivory">Create Actionable Task</h3>
            </div>
          </div>
          <form onSubmit={handleCreateTask} className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Task Description / Milestone *</label>
              <input
                required
                placeholder="e.g. Schedule final tasting menu review with executive chef"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Category *</label>
              <input
                required
                placeholder="e.g. Catering / Floral / Attire"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Assignee</label>
              <input
                placeholder="e.g. Partner A / Wedding Planner / Maid of Honor"
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                className="fv-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="fv-input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="fv-input w-full text-sm bg-obsidian text-ivory"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">🔥 High Urgent Priority</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                Insert Task to Backlog
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-mono text-ivory/50 uppercase mr-1">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition capitalize shrink-0 ${
                filterCategory === cat ? "bg-primary-container text-obsidian font-bold shadow-sm" : "bg-white/[0.03] text-ivory/60 hover:text-ivory border border-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Kanban 3-Column Grid */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Backlog / To Do Column */}
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Circle size={15} className="text-ivory/50" />
              <h3 className="font-headline-sm text-base text-ivory font-bold">To Do / Backlog</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-ivory/70">{todoTasks.length}</span>
          </div>

          <div className="space-y-3">
            {todoTasks.map((t) => (
              <GlassCard key={t.id} variant="obsidian" padding="md" className="border border-white/[0.08] hover:border-white/[0.2] transition space-y-2 group">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.05] text-[#E8C97A] border border-white/10">
                    {t.category}
                  </span>
                  {t.priority === "high" && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      High Priority
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm text-ivory leading-snug">{t.title}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono text-ivory/50">
                  <span className="truncate">{t.assignee ? `👤 ${t.assignee}` : "Unassigned"}</span>
                  {t.due_date && <span>📅 {format(new Date(t.due_date), "MMM d")}</span>}
                </div>
                <div className="flex justify-end gap-1 pt-1 opacity-90 group-hover:opacity-100 transition">
                  <button onClick={() => onUpdateTaskStatus(t.id, "in_progress")} className="px-2.5 py-1 rounded-lg bg-primary-container/15 hover:bg-primary-container/30 text-primary-container text-xs font-medium transition">
                    Start →
                  </button>
                  <button onClick={() => onRemoveTask(t.id)} className="p-1 rounded text-ivory/30 hover:text-rose-400 transition" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </GlassCard>
            ))}
            {todoTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-ivory/40 font-mono italic border border-dashed border-white/[0.08] rounded-2xl">
                No backlog tasks
              </div>
            )}
          </div>
        </GlassCard>

        {/* In Progress Column */}
        <GlassCard variant="obsidian" padding="md" className="border border-primary-container/30 bg-primary-container/[0.02] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-primary-container animate-pulse" />
              <h3 className="font-headline-sm text-base text-ivory font-bold">In Progress</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-xs font-mono text-primary-container">{inProgressTasks.length}</span>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map((t) => (
              <GlassCard key={t.id} variant="obsidian" padding="md" className="border border-primary-container/40 hover:border-primary-container transition space-y-2 group shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary-container/15 text-primary-container border border-primary-container/30">
                    {t.category}
                  </span>
                  {t.priority === "high" && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      High Priority
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm text-ivory leading-snug">{t.title}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono text-ivory/50">
                  <span className="truncate">{t.assignee ? `👤 ${t.assignee}` : "Unassigned"}</span>
                  {t.due_date && <span>📅 {format(new Date(t.due_date), "MMM d")}</span>}
                </div>
                <div className="flex justify-between gap-1 pt-1">
                  <button onClick={() => onUpdateTaskStatus(t.id, "todo")} className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-ivory/70 text-xs font-medium transition">
                    ← Back
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => onUpdateTaskStatus(t.id, "done")} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition">
                      Complete ✓
                    </button>
                    <button onClick={() => onRemoveTask(t.id)} className="p-1 rounded text-ivory/30 hover:text-rose-400 transition" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-ivory/40 font-mono italic border border-dashed border-white/[0.08] rounded-2xl">
                No active tasks in progress
              </div>
            )}
          </div>
        </GlassCard>

        {/* Done / Completed Column */}
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-4 opacity-90">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <h3 className="font-headline-sm text-base text-ivory font-bold">Completed</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-xs font-mono text-emerald-300">{doneTasks.length}</span>
          </div>

          <div className="space-y-3">
            {doneTasks.map((t) => (
              <GlassCard key={t.id} variant="obsidian" padding="md" className="border border-white/[0.06] bg-white/[0.01] space-y-2 group">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.05] text-ivory/40">
                    {t.category}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-300 bg-emerald-500/10">
                    Done ✓
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-ivory/60 line-through leading-snug">{t.title}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs font-mono text-ivory/40">
                  <span className="truncate">{t.assignee ? `👤 ${t.assignee}` : "Unassigned"}</span>
                  <button onClick={() => onRemoveTask(t.id)} className="p-1 rounded text-ivory/30 hover:text-rose-400 transition" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </GlassCard>
            ))}
            {doneTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-ivory/40 font-mono italic border border-dashed border-white/[0.08] rounded-2xl">
                No completed tasks yet
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
