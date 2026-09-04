"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/lib/types";

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
  onOpenAccount?: () => void;
}

export default function Navbar({ user, onSignOut, onOpenAccount }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">Tidsapp</span>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Beta
            </span>
          </Link>
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 active:bg-gray-50"
              >
                {firstName}
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                  {onOpenAccount && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAccount();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                    >
                      Mitt konto
                    </button>
                  )}
                  <Link
                    href="/information"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                  >
                    Information
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 active:bg-gray-50"
                  >
                    Logga ut
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="flex gap-2">
            <Link
              href="/"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 active:bg-gray-200"
              }`}
            >
              Tidsregistrering
            </Link>
            <Link
              href="/dashboard"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 active:bg-gray-200"
              }`}
            >
              Administration
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
