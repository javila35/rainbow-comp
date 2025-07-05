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
    ADMIN: 3
  };
  
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
}


export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT instead of database sessions
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  providers: [Google],
});
