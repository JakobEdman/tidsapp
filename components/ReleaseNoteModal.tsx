"use client";

import { useEffect, useState } from "react";
import { getLatestActiveReleaseNote, ReleaseNote } from "@/lib/feedback";
import { User } from "@/lib/types";

const STORAGE_KEY_PREFIX = "tidsapp_release_seen_";

interface Props {
  user: User | null;
}

export default function ReleaseNoteModal({ user }: Props) {
  const [note, setNote] = useState<ReleaseNote | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const latest = await getLatestActiveReleaseNote();
      if (cancelled || !latest) return;

      const key = `${STORAGE_KEY_PREFIX}${user.id}_${latest.id}`;
      try {
        if (localStorage.getItem(key)) return;
      } catch {
        return;
      }
      setNote(latest);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const dismiss = () => {
    if (!note || !user) return;
    const key = `${STORAGE_KEY_PREFIX}${user.id}_${note.id}`;
    try {
      localStorage.setItem(key, "1");
    } catch {
      // ignorera
    }
    setNote(null);
  };

  if (!note) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 space-y-4"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">
              Nytt i Tidsappen
            </div>
            <h3 className="font-semibold text-lg leading-snug">{note.title}</h3>
          </div>
        </div>

        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {note.body}
        </div>

        <button
          onClick={dismiss}
          className="w-full bg-blue-600 active:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-base"
        >
          Okej, läst
        </button>
      </div>
    </div>
  );
}
