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
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Top row: logo + sign out */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Tidsapp
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-xs text-gray-500 hover:text-gray-700 border rounded-lg px-2.5 py-1"
              >
                Logga ut
              </button>
            </div>
          )}
        </div>

        {/* Bottom row: navigation tabs */}
        {user && (
          <div className="flex gap-1">
            <Link
              href="/"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tidsregistrering
            </Link>
            <Link
              href="/dashboard"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Rapport & Statistik
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
