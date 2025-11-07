const KEY = 'tasks:v1';

export const TaskRepository = {
  async list() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },
  async saveAll(tasks) {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  },
  async add(task) {
    const all = await this.list();
    all.push(task);
    await this.saveAll(all);
    return task;
  },
  async update(updated) {
    const all = await this.list();
    const idx = all.findIndex(x => x.id === updated.id);
    if (idx !== -1) {
      all[idx] = updated;
      await this.saveAll(all);
    }
    return updated;
  },
  async remove(id) {
    const all = await this.list();
    const next = all.filter(x => x.id !== id);
    await this.saveAll(next);
  }
};
