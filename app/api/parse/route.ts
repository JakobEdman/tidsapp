import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!text) {
      return Response.json({ error: "Ingen text skickad" }, { status: 400 });
    }

    const prompt = `Extrahera tidsdata från följande svenska text. Tolka vad personen säger om sitt arbete.

Text: "${text}"

Returnera BARA giltig JSON (inget annat) med dessa fält:
{
  "project": "projektnamn (eller 'Övrigt' om inget nämns)",
  "activity": "vad personen gjorde",
  "start_time": "HH:MM (eller tom sträng om ej nämnt)",
  "end_time": "HH:MM (eller tom sträng om ej nämnt)",
  "duration": "antal timmar som decimaltal (t.ex. '2' eller '1.5')"
}

Om start- och sluttid anges men inte duration, beräkna duration.
Om bara duration anges, lämna start_time och end_time tomma.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message.content ?? "{}";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return Response.json({ parsed });
  } catch (error) {
    console.error("Parse error:", error);
    return Response.json(
      { error: "Kunde inte tolka text" },
      { status: 500 }
    );
  }
}
