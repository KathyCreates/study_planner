export function Modal({ title = 'Редагування', content, onClose } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="modal-header">
        <div class="modal-title">${escapeHtml(title)}</div>
        <button class="modal-close" aria-label="Закрити">✕</button>
      </div>
      <div class="modal-body"></div>
    </div>`;
  const dlg = backdrop.querySelector('.modal');
  const body = backdrop.querySelector('.modal-body');

  if (content) body.append(content);

  const close = () => {
    backdrop.remove();
    document.removeEventListener('keydown', onEsc);
    onClose?.();
  };
  const onEsc = (e) => { if (e.key === 'Escape') close(); };

  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  backdrop.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', onEsc);

  return {
    el: backdrop,
    open(parent = document.body) { parent.append(backdrop); requestAnimationFrame(() => dlg.classList.add('show')); },
    close
  };
}

function escapeHtml(s = '') { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])); }
