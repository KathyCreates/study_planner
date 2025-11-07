// src/app.js
import { runMigrationIfNeeded } from './storage/migrate.js';
import { HomePage } from './ui/pages/HomePage.js';

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  // достатньо просто викликати без очікування load
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

// --- PWA install banner ---
let deferredPrompt = null;

// зберігаємо подію, щоб показати кнопку коли DOM готовий
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  if (btn) btn.hidden = false;
});

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Міграція localStorage -> IndexedDB до старту UI
  await runMigrationIfNeeded();

  // 2) PWA install кнопка (може з’явитись уже після beforeinstallprompt)
  const installBtn = document.getElementById('installBtn');
  if (deferredPrompt && installBtn) installBtn.hidden = false;

  installBtn?.addEventListener('click', async () => {
    installBtn.hidden = true;
    await deferredPrompt?.prompt();
    deferredPrompt = null;
  });

  // 3) Рендер головної сторінки
  const root = document.getElementById('app');
  HomePage(root);
});
