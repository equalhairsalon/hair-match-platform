# R0.6.1 — Auth / Super Admin Session Fix

- Session role now refreshes from Neon instead of trusting a stale JWT role.
- Super Admin authorization is verified directly against users + platform_admins.
- Header now shows current signed-in user, logout, and Super Admin entry.
- Registration validates AUTH_SECRET before database insert.
- PWA service worker purges old shell caches and does not serve stale pages.
- Health/version: 0.6.1.
