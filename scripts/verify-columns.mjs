import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const s = createClient(url, key);
const { error } = await s
  .from("users")
  .select("id, password_reset_token, password_reset_expires")
  .limit(1);

if (error) {
  console.error("FAIL:", error.message);
  process.exit(1);
}
console.log("OK - reset-kolumner finns.");
