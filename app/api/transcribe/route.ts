import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "Ingen fil skickad" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "sv",
    });

    return Response.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return Response.json(
      { error: "Kunde inte transkribera ljud" },
      { status: 500 }
    );
  }
}
