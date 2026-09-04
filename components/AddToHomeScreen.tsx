"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tidsapp_a2hs_dismissed";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone, iPad, iPod (också iPad på iOS 13+ som rapporterar som Mac med touch)
  const iosUA = /iPhone|iPad|iPod/.test(ua);
  const iPadOS =
    navigator.platform === "MacIntel" &&
    typeof (navigator as Navigator & { maxTouchPoints?: number })
      .maxTouchPoints === "number" &&
    ((navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ||
      0) > 1;
  return iosUA || iPadOS;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari sätter navigator.standalone när appen körs från hemskärmen
  const navStandalone = (navigator as Navigator & { standalone?: boolean })
    .standalone;
  if (navStandalone) return true;
  // Modern way
  if (
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches
  ) {
    return true;
  }
  return false;
}

export default function AddToHomeScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIos()) return;
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    // Visa lite efter att sidan laddat så det inte stör inloggningen
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignorera
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold text-base">
              Lägg till Tidsappen på hemskärmen
            </p>
            <p className="text-sm text-gray-600">
              Få en egen ikon och fullskärmsupplevelse — som en vanlig app.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Stäng"
            className="text-gray-400 active:text-gray-700 -mt-1 -mr-1 p-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <ol className="text-sm text-gray-700 space-y-2 pl-1">
          <li className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </span>
            <span className="flex-1">
              Tryck på <strong>dela-knappen</strong>{" "}
              <svg
                className="inline align-middle"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>{" "}
              längst ner i Safari.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </span>
            <span className="flex-1">
              Bläddra och välj{" "}
              <strong>&quot;Lägg till på hemskärm&quot;</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </span>
            <span className="flex-1">
              Tryck <strong>&quot;Lägg till&quot;</strong>.
            </span>
          </li>
        </ol>

        <button
          onClick={dismiss}
          className="w-full text-sm text-gray-600 active:text-gray-900 border border-gray-300 rounded-lg py-2 font-medium"
        >
          Påminn mig inte igen
        </button>
      </div>
    </div>
  );
}
