"use client";

import { useState } from "react";
import { TimeEntry } from "@/lib/types";
import EditEntry from "./EditEntry";

interface EntryListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TimeEntry>) => void;
}

export default function EntryList({ entries, onDelete, onUpdate }: EntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        Inga tidsposter &auml;nnu. Spela in eller l&auml;gg till manuellt.
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
            className="p-4 border rounded-xl shadow-sm hover:shadow transition-shadow bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
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
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => setEditingId(entry.id)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Redigera
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
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
