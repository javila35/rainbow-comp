import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasRole } from "@/lib/utils/auth";
import { Role } from "@/types/auth";

/**
 * Server-side role protection utility
 * Redirects to access-denied if user doesn't have required role
 */
export async function requireRole(requiredRole: Role) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }
  
  if (!hasRole(session.user.role as Role, requiredRole)) {
    redirect("/access-denied");
  }
  
  return session;
}
