// src/storage/TaskRepository.js
import { IDB } from './idb.js';

let opened = false;
async function ensure() {
  if (!opened) { await IDB.open(); opened = true; }
}

export const TaskRepository = {
  async list() {
    await ensure();
    return await IDB.getAll();
  },

  async saveAll(tasks) {
    await ensure();
    await IDB.clearTasks();
    for (const t of tasks) await IDB.putTask(t);
    await IDB.backupNow({ op: 'saveAll', count: tasks.length });
  },

  async add(task) {
    await ensure();
    await IDB.putTask(task);
    return task;
  },

  async update(updated) {
    await ensure();
    await IDB.putTask(updated); // put оновлює за id
    return updated;
  },

  async remove(id) {
    await ensure();
    await IDB.delTask(id);
  }
};
