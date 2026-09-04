"use client";

import { useState } from "react";
import Link from "next/link";

export default function InstructionsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-blue-600 active:text-blue-800 font-medium"
      >
        <span className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center text-xs font-bold leading-none">
          i
        </span>
        Instruktioner
      </button>

      {open && (
        <div className="mt-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="font-semibold text-base">Så här fungerar det:</h2>
          <div className="space-y-2.5">
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Registrera en tidsrapportering
                </span>{" "}
                — Tryck &quot;Spela in&quot; och säg t.ex. &quot;Jobbade med
                hemsidan från 9 till 11&quot;. Om du rapporterar för annat
                datum, nämn detta i meddelandet.{" "}
                <span className="text-gray-500">
                  Obs! All information går att redigera i efterhand.
                </span>
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Tidsrapportering tolkas
                </span>{" "}
                — Post skapas automatiskt och registreras.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Rapporteringar loggas
                </span>{" "}
                — Alla poster finns tillgängliga under
                &quot;Administration&quot;.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Se samlad data och exportera rapporter
                </span>{" "}
                — Under &quot;Administration&quot; kan du filtrera och ladda
                ner PDF-rapporter.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">Tips:</span> Appen
              går lika bra att använda i webbläsaren på datorn. Använder du
              iPhone, spara gärna appen på hemskärmen för enklare användning
              i framtiden.
            </p>
            <p className="text-sm text-gray-500">
              Läs mer om alla funktioner och hur du sparar appen på
              hemskärmen under{" "}
              <Link
                href="/information"
                className="text-blue-600 font-medium active:text-blue-800"
              >
                Information
              </Link>{" "}
              i menyn vid ditt namn.
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-xs text-gray-500 active:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5"
          >
            Stäng
          </button>
        </div>
      )}
    </div>
  );
}
