"use client";

import { TimeEntry } from "@/lib/types";
import { PDFDocument, PDFFont, PDFPage, StandardFonts } from "pdf-lib";

interface PdfExportProps {
  /** Redan filtrerade poster — dashboarden äger filtret. */
  entries: TimeEntry[];
  fromDate: string;
  toDate: string;
  /** "all" eller ett projektnamn. */
  selectedProject: string;
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

/** pdf-lib:s standardfonter klarar inte alla tecken; byt ut det som saknas. */
function safeText(text: string): string {
  return (text ?? "").replace(/[–—]/g, "-").replace(/[^\x20-\xFF]/g, "?");
}

export default function PdfExport({
  entries,
  fromDate,
  toDate,
  selectedProject,
}: PdfExportProps) {
  const dateOf = (e: TimeEntry) => e.entry_date || e.created_at.slice(0, 10);
  const heltProjekt = selectedProject !== "all";

  const exportPDF = async () => {
    if (entries.length === 0) {
      alert("Inga poster i valt datumintervall.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_W = 595; // A4 stående
    const PAGE_H = 842;
    const MARGIN = 40;
    const TOP_Y = PAGE_H - MARGIN;
    const BOTTOM_Y = MARGIN + 40;

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
      page.drawText("Tidsrapport", { x: MARGIN, y, size: 22, font: fontBold });
      y -= 22;
      if (heltProjekt) {
        page.drawText(safeText(selectedProject), {
          x: MARGIN,
          y,
          size: 14,
          font: fontBold,
        });
        y -= 16;
      }
      page.drawText(`Period: ${fromDate} - ${toDate}`, {
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
      page.drawText("Timmar", { x: COL_HOURS_X, y, size: 10, font: fontBold });
      y -= 6;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_W - MARGIN, y },
        thickness: 1,
      });
      y -= 14;
    };

    const nySidaVidBehov = (hojd: number) => {
      if (y - hojd < BOTTOM_Y) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = TOP_Y;
        drawHeader();
      }
    };

    drawHeader();

    const sorterade = [...entries].sort((a, b) =>
      dateOf(a).localeCompare(dateOf(b))
    );

    const timmarPerProjekt: Record<string, number> = {};
    let totalHours = 0;

    sorterade.forEach((e) => {
      const projekt = e.project || "Övrigt";
      // Radbrytning istället för avkapning — hela aktiviteten ska med.
      const projectLines = wrapText(
        safeText(projekt),
        font,
        FONT_SIZE,
        PROJECT_W
      );
      const activityLines = wrapText(
        safeText(e.activity),
        font,
        FONT_SIZE,
        ACTIVITY_W
      );
      const time =
        e.start_time && e.end_time ? `${e.start_time}-${e.end_time}` : "-";
      const hours = parseFloat(e.duration) || 0;
      totalHours += hours;
      timmarPerProjekt[projekt] = (timmarPerProjekt[projekt] || 0) + hours;

      const rowLines = Math.max(projectLines.length, activityLines.length, 1);
      const rowHeight = rowLines * LINE_H + 4;

      nySidaVidBehov(rowHeight);

      page.drawText(dateOf(e), { x: COL_DATE_X, y, size: FONT_SIZE, font });
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
    nySidaVidBehov(30);
    page.drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: PAGE_W - MARGIN, y: y + 4 },
      thickness: 1,
    });
    page.drawText(`Antal poster: ${sorterade.length}`, {
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
    y -= 40;

    // Summering per projekt när allt skrivs ut samlat
    const projekt = Object.entries(timmarPerProjekt).sort(([, a], [, b]) => b - a);
    if (!heltProjekt && projekt.length > 1) {
      nySidaVidBehov(20);
      page.drawText("Summering per projekt:", {
        x: MARGIN,
        y,
        size: 11,
        font: fontBold,
      });
      y -= 18;
      for (const [namn, timmar] of projekt) {
        nySidaVidBehov(14);
        page.drawText(safeText(namn), { x: MARGIN, y, size: 9, font });
        page.drawText(timmar.toFixed(1) + "h", {
          x: COL_HOURS_X,
          y,
          size: 9,
          font,
        });
        y -= 14;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const del = heltProjekt
      ? selectedProject.toLowerCase().replace(/[^a-z0-9åäö]+/g, "-")
      : "alla";
    a.download = `tidsrapport-${del}-${fromDate}-till-${toDate}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="font-semibold text-base mb-2">Exportera PDF</h2>
      <p className="text-sm text-gray-500 mb-3">
        {entries.length} poster · {heltProjekt ? selectedProject : "alla projekt"}{" "}
        · {fromDate} — {toDate}
      </p>
      <button
        onClick={exportPDF}
        disabled={entries.length === 0}
        className="w-full bg-green-600 active:bg-green-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-medium transition-colors text-base"
      >
        Ladda ner PDF
      </button>
    </div>
  );
}
