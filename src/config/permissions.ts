/**
 * ForeverVow — Permission Definitions & Role Mappings
 * Granular permissions to control access across all domain entities.
 */

import { UserRole } from "./roles";

export const Permission = {
  // Wedding Management
  WEDDING_CREATE: "wedding:create",
  WEDDING_EDIT: "wedding:edit",
  WEDDING_DELETE: "wedding:delete",
  WEDDING_PUBLISH: "wedding:publish",
  WEDDING_VIEW_ALL: "wedding:view_all",

  // Guest & RSVP Management
  GUEST_MANAGE: "guest:manage",
  GUEST_VIEW: "guest:view",
  RSVP_SUBMIT: "rsvp:submit",

  // Media & Gallery
  PHOTO_UPLOAD: "photo:upload",
  PHOTO_MODERATE: "photo:moderate",
  GALLERY_MANAGE: "gallery:manage",

  // Communication & Broadcasts
  BROADCAST_SEND: "broadcast:send",
  BROADCAST_VIEW: "broadcast:view",

  // Planning Suite (Budget, Run-sheet, Seating)
  BUDGET_VIEW: "budget:view",
  BUDGET_EDIT: "budget:edit",
  TIMELINE_EDIT: "timeline:edit",
  SEATING_MANAGE: "seating:manage",

  // System & Analytics
  ANALYTICS_VIEW: "analytics:view",
  SYSTEM_ADMIN: "system:admin",
  AUDIT_LOG_VIEW: "audit:view",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/** Default permission grants per role */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admins get every permission

  [UserRole.COUPLE]: [
    Permission.WEDDING_EDIT,
    Permission.WEDDING_PUBLISH,
    Permission.GUEST_MANAGE,
    Permission.GUEST_VIEW,
    Permission.PHOTO_UPLOAD,
    Permission.PHOTO_MODERATE,
    Permission.GALLERY_MANAGE,
    Permission.BROADCAST_SEND,
    Permission.BROADCAST_VIEW,
    Permission.BUDGET_VIEW,
    Permission.BUDGET_EDIT,
    Permission.TIMELINE_EDIT,
    Permission.SEATING_MANAGE,
    Permission.ANALYTICS_VIEW,
  ],

  [UserRole.VENDOR]: [
    Permission.GUEST_VIEW,
    Permission.PHOTO_UPLOAD,
    Permission.TIMELINE_EDIT,
  ],

  [UserRole.GUEST]: [
    Permission.RSVP_SUBMIT,
    Permission.PHOTO_UPLOAD,
  ],
};
