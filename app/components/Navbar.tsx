import Link from "next/link";
import { auth } from "@/auth";
import { hasRole } from "@/lib/utils/auth";

export default async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user && hasRole(session.user.role, "JOE");
  const canAccessManagement = session?.user && hasRole(session.user.role, "ORGANIZER");

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold font-[family-name:var(--font-geist-sans)] text-[#333333] hover:text-gray-600 transition-colors"
            >
              Rainbow Comp
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="font-[family-name:var(--font-geist-sans)] text-[#333333] hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
            {canAccessManagement && (
              <>
                <Link
                  href="/players"
                  className="font-[family-name:var(--font-geist-sans)] text-[#333333] hover:text-gray-600 transition-colors"
                >
                  Players
                </Link>
                <Link
                  href="/seasons"
                  className="font-[family-name:var(--font-geist-sans)] text-[#333333] hover:text-gray-600 transition-colors"
                >
                  Seasons
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/admin/users"
                className="font-[family-name:var(--font-geist-sans)] text-[#333333] hover:text-gray-600 transition-colors bg-purple-100 px-3 py-1 rounded-md border border-purple-200 hover:bg-purple-200"
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
