import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const supabase = createClient(url, key);
const { data, error } = await supabase
  .from("users")
  .select("id, name, email, is_pro, must_change_password, created_at")
  .order("created_at", { ascending: true });

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

console.table(data);
