/**
 * ForeverVow — Admin System Health Module
 * Real-time monitoring cockpit displaying cache stats, feature flags, job queues, and API uptime.
 */

import React, { useState, useEffect } from "react";
import { CacheService } from "@/services/CacheService";
import { FeatureFlagService } from "@/services/FeatureFlagService";
import { JobQueue, Job } from "@/services/jobs/JobQueue";
import { APIv1 } from "@/api/v1";
import { FeatureFlag, FEATURE_FLAG_METADATA } from "@/config";
import { GlassCard } from "@/components/ui/GlassCard";

export const SystemHealthModule: React.FC = () => {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>(FeatureFlagService.getAll());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [health, setHealth] = useState<{ status: string; uptimeSeconds: number }>({ status: "OK", uptimeSeconds: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    setCacheSize(CacheService.size());
    setFlags(FeatureFlagService.getAll());
    setJobs(JobQueue.getAllJobs());
    const res = APIv1.getHealthStatus();
    if (res.data) {
      setHealth(res.data);
    }
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePruneCache = () => {
    const pruned = CacheService.prune();
    refreshMetrics();
    alert(`Pruned ${pruned} expired entries from cache.`);
  };

  const handleClearCache = () => {
    CacheService.clear();
    refreshMetrics();
  };

  const handleToggleFlag = async (flag: FeatureFlag, current: boolean) => {
    await FeatureFlagService.updateInDb(flag, !current);
    refreshMetrics();
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending").length;
  const runningJobs = jobs.filter((j) => j.status === "running").length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const failedJobs = jobs.filter((j) => j.status === "failed").length;

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#0e100f] text-[#fffce1] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#fffce1]/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#fffce1]">
              System Health &amp; Architecture Cockpit
            </h1>
            <p className="text-sm md:text-base text-[#fffce1]/60 mt-1">
              Real-time telemetry, cache management, background queues, and feature flags.
            </p>
          </div>
          <button
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="px-5 py-2.5 rounded-full bg-[#fffce1] text-[#0e100f] font-bold text-sm hover:bg-[#fffce1]/90 transition-all shadow-lg flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
          >
            <span className={`inline-block w-2 h-2 rounded-full bg-emerald-500 ${isRefreshing ? "animate-ping" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Telemetry"}
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6 border-[#fffce1]/15">
            <div className="text-xs uppercase tracking-widest text-[#fffce1]/50 font-mono">API v1 Status</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-2xl font-bold">{health.status}</span>
            </div>
            <div className="text-xs text-[#fffce1]/60 mt-2">Uptime: {formatUptime(health.uptimeSeconds)}</div>
          </GlassCard>

          <GlassCard className="p-6 border-[#fffce1]/15">
            <div className="text-xs uppercase tracking-widest text-[#fffce1]/50 font-mono">In-Memory Cache</div>
            <div className="text-2xl font-bold mt-2">{cacheSize} <span className="text-sm font-normal text-[#fffce1]/60">active keys</span></div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={handlePruneCache} className="px-3 py-1 text-xs rounded bg-[#fffce1]/10 hover:bg-[#fffce1]/20 transition border border-[#fffce1]/20">Prune Expired</button>
              <button onClick={handleClearCache} className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition border border-red-500/30">Flush All</button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-[#fffce1]/15">
            <div className="text-xs uppercase tracking-widest text-[#fffce1]/50 font-mono">Background Jobs</div>
            <div className="text-2xl font-bold mt-2">{jobs.length} <span className="text-sm font-normal text-[#fffce1]/60">total jobs</span></div>
            <div className="flex items-center gap-3 text-xs mt-3 text-[#fffce1]/70">
              <span className="text-amber-400">● {pendingJobs} pend</span>
              <span className="text-blue-400">● {runningJobs} run</span>
              <span className="text-emerald-400">● {completedJobs} done</span>
              <span className="text-red-400">● {failedJobs} fail</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-[#fffce1]/15">
            <div className="text-xs uppercase tracking-widest text-[#fffce1]/50 font-mono">Feature Flags</div>
            <div className="text-2xl font-bold mt-2">
              {Object.values(flags).filter(Boolean).length} / {Object.keys(flags).length}
            </div>
            <div className="text-xs text-[#fffce1]/60 mt-2">Active progressive rollouts</div>
          </GlassCard>
        </div>

        {/* Feature Flags Grid */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#fffce1] mb-4 flex items-center gap-2">
            <span>Progressive Rollouts &amp; Feature Flags</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(flags) as FeatureFlag[]).map((flag) => {
              const isEnabled = flags[flag];
              const meta = FEATURE_FLAG_METADATA[flag] || { label: flag, description: "System feature flag", category: "General" };

              return (
                <GlassCard key={flag} className="p-6 flex flex-col justify-between border-[#fffce1]/10 hover:border-[#fffce1]/25 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#fffce1]/10 text-[#fffce1]/80 border border-[#fffce1]/20">
                        {meta.category}
                      </span>
                      <button
                        onClick={() => handleToggleFlag(flag, isEnabled)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${
                          isEnabled ? "bg-emerald-500 justify-end" : "bg-zinc-700 justify-start"
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-[#fffce1]">{meta.label}</h3>
                    <p className="text-xs text-[#fffce1]/70 mt-1 leading-relaxed">{meta.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#fffce1]/10 flex items-center justify-between text-xs font-mono text-[#fffce1]/50">
                    <span>Key: {flag}</span>
                    <span className={isEnabled ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                      {isEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Recent Job Queue Table */}
        <GlassCard className="p-6 border-[#fffce1]/15">
          <h2 className="text-xl font-bold tracking-tight text-[#fffce1] mb-4">
            Recent Background Job Activity
          </h2>
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-[#fffce1]/40 text-sm font-mono border border-dashed border-[#fffce1]/10 rounded-xl">
              No background jobs have been processed in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#fffce1]/10 text-xs font-mono uppercase text-[#fffce1]/50 tracking-wider">
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Duration / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fffce1]/10 text-sm font-mono">
                  {jobs.slice(-10).reverse().map((j) => {
                    const duration = j.completedAt && j.startedAt ? `${j.completedAt - j.startedAt}ms` : "-";
                    return (
                      <tr key={j.id} className="hover:bg-[#fffce1]/5 transition">
                        <td className="py-3 px-4 text-[#fffce1]/80">{j.id}</td>
                        <td className="py-3 px-4 font-bold">{j.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            j.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                            j.status === "failed" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                            j.status === "running" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse" :
                            "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {j.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#fffce1]/60">{new Date(j.createdAt).toLocaleTimeString()}</td>
                        <td className="py-3 px-4 text-red-300">{j.error || duration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
