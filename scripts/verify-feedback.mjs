import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const s = createClient(url, key);

const fb = await s.from("feedback").select("id").limit(1);
const rn = await s.from("release_notes").select("id").limit(1);

if (fb.error) console.error("feedback FAIL:", fb.error.message);
else console.log("feedback OK");

if (rn.error) console.error("release_notes FAIL:", rn.error.message);
else console.log("release_notes OK");
