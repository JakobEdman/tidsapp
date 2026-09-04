import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const s = createClient(url, key);

const title = "Välkommen till denna Tidsapp";
const body = `Hej och välkommen! Tidsappen är just nu i uppstartsperiod, det betyder att vi finslipar funktioner löpande och uppskattar all feedback från er testpiloter. Klicka på "Lämna feedback" längst ner på startsidan för att skicka önskemål, tankar eller rapportera fel. Vi återkommer med information när vi släpper ändringar eller justeringar som ni lyft och en guide med vad som gäller framåt.`;

// Inaktivera tidigare aktiva
await s.from("release_notes").update({ is_active: false }).eq("is_active", true);

const { data, error } = await s
  .from("release_notes")
  .insert({ title, body, is_active: true })
  .select()
  .single();

if (error) {
  console.error("FAIL:", error);
  process.exit(1);
}
console.log("Publicerad:", data);
