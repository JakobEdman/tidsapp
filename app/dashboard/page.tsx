"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getEntries } from "@/lib/storage";
import { TimeEntry, User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AccountModal from "@/components/AccountModal";
import FeedbackButton from "@/components/FeedbackButton";
import { PDFDocument, StandardFonts } from "pdf-lib";

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

  const exportPDF = async () => {
    if (filteredEntries.length === 0) {
      alert("Inga poster i valt datumintervall.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([600, 800]);
    let y = 750;

    const addNewPageIfNeeded = () => {
      if (y < 80) {
        page = pdfDoc.addPage([600, 800]);
        y = 750;
      }
    };

    page.drawText("Tidsrapport", { x: 50, y, size: 22, font: fontBold });
    y -= 22;
    page.drawText(`Period: ${fromDate} - ${toDate}`, {
      x: 50,
      y,
      size: 10,
      font,
    });
    y -= 14;
    if (selectedProject !== "all") {
      page.drawText(`Kund/Projekt: ${selectedProject}`, {
        x: 50,
        y,
        size: 10,
        font,
      });
      y -= 14;
    }
    page.drawText(`Skapad: ${new Date().toLocaleDateString("sv-SE")}`, {
      x: 50,
      y,
      size: 10,
      font,
    });
    y -= 25;

    page.drawText("Datum", { x: 50, y, size: 10, font: fontBold });
    page.drawText("Projekt", { x: 120, y, size: 10, font: fontBold });
    page.drawText("Aktivitet", { x: 230, y, size: 10, font: fontBold });
    page.drawText("Tid", { x: 400, y, size: 10, font: fontBold });
    page.drawText("Timmar", { x: 490, y, size: 10, font: fontBold });
    y -= 5;
    page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });
    y -= 15;

    const sorted = [...filteredEntries].sort((a, b) => {
      const da = a.entry_date || a.created_at.slice(0, 10);
      const db = b.entry_date || b.created_at.slice(0, 10);
      return da.localeCompare(db);
    });

    let pdfTotalHours = 0;
    sorted.forEach((e) => {
      addNewPageIfNeeded();

      const date = e.entry_date || e.created_at.slice(0, 10);
      const project =
        (e.project || "Övrigt").length > 14
          ? (e.project || "Övrigt").substring(0, 14) + ".."
          : e.project || "Övrigt";
      const activity =
        (e.activity || "").length > 22
          ? (e.activity || "").substring(0, 22) + ".."
          : e.activity || "";
      const time =
        e.start_time && e.end_time ? `${e.start_time}-${e.end_time}` : "-";
      const hours = parseFloat(e.duration) || 0;
      pdfTotalHours += hours;

      page.drawText(date, { x: 50, y, size: 8, font });
      page.drawText(project, { x: 120, y, size: 8, font });
      page.drawText(activity, { x: 230, y, size: 8, font });
      page.drawText(time, { x: 400, y, size: 8, font });
      page.drawText(hours.toFixed(1) + "h", { x: 490, y, size: 8, font });
      y -= 16;
    });

    y -= 10;
    addNewPageIfNeeded();
    page.drawLine({
      start: { x: 50, y: y + 5 },
      end: { x: 550, y: y + 5 },
      thickness: 1,
    });
    page.drawText(`Antal poster: ${sorted.length}`, {
      x: 50,
      y: y - 10,
      size: 10,
      font,
    });
    page.drawText("Totalt:", {
      x: 400,
      y: y - 10,
      size: 12,
      font: fontBold,
    });
    page.drawText(pdfTotalHours.toFixed(1) + "h", {
      x: 490,
      y: y - 10,
      size: 12,
      font: fontBold,
    });

    if (selectedProject === "all" && Object.keys(hoursPerProject).length > 1) {
      y -= 40;
      addNewPageIfNeeded();
      page.drawText("Summering per projekt:", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
      });
      y -= 18;
      Object.entries(hoursPerProject)
        .sort(([, a], [, b]) => b - a)
        .forEach(([proj, hrs]) => {
          addNewPageIfNeeded();
          page.drawText(proj, { x: 50, y, size: 9, font });
          page.drawText(hrs.toFixed(1) + "h", { x: 490, y, size: 9, font });
          y -= 14;
        });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix = selectedProject !== "all" ? `-${selectedProject}` : "";
    a.download = `tidsrapport-${fromDate}-till-${toDate}${suffix}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

        {/* PDF Export */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-base mb-2">Exportera PDF</h2>
          <p className="text-sm text-gray-500 mb-3">
            {filteredEntries.length} poster ·{" "}
            {selectedProject !== "all" ? selectedProject : "alla projekt"} ·{" "}
            {fromDate} — {toDate}
          </p>
          <button
            onClick={exportPDF}
            disabled={filteredEntries.length === 0}
            className="w-full bg-green-600 active:bg-green-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-medium transition-colors text-base"
          >
            Ladda ner PDF
          </button>
        </div>

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
