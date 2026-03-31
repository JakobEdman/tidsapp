"use client";

import { TimeEntry } from "@/lib/types";

interface EntryListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
}

export default function EntryList({ entries, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        Inga tidsposter ännu. Spela in eller lägg till manuellt.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-4 border rounded-xl shadow-sm hover:shadow transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-lg">{entry.project}</div>
              <div className="text-gray-700">{entry.activity}</div>
              <div className="text-sm text-gray-500 mt-1">
                {entry.start_time && entry.end_time
                  ? `${entry.start_time} - ${entry.end_time}`
                  : ""}
                {entry.duration && ` (${entry.duration}h)`}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(entry.created_at).toLocaleDateString("sv-SE")}
              </div>
            </div>
            <button
              onClick={() => onDelete(entry.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Ta bort
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
