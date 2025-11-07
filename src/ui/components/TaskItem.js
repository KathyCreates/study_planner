export function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const el = document.createElement('div');

  const prClass =
    task.priority === 'high' ? 'pr-high' :
      task.priority === 'medium' ? 'pr-medium' :
        'pr-low';

  const todayISO = new Date().toISOString().slice(0, 10);
  const dueISO = task.dueDate ? String(task.dueDate).slice(0, 10) : null;
  const isOverdue = !!(dueISO && dueISO < todayISO && !task.done);

  el.className = `item ${task.done ? 'done' : ''} ${prClass}${isOverdue ? ' overdue' : ''}`;

  el.innerHTML = `
    <label class="check-lg" title="Позначити виконаною">
      <input type="checkbox" ${task.done ? 'checked' : ''} />
      <span class="box"></span>
    </label>

    <div class="grow">
      <div class="title">${escapeHtml(task.title)}</div>
      <div class="meta">
        <span class="badge">${escapeHtml(task.category || 'Інше')}</span>
        ${task.priority ? ` • <span class="difficulty">складність: <span class="value">${escapeHtml(priorityLabel(task.priority))}</span></span>` : ''}
        ${task.dueDate ? ` <span class="deadline">дедлайн: ${escapeHtml(String(task.dueDate))}</span>` : ''}
      </div>
    </div>

    <button class="btn-edit" data-edit>Ред.</button>
    <button class="danger" data-del>Видалити</button>
  `;

  el.querySelector('input[type="checkbox"]').addEventListener('change', () => onToggle?.(task.id));
  el.querySelector('[data-del]').addEventListener('click', () => onDelete?.(task.id));
  el.querySelector('[data-edit]').addEventListener('click', () => onEdit?.(task));

  return el;
}

function priorityLabel(v) {
  if (v === 'high') return 'Важка';
  if (v === 'medium') return 'Середня';
  return 'Легка';
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
}
