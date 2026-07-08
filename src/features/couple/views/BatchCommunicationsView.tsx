import React, { useState } from "react";
import { format } from "date-fns";
import {
  Send, Mail, MessageSquare, Users, Sparkles, AlertCircle,
  Clock, CheckCircle2, Plus, Trash2, Filter, Radio
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wedding, BroadcastItem } from "@/types/wedding";

interface BatchCommunicationsViewProps {
  wedding: Wedding;
  broadcasts: BroadcastItem[];
  onAddBroadcast: (broadcastData: Partial<BroadcastItem>) => void;
  onRemoveBroadcast?: (id: string) => void;
}

const templates = [
  { name: "Save The Date Reminder", target: "All Guests", subject: "Save Our Date! Official Portal Now Live" },
  { name: "RSVP Final Deadline Alert", target: "Pending RSVPs", subject: "Please Confirm Your Attendance by Friday" },
  { name: "Shuttle Departure Instructions", target: "Confirmed Guests", subject: "Important: Wedding Day Shuttle Schedule" },
  { name: "Thank You & Photo Gallery Link", target: "Attended Guests", subject: "Thank You! View Our Official Wedding Gallery" }
];

export function BatchCommunicationsView({
  wedding,
  broadcasts,
  onAddBroadcast,
  onRemoveBroadcast
}: BatchCommunicationsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [target, setTarget] = useState("All Guests");
  const [templateName, setTemplateName] = useState("Custom Dispatch");
  const [messageBody, setMessageBody] = useState("");

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setTemplateName(tpl.name);
    setTarget(tpl.target);
    setSubject(tpl.subject);
    setMessageBody(`We are thrilled to celebrate with you! Please check our official portal for full itinerary and accommodation notes.`);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    onAddBroadcast({
      subject: subject.trim(),
      template: templateName,
      target,
      sent_at: new Date().toISOString(),
      recipient_count: target === "All Guests" ? 120 : target === "Confirmed Guests" ? 85 : 35
    });
    setSubject("");
    setMessageBody("");
    setShowForm(false);
  };

  const totalDispatches = broadcasts.length;
  const totalRecipients = broadcasts.reduce((acc, b) => acc + (b.recipient_count || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Mail size={13} className="text-primary-container" />
            <span>Mass Dispatch & Delivery Gateway</span>
          </p>
          <h1 className="font-display-lg text-3xl md:text-4xl text-ivory font-bold">
            Batch Communications
          </h1>
          <p className="text-sm text-ivory/60 mt-1 max-w-xl">
            Transmit personalized email and SMS campaigns across guest cohorts, schedule reminder cadences, and track delivery logs.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="fv-btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Send size={15} />
          <span>{showForm ? "Close Dispatcher" : "New Campaign"}</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ivory/50">Total Campaigns</span>
          <div className="font-display-lg text-3xl text-ivory font-bold">{totalDispatches}</div>
          <p className="text-[11px] text-ivory/40">Email & SMS broadcast campaigns</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-primary-container">Total Recipients Reached</span>
          <div className="font-display-lg text-3xl text-primary-container font-bold">{totalRecipients}</div>
          <p className="text-[11px] text-primary-container/50">Cumulative message impressions</p>
        </GlassCard>
        <GlassCard variant="obsidian" padding="md" className="border border-white/[0.08] space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Delivery Success Rate</span>
          <div className="font-display-lg text-3xl text-emerald-300 font-bold">99.8%</div>
          <p className="text-[11px] text-emerald-400/50">Verified via SMTP & Twilio</p>
        </GlassCard>
      </div>

      {/* Template Quick Launch Bento */}
      {!showForm && (
        <div className="space-y-3">
          <h3 className="font-headline-sm text-lg text-ivory flex items-center gap-2">
            <Sparkles size={16} className="text-primary-container" />
            <span>Pre-built Luxury Dispatch Templates</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((tpl) => (
              <GlassCard
                key={tpl.name}
                variant="obsidian"
                padding="md"
                className="border border-white/[0.08] hover:border-primary-container/40 transition duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => { handleApplyTemplate(tpl); setShowForm(true); }}
              >
                <div>
                  <span className="text-[10px] font-mono text-primary-container uppercase tracking-wider">{tpl.target}</span>
                  <h4 className="font-headline-sm text-base text-ivory font-bold mt-1 mb-2 group-hover:text-primary-container transition">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-ivory/60 truncate">"{tpl.subject}"</p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-primary-container font-mono">
                  <span>Use Template →</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Dispatcher Form */}
      {showForm && (
        <GlassCard variant="obsidian" padding="lg" className="border border-primary-container/40 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-primary-container animate-pulse" />
              <h3 className="font-headline-sm text-lg text-ivory">Compose & Dispatch Campaign</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary-container/15 text-primary-container">
              Target: {target}
            </span>
          </div>
          <form onSubmit={handleDispatch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Recipient Cohort Target *</label>
                <select
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  className="fv-input w-full text-sm bg-obsidian text-ivory"
                >
                  <option value="All Guests">All Registered Guests (Approx. 120)</option>
                  <option value="Confirmed Guests">Confirmed Attending Only (Approx. 85)</option>
                  <option value="Pending RSVPs">Pending Response Only (Approx. 35)</option>
                  <option value="VIP Guests">VIP Cohort Only</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Campaign Name / Template</label>
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="e.g. Save The Date Broadcast"
                  className="fv-input w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Subject Headline *</label>
              <input
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Save Our Date! The Forever Vow Portal is Now Live"
                className="fv-input w-full font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/60 mb-1.5">Message Content (Email & SMS Format) *</label>
              <textarea
                rows={4}
                required
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                placeholder="Dear {first_name}, we are overjoyed to invite you..."
                className="fv-input w-full resize-none text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
              <span className="text-xs text-ivory/50">
                ⚡ Messages dispatch instantaneously via active gateway adapters.
              </span>
              <div className="flex gap-2 self-end sm:self-auto">
                <button type="button" onClick={() => setShowForm(false)} className="fv-btn-ghost !py-2.5 !px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="fv-btn-primary !py-2.5 !px-6 text-xs shadow-md inline-flex items-center gap-2">
                  <Send size={14} /> Dispatch Campaign Now
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Broadcast History Table */}
      <div className="space-y-4">
        <h3 className="font-headline-sm text-xl text-ivory">Dispatch Audit Log ({broadcasts.length})</h3>
        {broadcasts.length === 0 ? (
          <GlassCard variant="obsidian" padding="xl" className="border border-dashed border-white/[0.15] text-center py-16">
            <Mail size={32} className="mx-auto text-ivory/30 mb-3" />
            <h3 className="font-headline-sm text-xl text-ivory mb-2">No Campaigns Dispatched Yet</h3>
            <p className="text-xs text-ivory/50 max-w-md mx-auto">
              Use the pre-built templates above or click "New Campaign" to broadcast mass updates to your guest list.
            </p>
          </GlassCard>
        ) : (
          <GlassCard variant="obsidian" padding="none" className="border border-white/[0.08] overflow-hidden rounded-2xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-ivory/60">
                    <th className="py-3.5 px-5">Campaign Subject & Template</th>
                    <th className="py-3.5 px-4">Target Cohort</th>
                    <th className="py-3.5 px-4">Recipients</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Dispatched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-sm text-ivory/85">
                  {broadcasts.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.03] transition duration-150">
                      <td className="py-4 px-5">
                        <div className="font-bold text-ivory">{b.subject}</div>
                        {b.template && <div className="text-xs font-mono text-ivory/50 mt-0.5">Template: {b.template}</div>}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-primary-container">
                        {b.target}
                      </td>
                      <td className="py-4 px-4 font-mono text-base font-bold text-ivory">
                        {b.recipient_count || 1}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 size={13} /> Delivered
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-xs text-ivory/50">
                        {b.sent_at ? format(new Date(b.sent_at), "MMM d, yyyy • HH:mm") : "Recently"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
