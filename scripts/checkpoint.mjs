import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=['app/layout.tsx','app/page.tsx','app/auth/page.tsx','app/discover/page.tsx','app/request/new/page.tsx','app/admin/layout.tsx','app/admin/page.tsx','app/admin/audit/page.tsx','app/api/health/route.ts','lib/server-db.ts','lib/auth.ts','lib/admin.ts','components/Header.tsx','public/manifest.webmanifest','public/sw.js'];
const missing=required.filter(f=>!fs.existsSync(path.join(root,f)));
if(missing.length){console.error('[checkpoint] Missing:\n'+missing.map(f=>' - '+f).join('\n'));process.exit(1)}
console.log('[checkpoint] Critical route structure OK.');
await import('./preflight.mjs');
