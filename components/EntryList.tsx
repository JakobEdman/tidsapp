"use client";

import { useState } from "react";
import { TimeEntry } from "@/lib/types";
import EditEntry from "./EditEntry";

interface EntryListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void | Promise<void>;
  onUpdate: (id: string, updates: Partial<TimeEntry>) => void | Promise<void>;
}

export default function EntryList({
  entries,
  onDelete,
  onUpdate,
}: EntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">
        Inga tidsposter ännu. Spela in eller lägg till manuellt.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) =>
        editingId === entry.id ? (
          <EditEntry
            key={entry.id}
            entry={entry}
            onSave={(id, updates) => {
              onUpdate(id, updates);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={entry.id}
            className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base break-words">
                  {entry.project}
                </div>
                <div className="text-gray-600 text-sm whitespace-pre-wrap break-words">
                  {entry.activity}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {entry.entry_date || entry.created_at.slice(0, 10)}
                  {entry.start_time && entry.end_time
                    ? ` · ${entry.start_time}–${entry.end_time}`
                    : ""}
                  {entry.duration ? ` · ${entry.duration}h` : ""}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => setEditingId(entry.id)}
                  className="text-blue-600 active:text-blue-800 text-sm font-medium"
                >
                  Redigera
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-red-500 active:text-red-700 text-sm font-medium"
                >
                  Ta bort
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
