import { escaparHTML } from '../utils/dom.js';

export function renderizarHistorico(historico, onClicar) {
  const cont = document.getElementById('historicoContainer');
  if (!cont) return;
  if (!historico.length) { cont.innerHTML = ''; return; }
  cont.innerHTML = historico
    .map(t => `<button class="chip-historico" data-termo="${escaparHTML(t)}">${escaparHTML(t)}</button>`)
    .join('');
  cont.querySelectorAll('.chip-historico').forEach(btn => {
    btn.addEventListener('click', () => onClicar(btn.dataset.termo));
  });
}
