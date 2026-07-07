import { describe, it, expect } from "vitest";
import { PermissionService } from "./PermissionService";
import { UserRole, Permission } from "@/config";

describe("PermissionService", () => {
  describe("Admin Role", () => {
    it("should grant all permissions to ADMIN role", () => {
      expect(PermissionService.can(UserRole.ADMIN, Permission.WEDDING_CREATE)).toBe(true);
      expect(PermissionService.can(UserRole.ADMIN, Permission.WEDDING_DELETE)).toBe(true);
      expect(PermissionService.can(UserRole.ADMIN, Permission.SYSTEM_ADMIN)).toBe(true);
      expect(PermissionService.can(UserRole.ADMIN, Permission.ANALYTICS_VIEW)).toBe(true);
      expect(PermissionService.isSystemAdmin(UserRole.ADMIN)).toBe(true);
    });
  });

  describe("Couple Role", () => {
    it("should grant celebration management permissions to COUPLE", () => {
      expect(PermissionService.canEditWedding(UserRole.COUPLE)).toBe(true);
      expect(PermissionService.canPublishWedding(UserRole.COUPLE)).toBe(true);
      expect(PermissionService.canManageGuests(UserRole.COUPLE)).toBe(true);
      expect(PermissionService.canModerateContent(UserRole.COUPLE)).toBe(true);
      expect(PermissionService.canEditBudget(UserRole.COUPLE)).toBe(true);
      expect(PermissionService.canSendBroadcasts(UserRole.COUPLE)).toBe(true);
    });

    it("should deny system admin and wedding deletion permissions to COUPLE", () => {
      expect(PermissionService.canDeleteWedding(UserRole.COUPLE)).toBe(false);
      expect(PermissionService.isSystemAdmin(UserRole.COUPLE)).toBe(false);
      expect(PermissionService.can(UserRole.COUPLE, Permission.AUDIT_LOG_VIEW)).toBe(false);
    });
  });

  describe("Vendor Role", () => {
    it("should grant collaboration permissions to VENDOR", () => {
      expect(PermissionService.canEditTimeline(UserRole.VENDOR)).toBe(true);
      expect(PermissionService.canUploadPhotos(UserRole.VENDOR)).toBe(true);
      expect(PermissionService.can(UserRole.VENDOR, Permission.GUEST_VIEW)).toBe(true);
    });

    it("should deny budget editing, broadcasting, and seating management to VENDOR", () => {
      expect(PermissionService.canEditBudget(UserRole.VENDOR)).toBe(false);
      expect(PermissionService.canSendBroadcasts(UserRole.VENDOR)).toBe(false);
      expect(PermissionService.canManageSeating(UserRole.VENDOR)).toBe(false);
      expect(PermissionService.canPublishWedding(UserRole.VENDOR)).toBe(false);
    });
  });

  describe("Guest Role", () => {
    it("should grant RSVP and photo upload permissions to GUEST", () => {
      expect(PermissionService.can(UserRole.GUEST, Permission.RSVP_SUBMIT)).toBe(true);
      expect(PermissionService.canUploadPhotos(UserRole.GUEST)).toBe(true);
    });

    it("should deny all management and viewing permissions to GUEST", () => {
      expect(PermissionService.canModerateContent(UserRole.GUEST)).toBe(false);
      expect(PermissionService.canManageGuests(UserRole.GUEST)).toBe(false);
      expect(PermissionService.canEditTimeline(UserRole.GUEST)).toBe(false);
      expect(PermissionService.canViewAnalytics(UserRole.GUEST)).toBe(false);
    });
  });

  describe("canAll and canAny helpers", () => {
    it("should correctly evaluate canAll", () => {
      expect(
        PermissionService.canAll(UserRole.COUPLE, [Permission.WEDDING_EDIT, Permission.GUEST_MANAGE])
      ).toBe(true);
      expect(
        PermissionService.canAll(UserRole.COUPLE, [Permission.WEDDING_EDIT, Permission.SYSTEM_ADMIN])
      ).toBe(false);
    });

    it("should correctly evaluate canAny", () => {
      expect(
        PermissionService.canAny(UserRole.VENDOR, [Permission.BUDGET_EDIT, Permission.TIMELINE_EDIT])
      ).toBe(true);
      expect(
        PermissionService.canAny(UserRole.GUEST, [Permission.BUDGET_EDIT, Permission.TIMELINE_EDIT])
      ).toBe(false);
    });
  });
});
