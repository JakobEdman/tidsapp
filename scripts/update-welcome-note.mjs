import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const s = createClient(url, key);

const { data, error } = await s
  .from("release_notes")
  .update({ title: "Välkommen till Tidsapp!" })
  .eq("title", "Välkommen till denna Tidsapp")
  .select();

if (error) {
  console.error("FAIL:", error);
  process.exit(1);
}
console.log("Uppdaterad:", data);
