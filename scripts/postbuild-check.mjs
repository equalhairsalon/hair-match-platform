import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const candidates=[
  '.next/app-path-routes-manifest.json',
  '.next/server/app-paths-manifest.json',
];
const file=candidates.map(x=>path.join(root,x)).find(fs.existsSync);
if(!file){
  console.error('[postbuild] Next route manifest not found.');
  process.exit(1);
}
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const values=new Set(Object.values(manifest));
const keys=new Set(Object.keys(manifest));
const expected=['/','/auth','/request/new','/discover','/admin','/api/health'];
const missing=expected.filter(route=>!values.has(route)&&!keys.has(route)&&!keys.has(route==='/ ' ? '/page' : route));
if(missing.length){
  console.error('[postbuild] Critical deployed routes are missing:');
  for(const r of missing) console.error(`  - ${r}`);
  process.exit(1);
}
console.log(`[postbuild] OK: critical routes exist in ${path.relative(root,file)}.`);
console.log('[postbuild] /, /auth, /request/new, /discover, /admin, /api/health are present.');
