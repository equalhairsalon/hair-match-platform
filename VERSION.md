# Hair Match Platform R0.6.7 — Verified Stable Checkpoint

This checkpoint is rebuilt from the user-uploaded project and packaged as a complete runtime source tree.

Release gates:
- App Router root exists: `app/layout.tsx` + `app/page.tsx`.
- Auth: `/auth`.
- Customer demand: `/request/new`.
- Provider discovery: `/discover`.
- Super Admin: `/admin` and all admin sub-pages.
- All DB-backed pages are `force-dynamic`; build does not query Neon during prerender.
- Post-build route manifest must contain `/`, `/auth`, `/request/new`, `/admin`, and `/api/health`.
- Strict live data; no demo provider fallback.
- iOS + Android PWA retained.

No database migration is required when R0.6 migration has already completed.
