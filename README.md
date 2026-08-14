# 美業媒合平台 — R0.6

Cloud-first beauty service marketplace built with Next.js + Vercel + Neon PostgreSQL.

## Product model
- Customers: free
- Providers / studios: subscription / trial / discount / comped access
- Categories: Hair, Nails, Lashes, Beauty & Body
- Customer flow: choose category → choose service → location/time/budget/photos → provider proposals → chat → booking
- Provider flow: register → onboarding → application review → approved directory → receive matching demands → quote

## Super Admin
`/admin` is the platform command center.

Management is queue-based rather than card-based:
- provider applications
- unified account directory
- provider directory
- organizations / studios
- customer accounts
- billing / plans
- service categories
- reports / risk
- audit logs

See `R0.6_ADMIN_ARCHITECTURE.md` and `R0.6_GO_LIVE.md`.

## Deploy
The production source of truth is Neon. Vercel deploys automatically from GitHub `main`.
