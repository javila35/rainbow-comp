import { Role } from "@/types/auth";

/**
 * Check if a user has the required role based on role hierarchy
 * This function is safe to use on both client and server
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    USER: 1,
    ORGANIZER: 2,
    JOE: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
