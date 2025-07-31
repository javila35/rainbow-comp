import Link from "next/link";
import { auth } from "@/auth";
import { hasRole } from "@/lib/utils/auth";
import { HEADING_H4, NAV_LINK, NAV_LINK_ACTIVE } from "@/lib/utils/styles";

export default async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user && hasRole(session.user.role, "ADMIN");
  const canAccessManagement = session?.user && hasRole(session.user.role, "ORGANIZER");

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className={`text-xl ${HEADING_H4} hover:text-gray-600 transition-colors`}
            >
              Rainbow Comp
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={NAV_LINK}
            >
              Home
            </Link>
            {canAccessManagement && (
              <>
                <Link
                  href="/players"
                  className={NAV_LINK}
                >
                  Players
                </Link>
                <Link
                  href="/seasons"
                  className={NAV_LINK}
                >
                  Seasons
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/admin/users"
                className={NAV_LINK_ACTIVE}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
