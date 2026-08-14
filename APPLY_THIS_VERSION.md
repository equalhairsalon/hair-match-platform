# R0.6.1 SAFE OVERLAY

This overlay intentionally contains the full R0.6 multi-beauty runtime plus the R0.6.1 authentication/admin fixes.
It is safer than applying a tiny patch when Vercel may still be serving an older R0.2/R0.5 tree.

Copy these files/folders over the existing local `hair-match-platform` project.
Do NOT delete or upload `.git`, `node_modules`, `.next`, or local `.env*` files.
No new Neon migration is required if R0.6_MIGRATION.sql has already completed.
