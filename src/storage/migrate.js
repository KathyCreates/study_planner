import { IDB } from '../storage/idb.js';

export async function runMigrationIfNeeded() {
  await IDB.open();

  const flag = localStorage.getItem('migrated_to_idb');
  if (flag) return;

  const raw =
    localStorage.getItem('tasks:v1') ?? // поточний ключ
    localStorage.getItem('tasks') ??     // можливий дуже старий
    '[]';

  const tasks = JSON.parse(raw);
  for (const t of tasks) await IDB.putTask(t);

  await IDB.backupNow({ tasks, source: 'localStorage' });
  localStorage.setItem('migrated_to_idb', '1');
}
