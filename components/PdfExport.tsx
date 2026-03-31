"use client";

import { TimeEntry } from "@/lib/types";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface PdfExportProps {
  entries: TimeEntry[];
}

export default function PdfExport({ entries }: PdfExportProps) {
  const exportPDF = async () => {
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
    y -= 15;
    page.drawText(new Date().toLocaleDateString("sv-SE"), {
      x: 50,
      y,
      size: 10,
      font,
    });
    y -= 30;

    // Header
    page.drawText("Projekt", { x: 50, y, size: 10, font: fontBold });
    page.drawText("Aktivitet", { x: 160, y, size: 10, font: fontBold });
    page.drawText("Tid", { x: 340, y, size: 10, font: fontBold });
    page.drawText("Timmar", { x: 460, y, size: 10, font: fontBold });
    y -= 5;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 550, y },
      thickness: 1,
    });
    y -= 15;

    // Entries
    let totalHours = 0;
    entries.forEach((e) => {
      addNewPageIfNeeded();

      const project =
        e.project.length > 15 ? e.project.substring(0, 15) + "..." : e.project;
      const activity =
        e.activity.length > 25
          ? e.activity.substring(0, 25) + "..."
          : e.activity;
      const time =
        e.start_time && e.end_time ? `${e.start_time}-${e.end_time}` : "-";
      const hours = parseFloat(e.duration) || 0;
      totalHours += hours;

      page.drawText(project, { x: 50, y, size: 9, font });
      page.drawText(activity, { x: 160, y, size: 9, font });
      page.drawText(time, { x: 340, y, size: 9, font });
      page.drawText(hours.toFixed(1) + "h", { x: 460, y, size: 9, font });
      y -= 18;
    });

    // Total
    y -= 10;
    addNewPageIfNeeded();
    page.drawLine({
      start: { x: 50, y: y + 5 },
      end: { x: 550, y: y + 5 },
      thickness: 1,
    });
    page.drawText("Totalt:", { x: 340, y: y - 10, size: 12, font: fontBold });
    page.drawText(totalHours.toFixed(1) + "h", {
      x: 460,
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
    a.download = `tidsrapport-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportPDF}
      disabled={entries.length === 0}
      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Exportera PDF
    </button>
  );
}
