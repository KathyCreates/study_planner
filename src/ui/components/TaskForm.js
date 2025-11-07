import { formatISODate } from '../../utils/date.js';

export function TaskForm({ onSubmit, onCancel, initial } = {}) {
  const el = document.createElement('div');
  el.className = 'card';

  el.innerHTML = `
    <h3>${initial ? 'Редагувати задачу' : 'Додати задачу'}</h3>
    <div class="row">
      <input id="title" type="text" placeholder="Назва задачі" />
      <select id="category">
        <option value="Практична">Практична</option>
        <option value="Лабораторна">Лабораторна</option>
        <option value="Курсова">Курсова</option>
        <option value="Інше">Інше</option>
      </select>
      <select id="priority" aria-label="Складність">
        <option value="low">Легка</option>
        <option value="medium" selected>Середня</option>
        <option value="high">Важка</option>
      </select>
      <input id="due" type="date" />
    </div>
    <div class="row form-actions">
      <button id="saveBtn">${initial ? 'Зберегти' : 'Додати'}</button>
      ${onCancel ? '<button id="cancelBtn" class="secondary" type="button">Скасувати</button>' : ''}
      ${!initial ? '<button id="resetBtn" class="secondary" type="button">Очистити</button>' : ''}
    </div>
  `;

  const $ = (sel) => el.querySelector(sel);
  const title = $('#title');
  const cat = $('#category');
  const pr = $('#priority');
  const due = $('#due');

  // Заповнення значень у режимі редагування
  if (initial) {
    title.value = initial.title || '';
    cat.value = initial.category || 'Інше';
    pr.value = initial.priority || 'medium';
    due.value = initial.dueDate ? formatISODate(initial.dueDate) : '';
  }

  function submit() {
    const t = title.value.trim();
    if (!t) { title.focus(); return; }

    const task = {
      ...initial,
      title: t,
      category: cat.value,
      priority: pr.value,       // low | medium | high
      dueDate: due.value || null
    };
    onSubmit?.(task);

    // Якщо це створення — очищаємо форму після сабміту
    if (!initial) {
      title.value = '';
      due.value = '';
      cat.value = 'Інше';
      pr.value = 'medium';
      title.focus();
    }
  }

  // Події
  $('#saveBtn').addEventListener('click', submit);
  $('#resetBtn')?.addEventListener('click', () => {
    title.value = '';
    due.value = '';
    cat.value = 'Інше';
    pr.value = 'medium';
    title.focus();
  });
  $('#cancelBtn')?.addEventListener('click', () => onCancel?.());

  // Сабміт по Enter у полі назви
  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  });

  return el;
}
