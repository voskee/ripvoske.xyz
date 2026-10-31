/*
# Create guestbook table for the ripvoske.xyz notes board

1. New Tables
- `guestbook_notes`
  - `id` (uuid, primary key)
  - `author` (text, nickname left by visitor, defaults to 'Anónimo')
  - `message` (text, the note content, required, max ~500 chars)
  - `created_at` (timestamptz, when the note was posted)
2. Security
- Enable RLS on `guestbook_notes`.
- Grant CRUD to `anon` + `authenticated` so the no-auth public frontend can read/write notes.
- Public/shared data: anyone can read, create, update, and delete notes (intentionally open "pizarra libre").
*/

CREATE TABLE IF NOT EXISTS guestbook_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL DEFAULT 'Anónimo',
  message text NOT NULL CHECK (char_length(message) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guestbook_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON guestbook_notes TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_notes" ON guestbook_notes;
CREATE POLICY "anon_select_notes" ON guestbook_notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notes" ON guestbook_notes;
CREATE POLICY "anon_insert_notes" ON guestbook_notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notes" ON guestbook_notes;
CREATE POLICY "anon_update_notes" ON guestbook_notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notes" ON guestbook_notes;
CREATE POLICY "anon_delete_notes" ON guestbook_notes FOR DELETE
  TO anon, authenticated USING (true);
