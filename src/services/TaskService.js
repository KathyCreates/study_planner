import { TaskRepository } from '../storage/TaskRepository.js';
import { formatISODate } from '../utils/date.js';

function toISO(d) { return new Date(d).toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function isSameDay(a, b) { return toISO(a) === toISO(b); }
function inNextDays(dateStr, n) {
  if (!dateStr) return false;
  const today = new Date(toISO(new Date()));
  const end = addDays(today, n);
  const d = new Date(dateStr);
  return d >= today && d <= end;
}
function isInThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr), now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date(toISO(new Date()));
  return new Date(dateStr) < today;
}

function normalizeCategory(raw = '') {
  const s = String(raw).trim().toLowerCase();
  const lab = new Set(['лабораторна', 'лаб', 'лаба', 'laboratory', 'lab']);
  const prac = new Set(['практична', 'практика', 'practice', 'pract']);
  const kurs = new Set(['курсова', 'курс.', 'course', 'coursework']);
  if (lab.has(s)) return 'Лабораторна';
  if (prac.has(s)) return 'Практична';
  if (kurs.has(s)) return 'Курсова';
  if (['інше', 'other'].includes(s)) return 'Інше';
  if (['Лабораторна', 'Практична', 'Курсова', 'Інше'].includes(raw)) return raw;
  return 'Інше';
}

function normalize(task) {
  return {
    id: task.id ?? crypto.randomUUID(),
    title: task.title?.trim() || 'Без назви',
    category: normalizeCategory(task.category || 'Інше'),
    dueDate: task.dueDate ? formatISODate(task.dueDate) : null,
    priority: task.priority || 'medium',
    done: !!task.done,
    createdAt: task.createdAt || new Date().toISOString()
  };
}

export const TaskService = {
  async list(filters = {}) {
    const all = (await TaskRepository.list()).map(normalize);

    if (typeof TaskRepository.saveAll === 'function') {
      await TaskRepository.saveAll(all);
    } else if (typeof TaskRepository.update === 'function') {
      for (const t of all) await TaskRepository.update(t);
    }

    let res = all;

    if (filters.q) {
      const q = String(filters.q).toLowerCase().trim();
      res = res.filter(t => `${t.title} ${t.category}`.toLowerCase().includes(q));
    }

    if (filters.category && filters.category !== 'all') {
      const want = normalizeCategory(filters.category);
      res = res.filter(t => normalizeCategory(t.category) === want);
    }

    if (filters.status && filters.status !== 'all') {
      res = res.filter(t => (filters.status === 'done') ? t.done : !t.done);
    }

    if (filters.due && filters.due !== 'all') {
      res = res.filter(t => {
        const dd = t.dueDate;
        if (filters.due === 'overdue') return isOverdue(dd) && !t.done;
        if (!dd) return false;
        const today = new Date();
        if (filters.due === 'today') return isSameDay(dd, today);
        if (filters.due === 'tomorrow') return isSameDay(dd, addDays(today, 1));
        if (filters.due === 'week') return inNextDays(dd, 7);
        if (filters.due === 'month') return isInThisMonth(dd);
        return true;
      });
    }

    res = res.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (da !== db) return da - db;
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    if (filters.due === 'overdue') {
      res.sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      });
    }

    return res;
  },

  async add(task) {
    const t = normalize(task);
    await TaskRepository.add(t);
    return t;
  },

  async update(task) {
    const t = normalize(task);
    await TaskRepository.update(t);
    return t;
  },

  async toggleDone(id) {
    const all = await TaskRepository.list();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return;
    all[idx] = normalize({ ...all[idx], done: !all[idx].done });
    await TaskRepository.saveAll(all);
    return all[idx];
  },

  async remove(id) {
    await TaskRepository.remove(id);
  }
};
