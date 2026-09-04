import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const [, , email, newPassword] = process.argv;
if (!email || !newPassword) {
  console.error("Usage: node scripts/reset-password.mjs <email> <new-password>");
  process.exit(1);
}

const supabase = createClient(url, key);
const { data, error } = await supabase
  .from("users")
  .update({ password: newPassword, must_change_password: false })
  .eq("email", email.toLowerCase())
  .select("id, name, email")
  .single();

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

console.log("Password updated for:", data);
