// ForeverVow Commercial SaaS Operating System Layer
// Implements enterprise capabilities: Workflow Orchestration, Permissions RBAC, Feature Flags,
// Global Search, Caching, Audit Trails, Recovery/Recycle Bin, and Versioning Snapshots.

import { store, TableName } from "./weddingStore";
import { workflowBus, WorkflowEvent } from "./workflowEngine";
import { toast } from "sonner";

// ==========================================
// 22. PERMISSIONS ENGINE (RBAC)
// ==========================================
export type Role = "Admin" | "Couple" | "Guest" | "Vendor" | "Planner" | "Photographer" | "MC" | "Venue";

export type PermissionAction =
  | "CreateWeddings"
  | "DeleteWeddings"
  | "ArchiveWeddings"
  | "ManageTemplates"
  | "ViewReports"
  | "EditWedding"
  | "UploadPhotos"
  | "SendUpdates"
  | "SubmitRSVP"
  | "PostGuestbook"
  | "ManageVendors"
  | "ExportData";

const ROLE_PERMISSIONS: Record<Role, Set<PermissionAction>> = {
  Admin: new Set([
    "CreateWeddings", "DeleteWeddings", "ArchiveWeddings", "ManageTemplates",
    "ViewReports", "EditWedding", "UploadPhotos", "SendUpdates",
    "ManageVendors", "ExportData"
  ]),
  Couple: new Set([
    "EditWedding", "UploadPhotos", "SendUpdates", "ManageVendors", "ExportData"
  ]),
  Planner: new Set([
    "EditWedding", "UploadPhotos", "SendUpdates", "ManageVendors"
  ]),
  Vendor: new Set([
    "UploadPhotos"
  ]),
  Photographer: new Set([
    "UploadPhotos"
  ]),
  MC: new Set([
    "SendUpdates"
  ]),
  Venue: new Set([]),
  Guest: new Set([
    "SubmitRSVP", "UploadPhotos", "PostGuestbook"
  ])
};

export const PermissionsEngine = {
  can(role: Role, action: PermissionAction): boolean {
    const perms = ROLE_PERMISSIONS[role];
    return perms ? perms.has(action) : false;
  },
  requirePermission(role: Role, action: PermissionAction): boolean {
    if (!this.can(role, action)) {
      toast.error(`Permission Denied: Role '${role}' lacks authorization for '${action}'.`);
      return false;
    }
    return true;
  }
};

// ==========================================
// 23. FEATURE FLAG SYSTEM
// ==========================================
export type FeatureFlagKey =
  | "LiveWedding"
  | "AIImport"
  | "VendorPortal"
  | "MemoryBook"
  | "GPSJourney"
  | "DynamicThemes"
  | "PublicWebsiteBuilder"
  | "AdvancedAnalytics";

interface FeatureFlagConfig {
  key: FeatureFlagKey;
  label: string;
  enabledByDefault: boolean;
  stageStatus: "GA" | "BETA" | "OFF";
}

const DEFAULT_FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagConfig> = {
  LiveWedding: { key: "LiveWedding", label: "Live Celebration Pulse", enabledByDefault: true, stageStatus: "GA" },
  AIImport: { key: "AIImport", label: "AI Spreadsheet Assistant", enabledByDefault: false, stageStatus: "OFF" },
  VendorPortal: { key: "VendorPortal", label: "Collaborative Vendor Suite", enabledByDefault: true, stageStatus: "GA" },
  MemoryBook: { key: "MemoryBook", label: "Eternal Memory Book Archive", enabledByDefault: true, stageStatus: "GA" },
  GPSJourney: { key: "GPSJourney", label: "Interactive GPS Guest Navigation", enabledByDefault: true, stageStatus: "BETA" },
  DynamicThemes: { key: "DynamicThemes", label: "Dynamic Tokenized Design System", enabledByDefault: true, stageStatus: "GA" },
  PublicWebsiteBuilder: { key: "PublicWebsiteBuilder", label: "PWA Public Guest Portal", enabledByDefault: true, stageStatus: "GA" },
  AdvancedAnalytics: { key: "AdvancedAnalytics", label: "Real-time Traffic & Conversion Insights", enabledByDefault: true, stageStatus: "GA" }
};

