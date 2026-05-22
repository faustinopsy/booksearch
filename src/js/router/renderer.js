import { estado, atualizarEstado }    from './state.js';
import { renderizarLivros }           from '../ui/card.js';
import { renderizarPaginacao }        from '../ui/paginacao.js';
import { popularSelectCategorias }    from '../ui/filtros.js';
import { esconderErro }               from '../ui/feedback.js';

export function renderizarPaginaAtual() {
  const { resultados, paginaAtual, categoriaAtiva } = estado;

  const filtrados = categoriaAtiva
    ? resultados.filter(l => l.categoria === categoriaAtiva)
    : resultados;

  const POR_PAG  = 12;
  const inicio   = (paginaAtual - 1) * POR_PAG;
  const visiveis = filtrados.slice(inicio, inicio + POR_PAG);
  const total    = Math.max(1, Math.ceil(filtrados.length / POR_PAG));

  esconderErro();
  renderizarLivros(visiveis);
  renderizarPaginacao(paginaAtual, total, pag => {
    atualizarEstado({ paginaAtual: pag });
    renderizarPaginaAtual();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  popularSelectCategorias(resultados, categoriaAtiva);

  const sw = document.getElementById('selectWrapper');
  if (sw) sw.classList.toggle('hidden', resultados.length === 0);
}

export function atualizarNavAtiva(rota) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const destino = link.getAttribute('href').split('?')[0];
    link.classList.toggle('ativo', destino === rota);
  });
}
