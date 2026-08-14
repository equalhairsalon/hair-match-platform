import { spawn } from 'node:child_process';

const port = 3188;
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run','start','--','-p',String(port)], {
  stdio: ['ignore','pipe','pipe'],
  env: {...process.env, PORT:String(port)},
});
let log='';
child.stdout.on('data',d=>{log+=d.toString()});
child.stderr.on('data',d=>{log+=d.toString()});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitServer(){
  for(let i=0;i<40;i++){
    try{const r=await fetch(base+'/',{redirect:'manual'});if(r.status>0)return;}catch{}
    if(child.exitCode!==null)throw new Error('Next server exited before smoke test.\n'+log);
    await sleep(250);
  }
  throw new Error('Timed out waiting for local Next server.\n'+log);
}
async function check(path, allowed){
  const r=await fetch(base+path,{redirect:'manual'});
  if(!allowed.includes(r.status))throw new Error(`${path} returned HTTP ${r.status}; expected ${allowed.join(' or ')}`);
  console.log(`[smoke] ${path} -> ${r.status}`);
}
try{
  await waitServer();
  await check('/',[200]);
  await check('/auth',[200]);
  await check('/request/new',[200]);
  await check('/api/health',[200,503]); // 503 is expected locally when DATABASE_URL is intentionally absent.
  console.log('[smoke] OK — root/auth/request routes are reachable; health route exists.');
} finally {
  child.kill('SIGTERM');
  await sleep(250);
  if(child.exitCode===null)child.kill('SIGKILL');
}
