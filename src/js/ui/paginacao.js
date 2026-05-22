export function renderizarPaginacao(paginaAtual, total, onNavegar) {
  const cont = document.getElementById('paginacao');
  if (total <= 1) { cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <button class="btn-pag" data-pag="${paginaAtual - 1}"
      ${paginaAtual <= 1 ? 'disabled' : ''}
      aria-label="Página anterior">← Anterior</button>
    <span aria-live="polite">${paginaAtual} de ${total}</span>
    <button class="btn-pag" data-pag="${paginaAtual + 1}"
      ${paginaAtual >= total ? 'disabled' : ''}
      aria-label="Próxima página">Próximo →</button>
  `;
  cont.querySelectorAll('.btn-pag:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => onNavegar(Number(btn.dataset.pag)));
  });
}