export const FeatureFlagEngine = {
  isEnabled(flagKey: FeatureFlagKey, studioOverrides?: Record<string, boolean>): boolean {
    if (studioOverrides && flagKey in studioOverrides) {
      return studioOverrides[flagKey];
    }
    const config = DEFAULT_FEATURE_FLAGS[flagKey];
    return config ? config.enabledByDefault : false;
  },
  getStatus(flagKey: FeatureFlagKey) {
    return DEFAULT_FEATURE_FLAGS[flagKey]?.stageStatus || "OFF";
  },
  getAllFlags() {
    return Object.values(DEFAULT_FEATURE_FLAGS);
  }
};

// ==========================================
// 25. NOTIFICATION ENGINE
// ==========================================
export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export interface SystemNotification {
  id: string;
  recipient: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  timestamp: string;
  read: boolean;
}

export const NotificationEngine = {
  dispatch(recipient: string, title: string, message: string, channels: NotificationChannel[] = ["in_app"]) {
    const timestamp = new Date().toISOString();
    const notification: SystemNotification = {
      id: crypto.randomUUID(),
      recipient,
      title,
      message,
      channel: channels[0],
      timestamp,
      read: false
    };

    const existing = JSON.parse(localStorage.getItem("_fv_notifications") || "[]");
    localStorage.setItem("_fv_notifications", JSON.stringify([notification, ...existing].slice(0, 100)));

    if (typeof window !== "undefined") {
      toast.success(title, { description: message });
    }
    return notification;
  },
  getRecent(recipient?: string): SystemNotification[] {
    const all: SystemNotification[] = JSON.parse(localStorage.getItem("_fv_notifications") || "[]");
    if (!recipient) return all;
    return all.filter(n => n.recipient === recipient || n.recipient === "all");
  }
};

// ==========================================
// 28. VERSIONING ENGINE (TIMELINE & CONTENT SNAPSHOTS)
// ==========================================
export interface VersionSnapshot {
  versionId: string;
  weddingId: string;
  entityType: "timeline" | "gallery" | "settings" | "announcements";
  snapshotData: any;
  actor: string;
  description: string;
  timestamp: string;
}

