const CACHE='beauty-match-shell-v067';
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/manifest.webmanifest']).catch(()=>{})));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim(),
  ]));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;
  if(event.request.mode==='navigate'){
    // Network only for pages while online. This prevents an old home page from
    // surviving after a production deployment. PWA shell is still installable.
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>new Response('Offline',{status:503,headers:{'content-type':'text/plain; charset=utf-8'}})));
  }
});
