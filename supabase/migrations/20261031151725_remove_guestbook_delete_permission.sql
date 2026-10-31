/*
# Remove delete permission from guestbook_notes

## What changes
- The `guestbook_notes` table previously allowed anyone (anon + authenticated)
  to SELECT, INSERT, UPDATE, and DELETE notes.
- Visitors were deleting each other's messages, which is not desired.

## Security changes
- REVOKE DELETE on `guestbook_notes` from `anon` and `authenticated`.
- DROP the existing `anon_delete_notes` policy so deletes are blocked by RLS.
- Keep SELECT, INSERT, and UPDATE (anon + authenticated) unchanged so visitors
  can still read and post notes.
*/

REVOKE DELETE ON guestbook_notes FROM anon, authenticated;

DROP POLICY IF EXISTS "anon_delete_notes" ON guestbook_notes;
