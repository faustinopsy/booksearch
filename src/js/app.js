import { iniciarRouter }              from './router/index.js';
import { estado, atualizarEstado }   from './router/state.js';
import { renderizarPaginaAtual }     from './router/renderer.js';
import { executarBusca, navegarParaBusca } from './app/busca.js';
import { configurarGrade }           from './app/grade.js';
import { sincronizarHistorico }      from './app/historico.js';
import { inicializarTema, toggleTema } from './utils/tema.js';
import { posicionarNav, debounce }   from './utils/dom.js';
import { mostrarAviso, esconderAviso } from './ui/feedback.js';
import { on }                        from './eventBus.js';

function init() {
  inicializarTema();
  posicionarNav();
  configurarGrade();
  sincronizarHistorico(termo => navegarParaBusca(termo));

  document.getElementById('btnBuscar').addEventListener('click', () => {
    const termo = document.getElementById('inputBusca').value.trim();
    if (termo) navegarParaBusca(termo);
  });

  document.getElementById('inputBusca').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const termo = e.currentTarget.value.trim();
      if (termo) navegarParaBusca(termo);
    }
  });

  document.getElementById('btnTema').addEventListener('click', toggleTema);

  document.getElementById('selectCat').addEventListener('change', e => {
    atualizarEstado({ categoriaAtiva: e.target.value, paginaAtual: 1 });
    renderizarPaginaAtual();
  });

  document.getElementById('selectOrdem').addEventListener('change', () => {
    const { termoBusca } = estado;
    if (termoBusca) executarBusca(termoBusca);
  });

  window.addEventListener('resize', debounce(posicionarNav, 150));

  on('rota:mudar', ({ rota }) => {
    if (rota === '#/busca') {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      document.getElementById('inputBusca').value = params.get('q') || '';
    }
  });

  on('books:fallback', ({ para }) => mostrarAviso(`⚠️ Google Books indisponível — usando ${para}`));
  on('books:provider', ({ fallback }) => { if (!fallback) esconderAviso(); });

  on('busca:inicio', () => sincronizarHistorico(termo => navegarParaBusca(termo)));

  iniciarRouter(executarBusca);
}

init();
