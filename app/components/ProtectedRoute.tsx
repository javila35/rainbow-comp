import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role } from "@/types/auth";
import { hasRole } from "@/lib/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole = "USER",
  fallback = <div>Access denied</div>,
}: ProtectedRouteProps) {
    const { data:session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/");
            return;
        }

        if (requiredRole && !hasRole(session.user.role, requiredRole)) {
            router.push("/access-denied")
            return;
        }
    }, [session, status, router, requiredRole]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session || (requiredRole && !hasRole(session.user.role, requiredRole))) {
        return fallback;
    }

    return <>{children}</>;
}
