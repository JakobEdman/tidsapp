-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project TEXT NOT NULL DEFAULT 'Övrigt',
  activity TEXT NOT NULL DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  entry_date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Disable RLS (Row Level Security) for simplicity since we handle auth in the app
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations (our app handles auth)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on time_entries" ON time_entries FOR ALL USING (true) WITH CHECK (true);

-- Insert Jakob's account
INSERT INTO users (name, email, password, is_pro)
VALUES ('Jakob', 'jakob.edman@lager157.com', 'Jakob123', false)
ON CONFLICT (email) DO NOTHING;
