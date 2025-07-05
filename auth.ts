import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@/app/generated/prisma";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    USER: 1,
    ORGANIZER: 2,
    ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAcces(useRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.some((role) => hasRole(useRole, role));
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },
  providers: [Google],
});