export const VersioningEngine = {
  captureSnapshot(weddingId: string, entityType: VersionSnapshot["entityType"], snapshotData: any, actor = "Studio Admin", description = "Auto-save version checkpoint") {
    const snapshot: VersionSnapshot = {
      versionId: crypto.randomUUID(),
      weddingId,
      entityType,
      snapshotData: JSON.parse(JSON.stringify(snapshotData)),
      actor,
      description,
      timestamp: new Date().toISOString()
    };
    const key = `_fv_versions_${weddingId}_${entityType}`;
    const history = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([snapshot, ...history].slice(0, 30)));
    return snapshot;
  },
  getHistory(weddingId: string, entityType: VersionSnapshot["entityType"]): VersionSnapshot[] {
    const key = `_fv_versions_${weddingId}_${entityType}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },
  restoreSnapshot(versionId: string, weddingId: string, entityType: VersionSnapshot["entityType"]): any | null {
    const history = this.getHistory(weddingId, entityType);
    const found = history.find(v => v.versionId === versionId);
    if (found) {
      toast.info(`Restored ${entityType} to version checkpoint from ${new Date(found.timestamp).toLocaleTimeString()}`);
      return found.snapshotData;
    }
    return null;
  }
};

// ==========================================
// 29. RECOVERY ENGINE (SOFT DELETE & RECYCLE BIN)
// ==========================================
export interface TrashedItem {
  id: string;
  table: TableName;
  data: any;
  deletedAt: string;
  deletedBy: string;
}

export const RecoveryEngine = {
  softDelete(table: TableName, id: string, deletedBy = "User") {
    const item = store.all(table).find((r: any) => r.id === id);
    if (!item) return false;
    
    const trashed: TrashedItem = {
      id,
      table,
      data: item,
      deletedAt: new Date().toISOString(),
      deletedBy
    };
    
    const trashBin = JSON.parse(localStorage.getItem("_fv_recycle_bin") || "[]");
    localStorage.setItem("_fv_recycle_bin", JSON.stringify([trashed, ...trashBin]));
    
    store.remove(table, id);
    toast.success(`Moved item to Recycle Bin`, {
      action: {
        label: "Undo",
        onClick: () => this.restore(id)
      }
    });
    return true;
  },
  listTrash(table?: TableName): TrashedItem[] {
    const trashBin: TrashedItem[] = JSON.parse(localStorage.getItem("_fv_recycle_bin") || "[]");
    if (!table) return trashBin;
    return trashBin.filter(t => t.table === table);
  },
  restore(id: string): boolean {
    const trashBin: TrashedItem[] = JSON.parse(localStorage.getItem("_fv_recycle_bin") || "[]");
    const idx = trashBin.findIndex(t => t.id === id);
    if (idx < 0) return false;
    
    const [restored] = trashBin.splice(idx, 1);
    localStorage.setItem("_fv_recycle_bin", JSON.stringify(trashBin));
    
    store.insert(restored.table, restored.data);
    toast.success(`Successfully restored item from Recycle Bin`);
    return true;
  }
};

// ==========================================
// 30. AUDIT TRAIL ENGINE
// ==========================================
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: string;
  details: string;
}

export const AuditTrailEngine = {
  record(actor: string, action: string, entityType: string, details: string) {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      entityType,
      details
    };
    const current = JSON.parse(localStorage.getItem("_fv_audit_logs") || "[]");
    localStorage.setItem("_fv_audit_logs", JSON.stringify([entry, ...current].slice(0, 250)));
    return entry;
  },
  getLogs(limit = 50): AuditLogEntry[] {
    return JSON.parse(localStorage.getItem("_fv_audit_logs") || "[]").slice(0, limit);
  }
};

// ==========================================
// 26. GLOBAL SEARCH ENGINE
// ==========================================
export interface SearchHit {
  id: string;
  category: "Wedding" | "Guest" | "Venue" | "Announcement" | "Photo";
  title: string;
  subtitle: string;
  link: string;
}

export const GlobalSearchEngine = {
  search(query: string): SearchHit[] {
    const term = query.toLowerCase().trim();
    if (!term) return [];

    const hits: SearchHit[] = [];

    // Search Weddings
    store.all("weddings").forEach((w: any) => {
      if (
        w.couple_names?.toLowerCase().includes(term) ||
        w.slug?.toLowerCase().includes(term) ||
        w.access_code?.toLowerCase().includes(term) ||
        w.ceremony_venue?.toLowerCase().includes(term)
      ) {
        hits.push({
          id: w.id,
          category: "Wedding",
          title: w.couple_names,
          subtitle: `Code: ${w.access_code} · Venue: ${w.ceremony_venue || "Private Studio"}`,
          link: `/couple/${w.slug}/dashboard`
        });
      }
    });

    // Search RSVPs / Guests
    store.all("rsvps").forEach((r: any) => {
      if (r.guest_name?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term)) {
        hits.push({
          id: r.id,
          category: "Guest",
          title: r.guest_name,
          subtitle: `Status: ${r.attending} · Diet: ${r.dietary_preference || "Standard"}`,
          link: `/admin/dashboard`
        });
      }
    });

    // Search Announcements
    store.all("updates").forEach((u: any) => {
      if (u.title?.toLowerCase().includes(term) || u.message?.toLowerCase().includes(term)) {
        hits.push({
          id: u.id,
          category: "Announcement",
          title: u.title,
          subtitle: u.message,
          link: `/admin/dashboard`
        });
      }
    });

    return hits.slice(0, 20);
  }
};

// ==========================================
// 40. THE FOREVERVOW OPERATING SYSTEM HUB
// Interconnected Event Bus Orchestrator
// ==========================================
class OperatingSystemHub {
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Listen to all Workflow Events and orchestrate cascading system updates
    workflowBus.subscribe("*", (event: WorkflowEvent) => {
      const actor = "Automated Operating System";

      switch (event.type) {
        case "WeddingCreated":
          AuditTrailEngine.record(actor, "Created Celebration Studio", "Wedding", `Initialized studio ID ${event.weddingId}`);
          NotificationEngine.dispatch("Admin", "New Celebration Configured", `Celebration studio created successfully.`);
          break;

        case "WeddingPublished":
          AuditTrailEngine.record(actor, "Published Celebration Invitation", "Wedding", `Live invitation deployed for ${event.weddingId}`);
          NotificationEngine.dispatch("Couple", "Invitation Deployed", `Your guest portal is now live and ready for RSVPs.`);
          break;

        case "GuestRSVPSubmitted":
          AuditTrailEngine.record("Guest Portal", "Confirmed Attendance", "RSVP", `RSVP logged for celebration ${event.weddingId}`);
          NotificationEngine.dispatch("Couple", "New RSVP Received", `A guest has confirmed their attendance.`);
          break;

        case "PhotoUploaded":
          AuditTrailEngine.record("Guest App", "Uploaded Memory Snapshot", "Gallery", `New media uploaded to celebration gallery.`);
          break;
      }
    });
  }
}

export const ForeverVowOS = new OperatingSystemHub();
ForeverVowOS.init();
