import { HomePage } from './ui/pages/HomePage.js';

// Реєстрація service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

// Обробка PWA install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  installBtn.hidden = true;
  await deferredPrompt?.prompt();
  deferredPrompt = null;
});

const root = document.getElementById('app');
HomePage(root);
