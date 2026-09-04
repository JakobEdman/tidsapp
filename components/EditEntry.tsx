"use client";

import { useState, useRef } from "react";
import { TimeEntry } from "@/lib/types";
import { normalizeProject } from "@/lib/projects";

interface EditEntryProps {
  entry: TimeEntry;
  onSave: (id: string, updates: Partial<TimeEntry>) => void;
  onCancel: () => void;
  knownProjects: string[];
}

export default function EditEntry({
  entry,
  onSave,
  onCancel,
  knownProjects,
}: EditEntryProps) {
  const [project, setProject] = useState(entry.project);
  const [activity, setActivity] = useState(entry.activity);
  const [entryDate, setEntryDate] = useState(
    entry.entry_date || entry.created_at.slice(0, 10)
  );
  const [startTime, setStartTime] = useState(entry.start_time);
  const [endTime, setEndTime] = useState(entry.end_time);
  const [duration, setDuration] = useState(entry.duration);
  const [manualDuration, setManualDuration] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const handleSave = () => {
    onSave(entry.id, {
      // Skrivet för hand är avsiktligt — städa bara bort blanksteg, snäpp inte.
      project: normalizeProject(project) || "Övrigt",
      activity,
      entry_date: entryDate,
      start_time: startTime,
      end_time: endTime,
      duration: duration || calcDurationFromTimes(startTime, endTime),
    });
  };

  const startReRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setProcessing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");

          const tRes = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const tData = await tRes.json();

          if (tData.error) {
            alert("Fel: " + tData.error);
            setProcessing(false);
            return;
          }

          const pRes = await fetch("/api/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: tData.text, knownProjects }),
          });
          const pData = await pRes.json();

          if (pData.parsed) {
            setProject(pData.parsed.project || project);
            setActivity(pData.parsed.activity || activity);
            setStartTime(pData.parsed.start_time || startTime);
            setEndTime(pData.parsed.end_time || endTime);
            setDuration(pData.parsed.duration || duration);
            if (pData.parsed.entry_date) {
              setEntryDate(pData.parsed.entry_date);
            }
          }
        } catch {
          alert("Kunde inte bearbeta inspelningen");
        }
        setProcessing(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Kunde inte komma åt mikrofonen.");
    }
  };

  const stopReRecord = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-4 border-2 border-blue-300 rounded-xl bg-blue-50 space-y-3">
      <h3 className="font-semibold text-sm text-blue-800">Redigera tidspost</h3>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Datum</label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Projekt / kund
        </label>
        <input
          type="text"
          list="projektlista-redigera"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
        />
        <datalist id="projektlista-redigera">
          {knownProjects.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Aktivitet</label>
        <textarea
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white resize-y min-h-[6rem]"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Slut</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Timmar</label>
          <input
            type="number"
            step="0.5"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
          />
        </div>
      </div>

      {/* Re-record with voice */}
      <div className="border-t border-blue-200 pt-3">
        <p className="text-xs text-gray-500 mb-2">
          Eller spela in nytt meddelande som ersätter alla fält:
        </p>
        {!recording ? (
          <button
            onClick={startReRecord}
            disabled={processing}
            className="bg-orange-500 active:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {processing ? "Bearbetar..." : "Spela in på nytt"}
          </button>
        ) : (
          <button
            onClick={stopReRecord}
            className="bg-red-600 active:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse transition-colors"
          >
            Stoppa inspelning
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 border-t border-blue-200 pt-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Spara
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 active:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
