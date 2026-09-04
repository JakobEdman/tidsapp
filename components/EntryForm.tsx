"use client";

import { useState } from "react";

interface EntryFormProps {
  onSubmit: (entry: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
    entry_date: string;
  }) => void;
}

export default function EntryForm({ onSubmit }: EntryFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [project, setProject] = useState("");
  const [activity, setActivity] = useState("");
  const [entryDate, setEntryDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [manualDuration, setManualDuration] = useState(false);
  const [open, setOpen] = useState(false);

  const calcDurationFromTimes = (start: string, end: string): string => {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return "";
    return (diff / 60).toFixed(1);
  };

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    if (!manualDuration && val && endTime) {
      const calc = calcDurationFromTimes(val, endTime);
      if (calc) setDuration(calc);
    }
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    if (!manualDuration && startTime && val) {
      const calc = calcDurationFromTimes(startTime, val);
      if (calc) setDuration(calc);
    }
  };

  const handleDurationChange = (val: string) => {
    setDuration(val);
    setManualDuration(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      project: project || "Övrigt",
      activity,
      start_time: startTime,
      end_time: endTime,
      duration: duration || calcDurationFromTimes(startTime, endTime),
      entry_date: entryDate || today,
    });

    setProject("");
    setActivity("");
    setEntryDate(today);
    setStartTime("");
    setEndTime("");
    setDuration("");
    setManualDuration(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-blue-600 active:text-blue-800 font-medium"
      >
        {open ? "Dölj formulär" : "Lägg till manuellt"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Datum</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Projekt</label>
            <input
              type="text"
              placeholder="t.ex. Kundnamn"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Aktivitet</label>
            <textarea
              placeholder="Vad du gjorde"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base resize-y min-h-[5rem]"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Slut</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Timmar</label>
              <input
                type="number"
                step="0.5"
                placeholder="t.ex. 2"
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 active:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-base"
          >
            Spara
          </button>
        </form>
      )}
    </div>
  );
}
