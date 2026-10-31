/*
# Create drawings table for MS Paint public gallery

1. New Tables
- `drawings`
  - `id` (uuid, primary key)
  - `author` (text, nickname left by visitor, defaults to 'Anónimo')
  - `title` (text, title of the drawing, defaults to 'Sin título')
  - `data_url` (text, the canvas image as a base64 PNG data URL, required)
  - `created_at` (timestamptz, when the drawing was posted)
2. Security
- Enable RLS on `drawings`.
- Grant SELECT, INSERT to `anon` + `authenticated` so the no-auth public frontend can read/write drawings.
- Anyone can read and create drawings (intentionally public/shared gallery).
- No update or delete permissions — drawings are permanent once posted.
*/

CREATE TABLE IF NOT EXISTS drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL DEFAULT 'Anónimo',
  title text NOT NULL DEFAULT 'Sin título',
  data_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON drawings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_drawings" ON drawings;
CREATE POLICY "anon_select_drawings" ON drawings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_drawings" ON drawings;
CREATE POLICY "anon_insert_drawings" ON drawings FOR INSERT
  TO anon, authenticated WITH CHECK (true);