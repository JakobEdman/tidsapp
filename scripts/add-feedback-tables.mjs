const sql = `
-- Feedback från användare
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  type TEXT NOT NULL DEFAULT 'other', -- 'bug' | 'request' | 'other'
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'in_progress' | 'done'
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on feedback" ON feedback;
CREATE POLICY "Allow all on feedback" ON feedback FOR ALL USING (true) WITH CHECK (true);

-- Release notes (engångs-popup för användare)
CREATE TABLE IF NOT EXISTS release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_release_notes_active ON release_notes(is_active, published_at DESC);
ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on release_notes" ON release_notes;
CREATE POLICY "Allow all on release_notes" ON release_notes FOR ALL USING (true) WITH CHECK (true);
`;

console.log("Klistra in följande i Supabase SQL Editor:");
console.log("---");
console.log(sql);
console.log("---");
