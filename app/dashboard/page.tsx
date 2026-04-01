"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getEntries } from "@/lib/storage";
import { TimeEntry, User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import PdfExport from "@/components/PdfExport";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session.user) {
      router.push("/login");
      return;
    }
    setUser(session.user);
    setEntries(getEntries(session.user.id));
    setLoading(false);
  }, [router]);

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  if (loading) return <div className="p-6">Laddar...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onSignOut={handleSignOut} />
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        <Dashboard entries={entries} />
        <PdfExport entries={entries} />
      </main>
    </div>
  );
}
