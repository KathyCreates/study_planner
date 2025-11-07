import { TaskService } from '../../services/TaskService.js';
import { TaskForm } from '../components/TaskForm.js';
import { FiltersBar } from '../components/FiltersBar.js';
import { TaskItem } from '../components/TaskItem.js';
import { Modal } from '../components/Modal.js';

export function HomePage(root) {
  root.innerHTML = '';

  // Макет 2 колонки
  const layout = document.createElement('div');
  layout.className = 'layout';

  // Ліва колонка — додавання
  const addForm = TaskForm({
    onSubmit: async (task) => {
      await TaskService.add(task);
      renderList();
    }
  });
  const left = document.createElement('div');
  left.className = 'left-col';
  left.append(addForm);

  // Права колонка — фільтри + список
  const right = document.createElement('div');
  right.className = 'right-col';

  const filters = FiltersBar({
    onChange: (f) => { currentFilters = f; renderList(); }
  });

  const listWrap = document.createElement('div');
  listWrap.className = 'card';
  listWrap.innerHTML = `<h3>Задачі</h3><div id="list" class="list"></div>`;

  right.append(filters, listWrap);
  layout.append(left, right);
  root.append(layout);

  let currentFilters = {};

  async function renderList() {
    const items = await TaskService.list(currentFilters);
    const list = listWrap.querySelector('#list');
    list.innerHTML = '';
    filters.updateCount(items.length);

    items.forEach(task => {
      const row = TaskItem({
        task,
        onToggle: async (id) => { await TaskService.toggleDone(id); renderList(); },
        onDelete: async (id) => { await TaskService.remove(id); renderList(); },
        onEdit: (t) => openEditModal(t)
      });
      list.appendChild(row);
    });
  }

  function openEditModal(t) {
    let modal;
    const form = TaskForm({
      initial: t,
      onSubmit: async (next) => {
        await TaskService.update({ ...t, ...next });
        modal.close();
        renderList();
      },
      onCancel: () => modal.close()
    });
    modal = Modal({ title: 'Редагування задачі', content: form });
    modal.open();
  }

  renderList();
}
