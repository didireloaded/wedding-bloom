import React, { useState } from "react";
import {
  Users, UserPlus, Shield, KeyRound, Mail, Phone, CheckCircle2,
  AlertCircle, Lock, Unlock, Search, Filter, MoreVertical,
  ExternalLink, Send, Trash2, Edit3, Award, Sparkles
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

export interface AdminUserManagementViewProps {
  weddings: any[];
  onSelectWedding: (wedding: any) => void;
  onShareWedding: (wedding: any) => void;
}

interface StudioUser {
  id: string;
  name: string;
  email: string;
  role: "Studio Admin" | "Lead Planner" | "Couple" | "Concierge";
  status: "Active" | "Pending" | "Suspended";
  assignedWeddings: string[];
  lastActive: string;
  mfaEnabled: boolean;
}

export function AdminUserManagementView({ weddings, onSelectWedding, onShareWedding }: AdminUserManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StudioUser["role"]>("Lead Planner");
  const [inviteName, setInviteName] = useState("");

  const [users, setUsers] = useState<StudioUser[]>([
    {
      id: "usr_1",
      name: "Victoria Sterling",
      email: "victoria@forevervow.studio",
      role: "Studio Admin",
      status: "Active",
      assignedWeddings: weddings.map(w => w.couple_names),
      lastActive: "Just now",
      mfaEnabled: true
    },
    {
      id: "usr_2",
      name: "Julian Vance",
      email: "julian@forevervow.studio",
      role: "Lead Planner",
      status: "Active",
      assignedWeddings: weddings.slice(0, 3).map(w => w.couple_names),
      lastActive: "2 hours ago",
      mfaEnabled: true
    },
    {
      id: "usr_3",
      name: "Elena & Marcus (Couple)",
      email: "elena.marcus@gmail.com",
      role: "Couple",
      status: "Active",
      assignedWeddings: [weddings[0]?.couple_names || "Elena & Marcus"],
      lastActive: "Yesterday",
      mfaEnabled: false
    },
    {
      id: "usr_4",
      name: "Sophia Chen",
      email: "sophia.c@luxuryevents.co",
      role: "Concierge",
      status: "Pending",
      assignedWeddings: weddings.slice(1, 2).map(w => w.couple_names),
      lastActive: "Invited 3 days ago",
      mfaEnabled: false
    }
  ]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase().replace(/\s+/g, "-") === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      toast.error("Please enter both name and email address");
      return;
    }
    const newUser: StudioUser = {
      id: `usr_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: "Pending",
      assignedWeddings: ["All New Celebrations"],
      lastActive: "Invited just now",
      mfaEnabled: false
    };
    setUsers([newUser, ...users]);
    setShowInviteModal(false);
    setInviteName("");
    setInviteEmail("");
    toast.success(`Invitation sent to ${inviteEmail} (${inviteRole})`);
  };

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        toast.info(`Updated user status to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const removeUser = (id: string, name: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success(`Removed access for ${name}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <GlassCard variant="obsidian" padding="lg" className="border border-white/[0.1] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#D4A853]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-2">
              <Shield size={14} /> Governance & Access Directory
            </div>
            <h2 className="display text-[32px] md:text-[40px] text-[#FAF7F2] leading-tight">
              Studio & Couple <span className="script fv-gradient-text">Users</span>
            </h2>
            <p className="text-[14px] text-[#A8A29E] max-w-xl mt-2">
              Manage multi-tenant studio credentials, planner permissions, couple dashboard access codes, and VIP concierge invitations across all active celebrations.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="fv-btn-primary self-start md:self-auto !py-3 !px-6 flex items-center gap-2 shadow-xl"
          >
            <UserPlus size={16} /> Invite Studio Member
          </button>
        </div>

        {/* Roles Summary Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#D4A853]">
              {users.filter(u => u.role === "Studio Admin").length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Studio Admins</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#FAF7F2]">
              {users.filter(u => u.role === "Lead Planner" || u.role === "Concierge").length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Planners & Concierge</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#7A9E7E]">
              {weddings.length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">Active Couple Accounts</div>
          </div>
          <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[24px] font-mono font-bold text-[#A882DD]">
              {users.filter(u => u.mfaEnabled).length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] mt-1 font-medium">MFA Protected</div>
          </div>
        </div>
      </GlassCard>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-11 pr-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853] transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: "All Roles", value: "all" },
            { label: "Admins", value: "studio-admin" },
            { label: "Planners", value: "lead-planner" },
            { label: "Couples", value: "couple" },
            { label: "Concierge", value: "concierge" }
          ].map(r => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-4 py-2 rounded-full text-[12px] font-medium transition whitespace-nowrap border ${
                roleFilter === r.value
                  ? "bg-[#D4A853] text-[#0C0A09] border-[#D4A853]"
                  : "bg-white/[0.04] text-[#FAF7F2] border-white/[0.08] hover:bg-white/[0.08]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <GlassCard variant="obsidian" padding="none" className="border border-white/[0.1] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[11px] uppercase tracking-[0.18em] text-[#78716C]">
              <tr>
                <th className="p-4 pl-6">Member & Email</th>
                <th className="p-4">Studio Role</th>
                <th className="p-4">Celebration Scope</th>
                <th className="p-4">Security (MFA)</th>
                <th className="p-4">Status & Activity</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.03] transition group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853]/30 to-[#B8872E]/10 border border-[#D4A853]/30 flex items-center justify-center font-bold text-[#D4A853] shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#FAF7F2] group-hover:text-[#D4A853] transition">{user.name}</div>
                        <div className="text-[12px] text-[#A8A29E] flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} className="text-[#78716C]" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 ${
                      user.role === "Studio Admin"
                        ? "bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#FDE047]"
                        : user.role === "Lead Planner"
                        ? "bg-[#A882DD]/20 border border-[#A882DD]/40 text-[#D8B4FE]"
                        : user.role === "Couple"
                        ? "bg-[#7A9E7E]/20 border border-[#7A9E7E]/40 text-[#86EFAC]"
                        : "bg-white/[0.06] border border-white/[0.1] text-[#E7E5E4]"
                    }`}>
                      {user.role === "Studio Admin" && <Award size={11} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {user.assignedWeddings.slice(0, 2).map((wName, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#FAF7F2]/90 truncate max-w-[140px]">
                          {wName}
                        </span>
                      ))}
                      {user.assignedWeddings.length > 2 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-[11px] font-mono text-[#D4A853]">
                          +{user.assignedWeddings.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.mfaEnabled ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7A9E7E]">
                        <CheckCircle2 size={14} /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#A8A29E]">
                        <AlertCircle size={14} className="text-[#EAB308]" /> Optional
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        user.status === "Active" ? "bg-[#7A9E7E]/20 text-[#86EFAC]" :
                        user.status === "Pending" ? "bg-[#EAB308]/20 text-[#FDE047]" :
                        "bg-[#C97B7B]/20 text-[#FCA5A5]"
                      }`}>
                        {user.status}
                      </span>
                      <div className="text-[11px] text-[#78716C] mt-1 font-mono">{user.lastActive}</div>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-[#A8A29E] hover:text-[#FAF7F2] transition"
                        title={user.status === "Active" ? "Suspend Access" : "Activate User"}
                      >
                        {user.status === "Active" ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      <button
                        onClick={() => removeUser(user.id, user.name)}
                        className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-[#C97B7B]/20 flex items-center justify-center text-[#A8A29E] hover:text-[#E4A5A5] transition"
                        title="Remove User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <div className="w-full max-w-lg glass-obsidian rounded-[32px] border border-white/[0.15] p-8 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div>
              <div className="wedding-label text-[#D4A853]">Governance Invitation</div>
              <h3 className="display text-[26px] text-[#FAF7F2] mt-1">Invite Studio Member</h3>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Julian Vance"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="julian@forevervow.studio"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] placeholder-[#78716C] outline-none focus:border-[#D4A853]"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-wider font-semibold text-[#A8A29E] mb-1.5">Role Permission</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as StudioUser["role"])}
                  className="w-full bg-[#181614] border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] text-[#FAF7F2] outline-none focus:border-[#D4A853]"
                >
                  <option value="Lead Planner">Lead Planner (Manage assigned weddings)</option>
                  <option value="Studio Admin">Studio Admin (Full governance & global access)</option>
                  <option value="Concierge">Concierge (Guest assistance & RSVP lookup)</option>
                  <option value="Couple">Couple (Read/Write specific celebration)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="fv-btn-ghost !py-2.5 !px-5 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fv-btn-primary !py-2.5 !px-6 text-[13px] flex items-center gap-2"
                >
                  <Send size={15} /> Send Access Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
