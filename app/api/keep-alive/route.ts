import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// Endpoint som Vercel Cron pingar för att hålla Supabase-databasen vaken.
// Free-tier pausar databasen efter 7 dagars inaktivitet — en trivial läsning
// räknas som aktivitet och nollställer räknaren.
export async function GET(req: NextRequest) {
  // Skydda mot att vem som helst kan trigga endpointen — Vercel Cron
  // skickar med en Authorization-header som matchar CRON_SECRET i env.
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json(
      { ok: false, error: "Supabase env saknas" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, key);
    // Trivial läsning som räknas som aktivitet men inte belastar systemet
    const { error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("keep-alive supabase error:", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("keep-alive error:", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
