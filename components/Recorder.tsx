"use client";

import { useState, useRef } from "react";

interface RecorderProps {
  onEntryParsed: (entry: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
    entry_date: string;
  }) => void;
  knownProjects: string[];
}

export default function Recorder({
  onEntryParsed,
  knownProjects,
}: RecorderProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
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
            setTranscript("Fel: " + tData.error);
            setProcessing(false);
            return;
          }

          setTranscript(tData.text);

          const pRes = await fetch("/api/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: tData.text, knownProjects }),
          });
          const pData = await pRes.json();

          if (pData.parsed) {
            onEntryParsed({
              project: pData.parsed.project || "Övrigt",
              activity: pData.parsed.activity || "",
              start_time: pData.parsed.start_time || "",
              end_time: pData.parsed.end_time || "",
              duration: pData.parsed.duration || "",
              entry_date:
                pData.parsed.entry_date ||
                new Date().toISOString().slice(0, 10),
            });
          }
        } catch {
          setTranscript("Kunde inte bearbeta inspelningen");
        }
        setProcessing(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Kunde inte komma åt mikrofonen. Kontrollera behörigheter.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={processing}
            className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-medium transition-colors text-base"
          >
            {processing ? "Bearbetar..." : "Spela in"}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full bg-red-600 active:bg-red-700 text-white px-5 py-3 rounded-lg font-medium animate-pulse transition-colors text-base"
          >
            Stoppa inspelning
          </button>
        )}
      </div>

      {transcript && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Transkriberat: &quot;{transcript}&quot;
        </p>
      )}
    </div>
  );
}
