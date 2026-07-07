/**
 * ForeverVow — Permission Engine
 * Centralized authorization service replacing inline role checks.
 */

import { UserRole, Permission, ROLE_PERMISSIONS } from "@/config";

export class PermissionService {
  /**
   * Check if a given role is granted a specific permission.
   */
  static can(role: UserRole, permission: Permission): boolean {
    if (!role) return false;
    const grants = ROLE_PERMISSIONS[role] || [];
    return grants.includes(permission);
  }

  /**
   * Check if a role can perform multiple required permissions (AND logic).
   */
  static canAll(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((perm) => this.can(role, perm));
  }

  /**
   * Check if a role has at least one of the provided permissions (OR logic).
   */
  static canAny(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((perm) => this.can(role, perm));
  }

  // --- Domain-Specific Convenience Helpers ---

  static canCreateWedding(role: UserRole): boolean {
    return this.can(role, Permission.WEDDING_CREATE);
  }

  static canEditWedding(role: UserRole): boolean {
    return this.can(role, Permission.WEDDING_EDIT);
  }

  static canDeleteWedding(role: UserRole): boolean {
    return this.can(role, Permission.WEDDING_DELETE);
  }

  static canPublishWedding(role: UserRole): boolean {
    return this.can(role, Permission.WEDDING_PUBLISH);
  }

  static canUploadPhotos(role: UserRole): boolean {
    return this.can(role, Permission.PHOTO_UPLOAD);
  }

  static canModerateContent(role: UserRole): boolean {
    return this.can(role, Permission.PHOTO_MODERATE) || this.can(role, Permission.GALLERY_MANAGE);
  }

  static canViewAnalytics(role: UserRole): boolean {
    return this.can(role, Permission.ANALYTICS_VIEW);
  }

  static canSendBroadcasts(role: UserRole): boolean {
    return this.can(role, Permission.BROADCAST_SEND);
  }

  static canManageGuests(role: UserRole): boolean {
    return this.can(role, Permission.GUEST_MANAGE);
  }

  static canEditBudget(role: UserRole): boolean {
    return this.can(role, Permission.BUDGET_EDIT);
  }

  static canEditTimeline(role: UserRole): boolean {
    return this.can(role, Permission.TIMELINE_EDIT);
  }

  static canManageSeating(role: UserRole): boolean {
    return this.can(role, Permission.SEATING_MANAGE);
  }

  static isSystemAdmin(role: UserRole): boolean {
    return this.can(role, Permission.SYSTEM_ADMIN);
  }
}
