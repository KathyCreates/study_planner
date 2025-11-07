export function FiltersBar({ onChange }) {
  const el = document.createElement('div');
  el.className = 'filters card';

  el.innerHTML = `
    <input id="q" type="text" placeholder="Пошук..." />
    <select id="cat">
      <option value="all">Всі категорії</option>
      <option value="Практична">Практичні</option>
      <option value="Лабораторна">Лабораторні</option>
      <option value="Курсова">Курсові</option>
      <option value="Інше">Інше</option>
    </select>
    <select id="status">
      <option value="all">Усі</option>
      <option value="open">Активні</option>
      <option value="done">Виконані</option>
    </select>
    <select id="due" title="Дедлайн">
      <option value="all">Усі</option>
      <option value="today">Сьогодні</option>
      <option value="tomorrow">Завтра</option>
      <option value="week">Тиждень</option>
      <option value="month">Місяць</option>
      <option value="overdue">Прострочені</option>
    </select>
    <span class="badge" id="count">0</span>
  `;

  const state = { q: '', category: 'all', status: 'all', due: 'all' };
  const emit = () => onChange?.({ ...state });

  el.querySelector('#q').addEventListener('input', e => { state.q = e.target.value; emit(); });
  el.querySelector('#cat').addEventListener('change', e => { state.category = e.target.value; emit(); });
  el.querySelector('#status').addEventListener('change', e => { state.status = e.target.value; emit(); });
  el.querySelector('#due').addEventListener('change', e => { state.due = e.target.value; emit(); });

  el.updateCount = (n) => {
    const node = el.querySelector('#count');
    node.textContent = n;
    node.classList.remove('bump');
    // перезапуск анімації
    void node.offsetWidth;
    node.classList.add('bump');
  };


  return el;
}
