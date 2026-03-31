"use client";

import { useState } from "react";

interface EntryFormProps {
  onSubmit: (entry: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
  }) => void;
}

export default function EntryForm({ onSubmit }: EntryFormProps) {
  const [project, setProject] = useState("");
  const [activity, setActivity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let calcDuration = duration;
    if (!calcDuration && startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const diff = eh * 60 + em - (sh * 60 + sm);
      calcDuration = (diff / 60).toFixed(1);
    }

    onSubmit({
      project: project || "Övrigt",
      activity,
      start_time: startTime,
      end_time: endTime,
      duration: calcDuration,
    });

    setProject("");
    setActivity("");
    setStartTime("");
    setEndTime("");
    setDuration("");
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {open ? "Dölj formulär" : "Lägg till manuellt"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Projekt"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Aktivitet"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.5"
              placeholder="Timmar"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Spara
          </button>
        </form>
      )}
    </div>
  );
}
