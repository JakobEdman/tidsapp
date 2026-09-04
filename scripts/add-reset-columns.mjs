// Lägger till kolumner för glömt-lösenord-flödet.
// Kör med: node scripts/add-reset-columns.mjs
//
// OBS: Supabase anon-nyckeln har inte rättigheter att ändra schema.
// Detta script printar bara SQL:en så du kan klistra in i Supabase SQL Editor.

const sql = `
-- Glömt-lösenord-flöde
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token
  ON users(password_reset_token)
  WHERE password_reset_token IS NOT NULL;
`;

console.log("Klistra in följande i Supabase SQL Editor (https://supabase.com/dashboard):");
console.log("---");
console.log(sql);
console.log("---");
