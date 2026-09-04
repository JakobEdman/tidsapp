// Kör databas-migration mot Supabase via PostgREST/RPC eller direkt SQL.
// Service-nyckeln tas från argv[2].
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();

const serviceKey = process.argv[2];
if (!serviceKey) {
  console.error("Usage: node scripts/run-migration.mjs <service_role_key>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Supabase exponerar inte direkt exec_sql via JS-klienten på alla planer.
// Vi använder pg-meta/REST eller direkt postgrest call via RPC om finns.
// Enklast: skicka via Supabase Management REST API är inte heller alltid open.
// Vi prövar därför att skapa kolumnerna genom att INSERTA en dummy-rad och fånga felet.
// Det fungerar inte heller — bästa vägen är pg via postgres-meta.

// Workaround: vi använder Supabase REST API:s `pg-meta` om aktiverat,
// annars meddelar vi användaren.

// Försök först: kör via supabase-py-liknande /rest/v1/rpc om vi har en SQL-funktion.
// Eftersom vi inte har en sådan, försök istället via postgres direkt om DATABASE_URL ges.

console.log("OBS: Supabase JS-klient kan inte k\u00f6ra DDL direkt.");
console.log("F\u00f6rs\u00f6ker via management API...");

const projectRef = url.match(/https:\/\/([^.]+)\./)[1];
const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const sql = `
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token
  ON users(password_reset_token)
  WHERE password_reset_token IS NOT NULL;
`;

const res = await fetch(managementUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
console.log("Status:", res.status);
console.log("Response:", text);

if (res.ok) {
  // Verifiera genom att läsa tillbaka schema
  const verify = await supabase
    .from("users")
    .select("id, password_reset_token, password_reset_expires")
    .limit(1);
  console.log("Verification:", verify.error ? verify.error : "OK");
}
