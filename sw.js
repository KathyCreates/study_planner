const CACHE = 'app-shell-v4';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',

  './src/app.js',
  './src/utils/date.js',

  './src/storage/idb.js',
  './src/storage/migrate.js',
  './src/storage/TaskRepository.js',

  './src/services/TaskService.js',

  './src/ui/pages/HomePage.js',
  './src/ui/components/TaskForm.js',
  './src/ui/components/TaskItem.js',
  './src/ui/components/FiltersBar.js',
  './src/ui/components/Modal.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // одразу активуємо нову версію
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await self.clients.claim(); // беремо контроль над клієнтами
    })()
  );
});

// Стратегія:
// - Навігація (HTML) → network-first з offline fallback на index.html
// - Інше (JS/CSS/запити) → cache-first + runtime-кеш для GET
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Навігаційні запити (SPA)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch {
        const cachedShell = await caches.match('./index.html');
        if (cachedShell) return cachedShell;
        // як крайній варіант — будь-який збіг у кеші
        const any = await caches.match(req);
        if (any) return any;
        throw new Error('Offline and no cached shell');
      }
    })());
    return;
  }

  // Для всіх інших — cache-first з підкладкою в кеш
  if (req.method === 'GET') {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const resp = await fetch(req);
        const copy = resp.clone();
        const cache = await caches.open(CACHE);
        cache.put(req, copy);
        return resp;
      } catch {
        // якщо офлайн і в кеші нема — повертаємо як є (провал)
        return caches.match('./index.html'); // інколи допоможе як fallback
      }
    })());
  }
});
