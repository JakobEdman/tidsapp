"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/lib/types";

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
}

export default function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Tidsapp AI
          </Link>
          {user && (
            <div className="flex gap-4 text-sm">
              <Link
                href="/"
                className={
                  pathname === "/"
                    ? "text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }
              >
                Tidsregistrering
              </Link>
              <Link
                href="/dashboard"
                className={
                  pathname === "/dashboard"
                    ? "text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            {user.is_pro && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                PRO
              </span>
            )}
            <button
              onClick={onSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1"
            >
              Logga ut
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
