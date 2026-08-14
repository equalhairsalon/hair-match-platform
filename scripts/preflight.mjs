import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/auth/page.tsx',
  'app/discover/page.tsx',
  'app/request/new/page.tsx',
  'app/admin/layout.tsx',
  'app/admin/page.tsx',
  'app/api/health/route.ts',
  'lib/server-db.ts',
  'lib/auth.ts',
  'lib/admin.ts',
  'lib/service-catalog.ts',
  'components/Header.tsx',
  'components/PwaRegister.tsx',
  'public/manifest.webmanifest',
];

const missing = required.filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length) {
  console.error('\n[preflight] Missing critical runtime files:');
  for (const f of missing) console.error(`  - ${f}`);
  process.exit(1);
}

const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
if (!/export\s+default/.test(page)) {
  console.error('[preflight] app/page.tsx has no default export.');
  process.exit(1);
}
if (!/export\s+default/.test(layout)) {
  console.error('[preflight] app/layout.tsx has no default export.');
  process.exit(1);
}

const sourceFiles = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(ent.name)) sourceFiles.push(p);
  }
}
for (const d of ['app', 'components', 'lib']) {
  const p = path.join(root, d);
  if (fs.existsSync(p)) walk(p);
}

function localImportResolves(file, spec) {
  let base;
  if (spec.startsWith('@/')) base = path.join(root, spec.slice(2));
  else if (spec.startsWith('./') || spec.startsWith('../')) base = path.resolve(path.dirname(file), spec);
  else return true;
  const candidates = [
    base,
    `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.mjs`, `${base}.css`,
    path.join(base, 'index.ts'), path.join(base, 'index.tsx'),
    path.join(base, 'index.js'), path.join(base, 'index.jsx'), path.join(base, 'index.mjs'),
  ];
  return candidates.some((p) => fs.existsSync(p));
}

const unresolved = [];
for (const file of sourceFiles) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /(?:from\s+|import\s*\()(['"])([^'"\)]+)\1/g;
  let m;
  while ((m = re.exec(src))) {
    const spec=m[2];
    if ((spec.startsWith('@/') || spec.startsWith('./') || spec.startsWith('../')) && !localImportResolves(file,spec)) {
      unresolved.push(`${path.relative(root, file)} -> ${spec}`);
    }
  }
}
if (unresolved.length) {
  console.error('\n[preflight] Unresolved local imports:');
  for (const x of unresolved) console.error(`  - ${x}`);
  process.exit(1);
}

const runtimeText = sourceFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const demoNames = ['Mina | LUMI Hair', 'Ivy | SENSE Hair Studio', 'MORI SALON'];
const foundDemo = demoNames.filter((n) => runtimeText.includes(n));
if (foundDemo.length) {
  console.error(`[preflight] Demo provider data found in runtime: ${foundDemo.join(', ')}`);
  process.exit(1);
}

console.log(`[preflight] OK: ${required.length} critical files, ${sourceFiles.length} source files, local imports resolved.`);
console.log('[preflight] Root route / is present at app/page.tsx.');

// Pages that directly import the database client must never be prerendered.
// This keeps local/CI production builds independent of DATABASE_URL while
// still requiring the variable at request time in deployed environments.
const dbBackedPages = sourceFiles.filter((f) => {
  if (!f.endsWith(`${path.sep}page.tsx`) && !f.endsWith(`${path.sep}page.ts`)) return false;
  const src = fs.readFileSync(f, 'utf8');
  return src.includes("@/lib/server-db");
});
const staticDbPages = dbBackedPages
  .filter((f) => !fs.readFileSync(f, 'utf8').includes("export const dynamic = 'force-dynamic'"))
  .map((f) => path.relative(root, f));
if (staticDbPages.length) {
  console.error('\n[preflight] DB-backed pages must be force-dynamic:');
  for (const f of staticDbPages) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`[preflight] DB render safety OK: ${dbBackedPages.length} DB-backed pages are force-dynamic.`);
