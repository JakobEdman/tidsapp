"use client";

import { useState } from "react";
import { TimeEntry } from "@/lib/types";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface PdfExportProps {
  entries: TimeEntry[];
}

export default function PdfExport({ entries }: PdfExportProps) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);

  const filteredEntries = entries.filter((e) => {
    const entryDate = e.created_at.slice(0, 10);
    return entryDate >= fromDate && entryDate <= toDate;
  });

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

    // Title
    page.drawText("Tidsrapport", { x: 50, y, size: 22, font: fontBold });
    y -= 20;
    page.drawText(`Period: ${fromDate} - ${toDate}`, {
      x: 50,
      y,
      size: 10,
      font,
    });
    y -= 10;
    page.drawText(`Skapad: ${new Date().toLocaleDateString("sv-SE")}`, {
      x: 50,
      y,
      size: 10,
      font,
    });
    y -= 25;

    // Header
    page.drawText("Datum", { x: 50, y, size: 10, font: fontBold });
    page.drawText("Projekt", { x: 120, y, size: 10, font: fontBold });
    page.drawText("Aktivitet", { x: 220, y, size: 10, font: fontBold });
    page.drawText("Tid", { x: 380, y, size: 10, font: fontBold });
    page.drawText("Timmar", { x: 470, y, size: 10, font: fontBold });
    y -= 5;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 550, y },
      thickness: 1,
    });
    y -= 15;

    // Entries
    let totalHours = 0;
    filteredEntries.forEach((e) => {
      addNewPageIfNeeded();

      const date = e.created_at.slice(0, 10);
      const project =
        e.project.length > 12 ? e.project.substring(0, 12) + ".." : e.project;
      const activity =
        e.activity.length > 22
          ? e.activity.substring(0, 22) + ".."
          : e.activity;
      const time =
        e.start_time && e.end_time ? `${e.start_time}-${e.end_time}` : "-";
      const hours = parseFloat(e.duration) || 0;
      totalHours += hours;

      page.drawText(date, { x: 50, y, size: 8, font });
      page.drawText(project, { x: 120, y, size: 8, font });
      page.drawText(activity, { x: 220, y, size: 8, font });
      page.drawText(time, { x: 380, y, size: 8, font });
      page.drawText(hours.toFixed(1) + "h", { x: 470, y, size: 8, font });
      y -= 16;
    });

    // Total
    y -= 10;
    addNewPageIfNeeded();
    page.drawLine({
      start: { x: 50, y: y + 5 },
      end: { x: 550, y: y + 5 },
      thickness: 1,
    });
    page.drawText(`Antal poster: ${filteredEntries.length}`, {
      x: 50,
      y: y - 10,
      size: 10,
      font,
    });
    page.drawText("Totalt:", { x: 380, y: y - 10, size: 12, font: fontBold });
    page.drawText(totalHours.toFixed(1) + "h", {
      x: 470,
      y: y - 10,
      size: 12,
      font: fontBold,
    });

    // Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tidsrapport-${fromDate}-till-${toDate}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-5 rounded-xl border space-y-4">
      <h2 className="font-semibold">Exportera tidsrapport (PDF)</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Fr&aring;n datum</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Till datum</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {filteredEntries.length} poster i vald period
        </span>
        <button
          onClick={exportPDF}
          disabled={filteredEntries.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Ladda ner PDF
        </button>
      </div>
    </div>
  );
}
