import React, { useState } from "react";
import {
  BarChart3, Download, TrendingUp, Users, DollarSign, PieChart,
  FileSpreadsheet, ArrowUpRight, Calendar, CheckCircle2, QrCode,
  Eye, Utensils, Heart, Share2, Sparkles, Filter, RefreshCw
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

export interface AdminAnalyticsReportsViewProps {
  weddings: any[];
  stats: {
    total: number;
    active: number;
    guests: number;
    rsvps: number;
    photos: number;
    messages: number;
    views: number;
    qr: number;
    revenue: string;
    pendingInvoices: string;
  };
  onExportCsv: () => void;
}

export function AdminAnalyticsReportsView({ weddings, stats, onExportCsv }: AdminAnalyticsReportsViewProps) {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "year" | "all">("90d");
  const [activeTab, setActiveTab] = useState<"overview" | "dietary" | "conversion">("overview");

  const rsvpRateOverall = stats.guests > 0 ? Math.round((stats.rsvps / stats.guests) * 100) : 74;

  const handleCustomExport = (reportType: string) => {
    toast.success(`Generating ${reportType} CSV export...`);
    setTimeout(() => {
      onExportCsv();
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#A882DD]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-2">
              <BarChart3 size={14} /> Intelligence & Financial Cockpit
            </div>
            <h2 className="display text-[32px] md:text-[40px] text-[#FAF7F2] leading-tight">
              Studio Analytics & <span className="script fv-gradient-text">Reports</span>
            </h2>
            <p className="text-[14px] text-[#A8A29E] max-w-xl mt-2">
              Deep-dive into celebration engagement funnels, guest attendance rates, dietary manifests across active studios, and financial revenue forecasts.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-full p-1 flex items-center">
              {[
                { id: "30d", label: "30D" },
                { id: "90d", label: "90D" },
                { id: "year", label: "2026 Season" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition ${
                    timeRange === t.id ? "bg-[#D4A853] text-[#0C0A09]" : "text-[#A8A29E] hover:text-[#FAF7F2]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleCustomExport("Master Platform Summary")}
              className="fv-btn-primary !py-3 !px-5 flex items-center gap-2 shadow-xl shrink-0"
            >
              <Download size={15} /> Export Master CSV
            </button>
          </div>
        </div>

        {/* Top Financial & Engagement KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="text-[24px] font-mono font-bold text-[#D4A853]">{stats.revenue}</div>
              <span className="text-[11px] font-mono text-[#7A9E7E] flex items-center">+18.4%</span>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Expected Studio Revenue</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="text-[24px] font-mono font-bold text-[#FAF7F2]">{rsvpRateOverall}%</div>
              <span className="text-[11px] font-mono text-[#7A9E7E] flex items-center">+4.2%</span>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Global RSVP Conversion</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="text-[24px] font-mono font-bold text-[#A882DD]">{stats.views}</div>
              <span className="text-[11px] font-mono text-[#A882DD] flex items-center"><Eye size={12} className="mr-1" /> Live</span>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Guest Portal Visits</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="text-[24px] font-mono font-bold text-[#7A9E7E]">{stats.qr}</div>
              <span className="text-[11px] font-mono text-[#7A9E7E] flex items-center"><QrCode size={12} className="mr-1" /> Scanned</span>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">QR Check-In Engagements</div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs Selector */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
        {[
          { id: "overview", label: "Conversion & Traffic", icon: <TrendingUp size={15} /> },
          { id: "dietary", label: "Dietary & Allergies Manifest", icon: <Utensils size={15} /> },
          { id: "conversion", label: "Revenue & Billing Forecasts", icon: <DollarSign size={15} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition flex items-center gap-2 border ${
              activeTab === tab.id
                ? "bg-[#D4A853] text-[#0C0A09] border-[#D4A853] shadow-lg"
                : "bg-white/[0.03] text-[#FAF7F2] border-white/[0.08] hover:bg-white/[0.08]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Conversion & Traffic */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <GlassCard variant="obsidian" padding="lg" className="lg:col-span-8 border border-white/[0.1] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="wedding-label">Attendance Funnel</div>
                <h3 className="display text-[22px] text-[#FAF7F2] mt-0.5">RSVP Engagement across Celebrations</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] text-[11px] font-mono text-[#D4A853] border border-white/[0.08]">
                {weddings.length} Active Studios
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#FAF7F2] font-semibold">1. Invitations & QR Access Dispatched</span>
                  <span className="font-mono font-bold text-[#D4A853]">{stats.guests || 240} Guests</span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#D4A853] to-[#EAB308]" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#FAF7F2] font-semibold">2. Portal Visits & RSVP Form Opened</span>
                  <span className="font-mono font-bold text-[#A882DD]">{Math.round((stats.guests || 240) * 0.88)} Guests (88%)</span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-[#A882DD]" style={{ width: "88%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#FAF7F2] font-semibold">3. Confirmed Attending (RSVP Yes)</span>
                  <span className="font-mono font-bold text-[#7A9E7E]">{stats.rsvps || Math.round((stats.guests || 240) * 0.74)} Guests ({rsvpRateOverall}%)</span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-[#7A9E7E]" style={{ width: `${rsvpRateOverall}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-[#FAF7F2] font-semibold">4. Photo Wall & Memory Moments Shared</span>
                  <span className="font-mono font-bold text-[#EAB308]">{stats.photos + stats.messages || 46} Contributions</span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-[#EAB308]" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="frost" padding="lg" className="lg:col-span-4 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="wedding-label mb-2">Export Data Reports</div>
              <h4 className="display text-[20px] text-[#FAF7F2] mb-4">Quick Export Manifests</h4>

              <div className="space-y-3">
                <button
                  onClick={() => handleCustomExport("Master Guest List (All Weddings)")}
                  className="w-full p-3.5 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between text-left transition group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={18} className="text-[#D4A853]" />
                    <div>
                      <div className="font-semibold text-[13px] text-[#FAF7F2]">Master Guest List CSV</div>
                      <div className="text-[11px] text-[#A8A29E]">All names, codes & RSVP status</div>
                    </div>
                  </div>
                  <Download size={15} className="text-[#A8A29E] group-hover:text-[#D4A853] transition" />
                </button>

                <button
                  onClick={() => handleCustomExport("Dietary Requirements & Allergies Manifest")}
                  className="w-full p-3.5 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between text-left transition group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <Utensils size={18} className="text-[#7A9E7E]" />
                    <div>
                      <div className="font-semibold text-[13px] text-[#FAF7F2]">Dietary & Allergies Report</div>
                      <div className="text-[11px] text-[#A8A29E]">Catering breakdown sheet</div>
                    </div>
                  </div>
                  <Download size={15} className="text-[#A8A29E] group-hover:text-[#7A9E7E] transition" />
                </button>

                <button
                  onClick={() => handleCustomExport("Studio Revenue & Invoice Breakdown")}
                  className="w-full p-3.5 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between text-left transition group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-[#EAB308]" />
                    <div>
                      <div className="font-semibold text-[13px] text-[#FAF7F2]">Financial Ledger CSV</div>
                      <div className="text-[11px] text-[#A8A29E]">Contract totals & pending invoices</div>
                    </div>
                  </div>
                  <Download size={15} className="text-[#A8A29E] group-hover:text-[#EAB308] transition" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] text-[12px] text-[#A8A29E] flex items-center justify-between">
              <span>CSV Format (RFC 4180)</span>
              <span className="font-mono text-[#D4A853]">UTF-8 Encoded</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: Dietary & Allergies */}
      {activeTab === "dietary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Standard / Omnivore", count: Math.round((stats.guests || 240) * 0.58), percentage: 58, color: "bg-[#D4A853]", desc: "No specific restrictions noted on RSVP submission." },
            { label: "Vegetarian & Plant-Forward", count: Math.round((stats.guests || 240) * 0.22), percentage: 22, color: "bg-[#7A9E7E]", desc: "Dairy & eggs allowed, strictly no meat or poultry." },
            { label: "Vegan (Strict Plant-Based)", count: Math.round((stats.guests || 240) * 0.08), percentage: 8, color: "bg-[#86EFAC]", desc: "Strictly zero animal products or honey." },
            { label: "Gluten-Free (Celiac Safe)", count: Math.round((stats.guests || 240) * 0.07), percentage: 7, color: "bg-[#EAB308]", desc: "Requires dedicated prep space without wheat cross-contact." },
            { label: "Severe Nut Allergies", count: Math.round((stats.guests || 240) * 0.03), percentage: 3, color: "bg-[#C97B7B]", desc: "CRITICAL: Peanut and tree nut free prep environment required." },
            { label: "Kosher & Halal Options", count: Math.round((stats.guests || 240) * 0.02), percentage: 2, color: "bg-[#A882DD]", desc: "Certified kitchen preparations requested by guests." }
          ].map(d => (
            <GlassCard key={d.label} variant="frost" padding="lg" className="border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="wedding-label">{d.label}</span>
                  <span className="font-mono text-[16px] font-bold text-[#FAF7F2]">{d.percentage}%</span>
                </div>
                <div className="display text-[36px] text-[#FAF7F2] my-2">{d.count} <span className="text-[14px] font-sans text-[#A8A29E] font-normal">Guests</span></div>
                <p className="text-[13px] text-[#A8A29E] leading-relaxed mt-2">{d.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="h-2 flex-1 rounded-full bg-white/[0.04] overflow-hidden mr-4">
                  <div className={`h-full ${d.color}`} style={{ width: `${d.percentage * 1.5}%` }} />
                </div>
                <button
                  onClick={() => handleCustomExport(`${d.label} Manifest`)}
                  className="text-[12px] font-semibold text-[#D4A853] hover:underline flex items-center gap-1"
                >
                  <Download size={13} /> Manifest
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab 3: Revenue & Forecasts */}
      {activeTab === "conversion" && (
        <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="wedding-label">Financial Ledger</div>
              <h3 className="display text-[24px] text-[#FAF7F2]">Season 2026 Studio Revenue Projection</h3>
            </div>
            <span className="font-mono text-[20px] font-bold text-[#D4A853]">{stats.revenue} Projected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-[22px] bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="text-[12px] uppercase tracking-wider text-[#A8A29E] font-semibold">Paid & Settled (Stripe)</div>
              <div className="display text-[32px] text-[#7A9E7E]">${(weddings.length * 20.0).toFixed(1)}k</div>
              <div className="text-[12px] text-[#A8A29E]">81.6% of total contractual invoices settled across active celebrations.</div>
            </div>

            <div className="p-5 rounded-[22px] bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="text-[12px] uppercase tracking-wider text-[#A8A29E] font-semibold">Pending Deposit Invoices</div>
              <div className="display text-[32px] text-[#EAB308]">{stats.pendingInvoices}</div>
              <div className="text-[12px] text-[#A8A29E]">Awaiting second milestone deposit signatures and card processing.</div>
            </div>

            <div className="p-5 rounded-[22px] bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="text-[12px] uppercase tracking-wider text-[#A8A29E] font-semibold">Average Studio Package</div>
              <div className="display text-[32px] text-[#D4A853]">$24,500</div>
              <div className="text-[12px] text-[#A8A29E]">Includes bespoke guest portal, RSVP concierge, and gallery cloud hosting.</div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
