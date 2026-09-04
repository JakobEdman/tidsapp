"use client";

import { useState } from "react";
import { TimeEntry } from "@/lib/types";
import { PDFDocument, PDFFont, PDFPage, StandardFonts } from "pdf-lib";

interface PdfExportProps {
  entries: TimeEntry[];
}

// Bryt text i flera rader så att varje rad ryms inom maxWidth.
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  if (!text) return [""];
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // Om ett enskilt ord är längre än maxWidth, bryt det hårt tecken för tecken.
        if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
          let chunk = "";
          for (const ch of word) {
            if (
              font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth ||
              !chunk
            ) {
              chunk += ch;
            } else {
              lines.push(chunk);
              chunk = ch;
            }
          }
          current = chunk;
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

export default function PdfExport({ entries }: PdfExportProps) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);

  const dateOf = (e: TimeEntry) => e.entry_date || e.created_at.slice(0, 10);

  const filteredEntries = entries.filter((e) => {
    const d = dateOf(e);
    return d >= fromDate && d <= toDate;
  });

  const exportPDF = async () => {
    if (filteredEntries.length === 0) {
      alert("Inga poster i valt datumintervall.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Sidlayout
    const PAGE_W = 595; // A4 portrait
    const PAGE_H = 842;
    const MARGIN = 40;
    const TOP_Y = PAGE_H - MARGIN;
    const BOTTOM_Y = MARGIN + 40;

    // Kolumner
    const COL_DATE_X = MARGIN;
    const COL_PROJECT_X = MARGIN + 70;
    const COL_ACTIVITY_X = MARGIN + 175;
    const COL_TIME_X = MARGIN + 380;
    const COL_HOURS_X = MARGIN + 460;

    const PROJECT_W = COL_ACTIVITY_X - COL_PROJECT_X - 8;
    const ACTIVITY_W = COL_TIME_X - COL_ACTIVITY_X - 8;

    const FONT_SIZE = 9;
    const LINE_H = 11;

    let page: PDFPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = TOP_Y;

    const drawHeader = () => {
      page.drawText("Tidsrapport", {
        x: MARGIN,
        y,
        size: 22,
        font: fontBold,
      });
      y -= 22;
      page.drawText(`Period: ${fromDate} – ${toDate}`, {
        x: MARGIN,
        y,
        size: 10,
        font,
      });
      y -= 12;
      page.drawText(`Skapad: ${new Date().toLocaleDateString("sv-SE")}`, {
        x: MARGIN,
        y,
        size: 10,
        font,
      });
      y -= 22;

      page.drawText("Datum", { x: COL_DATE_X, y, size: 10, font: fontBold });
      page.drawText("Projekt", {
        x: COL_PROJECT_X,
        y,
        size: 10,
        font: fontBold,
      });
      page.drawText("Aktivitet", {
        x: COL_ACTIVITY_X,
        y,
        size: 10,
        font: fontBold,
      });
      page.drawText("Tid", { x: COL_TIME_X, y, size: 10, font: fontBold });
      page.drawText("Timmar", {
        x: COL_HOURS_X,
        y,
        size: 10,
        font: fontBold,
      });
      y -= 6;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_W - MARGIN, y },
        thickness: 1,
      });
      y -= 14;
    };

    drawHeader();

    let totalHours = 0;
    filteredEntries.forEach((e) => {
      const date = dateOf(e);
      const projectLines = wrapText(e.project, font, FONT_SIZE, PROJECT_W);
      const activityLines = wrapText(e.activity, font, FONT_SIZE, ACTIVITY_W);
      const time =
        e.start_time && e.end_time ? `${e.start_time}–${e.end_time}` : "-";
      const hours = parseFloat(e.duration) || 0;
      totalHours += hours;

      const rowLines = Math.max(projectLines.length, activityLines.length, 1);
      const rowHeight = rowLines * LINE_H + 4;

      // Sidbrytning om raden inte ryms
      if (y - rowHeight < BOTTOM_Y) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = TOP_Y;
        drawHeader();
      }

      page.drawText(date, { x: COL_DATE_X, y, size: FONT_SIZE, font });
      projectLines.forEach((line, i) => {
        page.drawText(line, {
          x: COL_PROJECT_X,
          y: y - i * LINE_H,
          size: FONT_SIZE,
          font,
        });
      });
      activityLines.forEach((line, i) => {
        page.drawText(line, {
          x: COL_ACTIVITY_X,
          y: y - i * LINE_H,
          size: FONT_SIZE,
          font,
        });
      });
      page.drawText(time, { x: COL_TIME_X, y, size: FONT_SIZE, font });
      page.drawText(hours.toFixed(1) + "h", {
        x: COL_HOURS_X,
        y,
        size: FONT_SIZE,
        font,
      });

      y -= rowHeight;
    });

    // Summa
    if (y - 30 < BOTTOM_Y) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = TOP_Y;
    }
    page.drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: PAGE_W - MARGIN, y: y + 4 },
      thickness: 1,
    });
    page.drawText(`Antal poster: ${filteredEntries.length}`, {
      x: MARGIN,
      y: y - 10,
      size: 10,
      font,
    });
    page.drawText("Totalt:", {
      x: COL_TIME_X,
      y: y - 10,
      size: 12,
      font: fontBold,
    });
    page.drawText(totalHours.toFixed(1) + "h", {
      x: COL_HOURS_X,
      y: y - 10,
      size: 12,
      font: fontBold,
    });

    // Ladda ner
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
