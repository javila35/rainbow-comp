"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { hasRole } from "@/lib/utils/auth";
import type { Role } from "@/app/generated/prisma";

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { data: session } = useSession();

  if (!session?.user || !hasRole(session.user.role as Role, requiredRole)) {
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-600">
        You don&apos;t have permission to access this feature.
      </p>
    </div>
  );
}