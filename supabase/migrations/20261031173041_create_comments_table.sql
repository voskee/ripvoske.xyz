/*
# Crear tabla de comentarios

1. Tabla nueva
- `comments`
  - `id` (uuid, clave principal)
  - `author` (text, apodo de quien comenta, por defecto 'Anónimo')
  - `message` (text, contenido del comentario, máximo 500 caracteres)
  - `created_at` (timestamptz, fecha de creación)
2. Seguridad
- RLS activado en `comments`.
- Permisos de lectura y escritura para `anon` y `authenticated`
  (la app no tiene login, los datos son públicos).
- Sin permisos de DELETE (igual que el libro de visitas).
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL DEFAULT 'Anónimo',
  message text NOT NULL CHECK (char_length(message) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON comments TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_comments" ON comments;
CREATE POLICY "anon_select_comments" ON comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_comments" ON comments;
CREATE POLICY "anon_insert_comments" ON comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_comments" ON comments;
CREATE POLICY "anon_update_comments" ON comments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
