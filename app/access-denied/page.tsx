import Link from "next/link";
import { GLASSY_CONTAINER_CLASSES, GLASSY_BUTTON_CLASSES } from "@/lib/utils/styles";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center -mt-16">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className={`${GLASSY_CONTAINER_CLASSES} text-center`}>
          <div className="mx-auto h-24 w-24 text-red-500 mb-6">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-geist-sans)] text-[#333333]">
            Access Denied
          </h2>
          <p className="mb-2 text-sm text-gray-700 font-medium">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-gray-700 font-medium">
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className={GLASSY_BUTTON_CLASSES}
          >
            Go to Home
          </Link>
          
          <Link
            href="/api/auth/signin"
            className={`${GLASSY_BUTTON_CLASSES} bg-white/30 hover:bg-white/40`}
          >
            Sign in with different account
          </Link>
        </div>
      </div>
    </div>
  );
}
