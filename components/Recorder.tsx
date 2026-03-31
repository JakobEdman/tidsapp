"use client";

import { useState, useRef } from "react";

interface RecorderProps {
  onEntryParsed: (entry: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
  }) => void;
}

export default function Recorder({ onEntryParsed }: RecorderProps) {
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
            body: JSON.stringify({ text: tData.text }),
          });
          const pData = await pRes.json();

          if (pData.parsed) {
            onEntryParsed(pData.parsed);
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
      <div className="flex gap-2">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            {processing ? "Bearbetar..." : "Spela in"}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium animate-pulse transition-colors"
          >
            Stoppa inspelning
          </button>
        )}
      </div>

      {transcript && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Transkriberat: &quot;{transcript}&quot;
        </p>
      )}
    </div>
  );
}
