"use client";

import { useState, useRef } from "react";
import { TimeEntry } from "@/lib/types";

interface EditEntryProps {
  entry: TimeEntry;
  onSave: (id: string, updates: Partial<TimeEntry>) => void;
  onCancel: () => void;
}

export default function EditEntry({ entry, onSave, onCancel }: EditEntryProps) {
  const [project, setProject] = useState(entry.project);
  const [activity, setActivity] = useState(entry.activity);
  const [startTime, setStartTime] = useState(entry.start_time);
  const [endTime, setEndTime] = useState(entry.end_time);
  const [duration, setDuration] = useState(entry.duration);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSave = () => {
    let calcDuration = duration;
    if (!calcDuration && startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const diff = eh * 60 + em - (sh * 60 + sm);
      calcDuration = (diff / 60).toFixed(1);
    }

    onSave(entry.id, {
      project: project || "Övrigt",
      activity,
      start_time: startTime,
      end_time: endTime,
      duration: calcDuration,
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
            body: JSON.stringify({ text: tData.text }),
          });
          const pData = await pRes.json();

          if (pData.parsed) {
            setProject(pData.parsed.project || project);
            setActivity(pData.parsed.activity || activity);
            setStartTime(pData.parsed.start_time || startTime);
            setEndTime(pData.parsed.end_time || endTime);
            setDuration(pData.parsed.duration || duration);
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

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Projekt</label>
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Aktivitet</label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-500">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Slut</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Timmar</label>
          <input
            type="number"
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      {/* Re-record with voice */}
      <div className="border-t pt-3">
        <p className="text-xs text-gray-500 mb-2">
          Eller spela in nytt meddelande som ers&auml;tter alla f&auml;lt:
        </p>
        {!recording ? (
          <button
            onClick={startReRecord}
            disabled={processing}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {processing ? "Bearbetar..." : "Spela in p\u00e5 nytt"}
          </button>
        ) : (
          <button
            onClick={stopReRecord}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium animate-pulse transition-colors"
          >
            Stoppa inspelning
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 border-t pt-3">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Spara
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
