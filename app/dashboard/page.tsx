"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getEntries } from "@/lib/storage";
import { TimeEntry, User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AccountModal from "@/components/AccountModal";
import FeedbackButton from "@/components/FeedbackButton";
import PdfExport from "@/components/PdfExport";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccount, setShowAccount] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [selectedProject, setSelectedProject] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      const session = getSession();
      if (!session.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      const data = await getEntries(session.user.id);
      setEntries(data);
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  const allProjects = [
    ...new Set(entries.map((e) => e.project || "Övrigt")),
  ].sort();

  // Use entry_date for filtering (fallback to created_at for old entries)
  const filteredEntries = entries.filter((e) => {
    const entryDate = e.entry_date || e.created_at.slice(0, 10);
    const dateMatch = entryDate >= fromDate && entryDate <= toDate;
    const projectMatch =
      selectedProject === "all" || (e.project || "Övrigt") === selectedProject;
    return dateMatch && projectMatch;
  });

  const totalHours = filteredEntries.reduce((sum, e) => {
    const h = parseFloat(e.duration);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const hoursPerProject: Record<string, number> = {};
  filteredEntries.forEach((e) => {
    const h = parseFloat(e.duration) || 0;
    const proj = e.project || "Övrigt";
    hoursPerProject[proj] = (hoursPerProject[proj] || 0) + h;
  });

  const maxHours = Math.max(...Object.values(hoursPerProject), 1);


  if (loading) return <div className="p-6 text-center">Laddar...</div>;
  if (!user) return null;

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        onOpenAccount={() => setShowAccount(true)}
      />
      <main className="px-4 pt-5 pb-8 space-y-5 max-w-lg mx-auto">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="font-semibold text-base">Filter</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Från datum
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Till datum
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Kund / Projekt
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
            >
              <option value="all">Alla projekt</option>
              {allProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-semibold text-base">Statistik</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-xs text-gray-500">Totala timmar</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {totalHours.toFixed(1)}h
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-xs text-gray-500">Antal poster</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {filteredEntries.length}
              </div>
            </div>
          </div>

          {Object.keys(hoursPerProject).length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">
                Timmar per projekt
              </h3>
              <div className="space-y-2">
                {Object.entries(hoursPerProject)
                  .sort(([, a], [, b]) => b - a)
                  .map(([project, hours]) => (
                    <div key={project}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate mr-2">{project}</span>
                        <span className="font-medium shrink-0">
                          {hours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(hours / maxHours) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Entries list */}
        {filteredEntries.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-semibold text-base">
              Poster i vald period ({filteredEntries.length})
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {[...filteredEntries]
                .sort((a, b) => {
                  const da = a.entry_date || a.created_at.slice(0, 10);
                  const db = b.entry_date || b.created_at.slice(0, 10);
                  return da.localeCompare(db);
                })
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-400 mr-2">
                        {e.entry_date || e.created_at.slice(0, 10)}
                      </span>
                      <span className="font-medium">{e.project}</span>
                      {e.activity && (
                        <span className="text-gray-500 ml-1">
                          — {e.activity}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-blue-600 shrink-0 ml-2">
                      {parseFloat(e.duration)
                        ? parseFloat(e.duration).toFixed(1) + "h"
                        : "-"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <PdfExport
          entries={filteredEntries}
          fromDate={fromDate}
          toDate={toDate}
          selectedProject={selectedProject}
        />

        <FeedbackButton user={user} />
      </main>

      {showAccount && user && (
        <AccountModal
          user={user}
          onClose={() => setShowAccount(false)}
          onUpdated={(updated) => {
            setUser(updated);
            setShowAccount(false);
          }}
        />
      )}
    </div>
  );
}
