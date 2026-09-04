import OpenAI from "openai";
import { NextRequest } from "next/server";
import { matchProject, normalizeProject } from "@/lib/projects";

export async function POST(req: NextRequest) {
  try {
    const { text, knownProjects } = await req.json();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!text) {
      return Response.json({ error: "Ingen text skickad" }, { status: 400 });
    }

    const kanda: string[] = Array.isArray(knownProjects)
      ? knownProjects.map(normalizeProject).filter(Boolean)
      : [];

    const today = new Date().toISOString().slice(0, 10);

    // Utan den befintliga kundlistan hittar modellen på en ny stavning varje
    // gång, och samma kund hamnar på flera rader vid utskrift.
    const projektRegler = kanda.length
      ? `Personen har sedan tidigare dessa projekt/kunder:
${kanda.map((p) => `- ${p}`).join("\n")}

Regler för "project":
- Syftar personen på någon i listan ovan, returnera namnet EXAKT som det står där, teckenrätt.
- Detta gäller även om personen säger det lite annorlunda, med annan böjning eller med ett litet uttalsfel.
- Orden "projekt" och "kund" är inledningsord och ingår INTE i namnet. Säger personen "projekt Fager" är namnet "Fager".
- Bara om det är någon som verkligen inte finns i listan får du returnera ett nytt namn.
- Nämns ingen alls, returnera "Övrigt".`
      : `Regler för "project":
- Orden "projekt" och "kund" är inledningsord och ingår INTE i namnet. Säger personen "projekt Fager" är namnet "Fager".
- Nämns inget projekt eller någon kund, returnera "Övrigt".`;

    const prompt = `Extrahera tidsdata från följande svenska text. Tolka vad personen säger om sitt arbete.
Dagens datum är ${today}.

Text: "${text}"

${projektRegler}

Returnera BARA giltig JSON (inget annat) med dessa fält:
{
  "project": "projektnamn (eller 'Övrigt' om inget nämns)",
  "activity": "vad personen gjorde",
  "start_time": "HH:MM (eller tom sträng om ej nämnt)",
  "end_time": "HH:MM (eller tom sträng om ej nämnt)",
  "duration": "antal timmar som decimaltal (t.ex. '2' eller '1.5')",
  "entry_date": "YYYY-MM-DD"
}

Viktiga regler för entry_date:
- Om personen nämner ett specifikt datum (t.ex. "den 8 april", "igår", "i fredags"), beräkna rätt datum utifrån dagens datum ${today}.
- "igår" = dagen innan ${today}
- "i förrgår" = två dagar innan ${today}
- "i måndags", "i tisdags" etc = senaste sådana veckodagen innan idag
- Om inget datum nämns, använd dagens datum ${today}.

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

    // Skyddsnät: modellen följer inte alltid listan. Snäpp mot befintlig kund
    // så att en variantstavning inte blir en ny rad vid utskrift.
    if (parsed.project) {
      parsed.project = matchProject(String(parsed.project), kanda);
    }

    return Response.json({ parsed });
  } catch (error) {
    console.error("Parse error:", error);
    return Response.json(
      { error: "Kunde inte tolka text" },
      { status: 500 }
    );
  }
}
