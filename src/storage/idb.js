export const IDB = (() => {
  const DB_NAME = 'tasks-db';
  const VER = 1;
  const STORES = {
    TASKS: 'tasks',
    BACKUPS: 'backups',
  };

  /** @type {IDBDatabase|null} */
  let db = null;

  function open() {
    if (db) return Promise.resolve();

    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, VER);

      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORES.TASKS)) {
          d.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains(STORES.BACKUPS)) {
          d.createObjectStore(STORES.BACKUPS, { keyPath: 'ts' });
        }
      };

      req.onsuccess = () => {
        db = req.result;
        // Закриваємо базу при зміні версії, щоб не блокувати оновлення
        db.onversionchange = () => db && db.close();
        res();
      };

      req.onerror = () => rej(req.error);
      req.onblocked = () => {
        // Не критично: інші вкладки тримають стару версію
        console.warn('[IDB] open blocked — закрийте інші вкладки застосунку');
      };
    });
  }

  const store = (name, mode = 'readonly') =>
    db.transaction(name, mode).objectStore(name);

  return {
    open,

    // --- TASKS ---
    putTask: (t) =>
      new Promise((res, rej) => {
        const r = store(STORES.TASKS, 'readwrite').put(t);
        r.onsuccess = () => res();
        r.onerror = () => rej(r.error);
      }),

    getTask: (id) =>
      new Promise((res, rej) => {
        const r = store(STORES.TASKS).get(id);
        r.onsuccess = () => res(r.result ?? null);
        r.onerror = () => rej(r.error);
      }),

    getAll: () =>
      new Promise((res, rej) => {
        const r = store(STORES.TASKS).getAll();
        r.onsuccess = () => res(r.result || []);
        r.onerror = () => rej(r.error);
      }),

    delTask: (id) =>
      new Promise((res, rej) => {
        const r = store(STORES.TASKS, 'readwrite').delete(id);
        r.onsuccess = () => res();
        r.onerror = () => rej(r.error);
      }),

    clearTasks: () =>
      new Promise((res, rej) => {
        const r = store(STORES.TASKS, 'readwrite').clear();
        r.onsuccess = () => res();
        r.onerror = () => rej(r.error);
      }),

    // --- BACKUPS ---
    backupNow: (payload) =>
      new Promise((res, rej) => {
        const r = store(STORES.BACKUPS, 'readwrite').put({
          ts: Date.now(),
          payload,
        });
        r.onsuccess = () => res();
        r.onerror = () => rej(r.error);
      }),

    backups: () =>
      new Promise((res, rej) => {
        const r = store(STORES.BACKUPS).getAll();
        r.onsuccess = () => {
          const arr = r.result || [];
          arr.sort((a, b) => b.ts - a.ts);
          res(arr.slice(0, 3));
        };
        r.onerror = () => rej(r.error);
      }),
  };
})();
