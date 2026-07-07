/**
 * ForeverVow — User Roles & Hierarchy
 * Centralized definition of all user roles within the system.
 */

export const UserRole = {
  ADMIN: "admin",
  COUPLE: "couple",
  VENDOR: "vendor",
  GUEST: "guest",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Role hierarchy (higher index = more authority) */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.GUEST]: 0,
  [UserRole.VENDOR]: 1,
  [UserRole.COUPLE]: 2,
  [UserRole.ADMIN]: 3,
};

/** User-facing metadata for each role */
export const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; description: string }> = {
  [UserRole.ADMIN]: {
    title: "Studio Headquarters Admin",
    description: "Full system access across all celebrations, tenant management, and platform configuration.",
  },
  [UserRole.COUPLE]: {
    title: "Celebration Owner (Couple)",
    description: "Full management access over their specific wedding celebration, budget, guest list, and media.",
  },
  [UserRole.VENDOR]: {
    title: "Collaborating Vendor",
    description: "Scoped access to assigned timeline events, run-sheets, and relevant celebration details.",
  },
  [UserRole.GUEST]: {
    title: "Honored Guest",
    description: "Access to view celebration details, RSVP, upload memory wall photos, and check-in on the day of.",
  },
};

/** Check if a role has equal or greater rank than a target role */
export function hasMinimumRole(userRole: UserRole, targetRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[targetRole] ?? 99);
}
