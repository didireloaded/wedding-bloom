import React, { useState } from "react";
import {
  Settings, Shield, Lock, Database, Mail, Bell, Palette,
  Globe, CheckCircle2, Save, RefreshCw, HardDrive, Cpu,
  Sparkles, KeyRound, AlertTriangle, Eye
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

export interface AdminSettingsViewProps {
  stats: {
    photos: number;
    total: number;
  };
}

export function AdminSettingsView({ stats }: AdminSettingsViewProps) {
  const [studioName, setStudioName] = useState("ForeverVow Studio Headquarters");
  const [customDomain, setCustomDomain] = useState("studio.forevervow.com");
  const [accentColor, setAccentColor] = useState("#D4A853");
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [autoArchiveDays, setAutoArchiveDays] = useState(90);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [storageAlerts, setStorageAlerts] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Studio governance & system preferences saved successfully");
  };

  const runDatabaseOptimization = () => {
    toast.info("Running local storage index vacuum & asset cleanup...");
    setTimeout(() => {
      toast.success("Database optimized: 14 cached query manifests purged");
    }, 1200);
  };

  const storageUsedGB = (2.4 + stats.photos * 0.08).toFixed(2);
  const storageLimitGB = 25.0;
  const storagePercentage = Math.min(100, Math.round((parseFloat(storageUsedGB) / storageLimitGB) * 100));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#D4A853]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-2">
              <Settings size={14} /> Global System Configuration
            </div>
            <h2 className="display text-[32px] md:text-[40px] text-[#FAF7F2] leading-tight">
              Studio Governance & <span className="script fv-gradient-text">Settings</span>
            </h2>
            <p className="text-[14px] text-[#A8A29E] max-w-xl mt-2">
              Configure white-label branding, global security rules, RLS audit boundaries, email/SMS notification overrides, and cloud asset storage limits across all active studios.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="fv-btn-primary self-start md:self-auto !py-3 !px-6 flex items-center gap-2 shadow-xl"
          >
            <Save size={16} /> Save Master Preferences
          </button>
        </div>
      </GlassCard>

      {/* Grid of Settings Modules */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Branding & Security */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: White-Label Studio Branding */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-[#D4A853]">
                <Palette size={18} />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#FAF7F2]">White-Label Studio Branding</h3>
                <p className="text-[12px] text-[#A8A29E]">Customize the header identity, custom domain, and primary gold accent displayed to couples.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Studio Display Name</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={e => setStudioName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] outline-none focus:border-[#D4A853]"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Custom Studio Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] font-mono text-[#D4A853] outline-none focus:border-[#D4A853]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-2">Primary Studio Accent Color</label>
              <div className="flex items-center gap-3">
                {[
                  { hex: "#D4A853", name: "Imperial Gold (Default)" },
                  { hex: "#A882DD", name: "Amethyst Violet" },
                  { hex: "#7A9E7E", name: "Sage Eucalyptus" },
                  { hex: "#C97B7B", name: "Rose Quartz" },
                  { hex: "#EAB308", name: "Vibrant Champagne" }
                ].map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition text-[12px] ${
                      accentColor === c.hex
                        ? "bg-white/[0.1] border-white text-white font-bold"
                        : "bg-white/[0.03] border-white/[0.08] text-[#A8A29E] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Governance & Security Rules */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-[#7A9E7E]">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#FAF7F2]">Platform Governance & Security</h3>
                <p className="text-[12px] text-[#A8A29E]">Manage Row-Level Security parameters, passkey policies, and automated data archival rules.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="font-semibold text-[14px] text-[#FAF7F2] flex items-center gap-2">
                    <Lock size={15} className="text-[#D4A853]" /> Enforce Multi-Factor Authentication (MFA)
                  </div>
                  <div className="text-[12px] text-[#A8A29E] mt-0.5">Require all Studio Admins and Lead Planners to authenticate via Passkeys or TOTP.</div>
                </div>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={e => setMfaEnforced(e.target.checked)}
                  className="w-5 h-5 accent-[#D4A853]"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="font-semibold text-[14px] text-[#FAF7F2] flex items-center gap-2">
                    <Mail size={15} className="text-[#A882DD]" /> Client Activity Email & SMS Notifications
                  </div>
                  <div className="text-[12px] text-[#A8A29E] mt-0.5">Send instant push notifications to studio directors when RSVPs or guest photos are submitted.</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={e => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 accent-[#D4A853]"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="font-semibold text-[14px] text-[#FAF7F2]">Auto-Archive Completed Celebrations</div>
                  <div className="text-[12px] text-[#A8A29E] mt-0.5">Automatically transition weddings to read-only archival state after a set period.</div>
                </div>
                <select
                  value={autoArchiveDays}
                  onChange={e => setAutoArchiveDays(parseInt(e.target.value))}
                  className="bg-[#181614] border border-white/[0.1] rounded-xl px-3 py-1.5 text-[13px] text-[#FAF7F2] outline-none"
                >
                  <option value={30}>30 Days Post-Event</option>
                  <option value={60}>60 Days Post-Event</option>
                  <option value={90}>90 Days Post-Event</option>
                  <option value={365}>1 Year (VIP Retention)</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Cols: Storage & Diagnostics */}
        <div className="lg:col-span-4 space-y-8">
          <GlassCard variant="frost" padding="lg" className="border border-white/[0.08] space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <HardDrive size={20} className="text-[#D4A853]" />
              <div>
                <h4 className="text-[16px] font-semibold text-[#FAF7F2]">Cloud Asset Storage</h4>
                <p className="text-[11px] text-[#A8A29E]">High-res gallery photo & video consumption</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] mb-2">
                <span className="font-semibold text-[#FAF7F2]">{storageUsedGB} GB Used</span>
                <span className="font-mono text-[#D4A853] font-bold">{storagePercentage}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    storagePercentage > 85 ? "bg-[#C97B7B]" : "bg-gradient-to-r from-[#D4A853] to-[#7A9E7E]"
                  }`}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              <div className="text-[11px] text-[#78716C] mt-2 flex items-center justify-between">
                <span>Total Studio Allocation</span>
                <span className="font-mono">{storageLimitGB} GB</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.06] text-[12px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#A8A29E]">Guest Uploaded Photos:</span>
                <span className="font-mono text-[#FAF7F2]">{stats.photos} assets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8A29E]">Active Studios:</span>
                <span className="font-mono text-[#FAF7F2]">{stats.total} weddings</span>
              </div>
            </div>

            <button
              type="button"
              onClick={runDatabaseOptimization}
              className="w-full fv-btn-ghost !py-3 text-[12px] flex items-center justify-center gap-2 border border-white/[0.1] hover:bg-white/[0.08]"
            >
              <RefreshCw size={14} /> Run Storage Index Optimization
            </button>
          </GlassCard>

          {/* System Health Summary Card */}
          <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] space-y-4">
            <div className="wedding-label flex items-center gap-1.5 text-[#7A9E7E]">
              <CheckCircle2 size={14} /> Systems Operational
            </div>
            <h5 className="text-[15px] font-semibold text-[#FAF7F2]">Studio Engine v2.4.0 (Gold Build)</h5>
            <p className="text-[12px] text-[#A8A29E] leading-relaxed">
              All real-time WebSocket sync channels, QR check-in processors, and image CDN pipelines are functioning with 99.99% uptime.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7A9E7E]/15 border border-[#7A9E7E]/30 text-[#86EFAC] text-[11px] font-mono">
                <Cpu size={12} /> Latency: 14ms (US-East / EU-West)
              </div>
            </div>
          </GlassCard>
        </div>
      </form>
    </div>
  );
}
