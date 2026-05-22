import { atualizarEstado }       from './state.js';
import { renderizarPaginaAtual } from './renderer.js';
import { mostrarErro }           from '../ui/feedback.js';
import { carregarFavoritos }     from '../storage.js';
import { buscarDetalheLivro }    from '../api.js';

export function rotaInicio() {
  atualizarEstado({ resultados: [], paginaAtual: 1, termoBusca: '', categoriaAtiva: '' });
  renderizarPaginaAtual();
  document.title = 'BookSearch';
}

export function rotaBusca(params, onBusca) {
  atualizarEstado({
    termoBusca:     params.termoBusca,
    categoriaAtiva: params.categoriaAtiva,
    paginaAtual:    params.paginaAtual,
  });
  if (params.termoBusca) onBusca(params.termoBusca);
}

export async function rotaFavoritos() {
  document.title = 'BookSearch · Favoritos';
  const ids = carregarFavoritos();

  if (!ids.length) {
    atualizarEstado({ resultados: [], paginaAtual: 1 });
    document.getElementById('grade-livros').innerHTML = `
      <div class="favoritos-vazio">
        <span style="font-size:3rem">📭</span>
        <p>Nenhum favorito ainda.<br>Clique em ❤️ num livro para salvar.</p>
      </div>
    `;
    document.getElementById('paginacao').innerHTML = '';
    const sw = document.getElementById('selectWrapper');
    if (sw) sw.classList.add('hidden');
    return;
  }

  const livros = await Promise.all(ids.map(id => buscarDetalheLivro(id).catch(() => null)));
  atualizarEstado({ resultados: livros.filter(Boolean), paginaAtual: 1 });
  renderizarPaginaAtual();
}

export function rotaSobre() {
  document.title = 'BookSearch · Sobre';
  document.getElementById('grade-livros').innerHTML = `
    <div class="pagina-sobre">
      <h2>Sobre o BookSearch</h2>
      <p>Buscador de livros desenvolvido com JavaScript Vanilla + Vite.</p>
      <p>Utiliza a <strong>Google Books API</strong> (com fallback para <strong>Open Library</strong>)
         e suporta <strong>Gemini</strong> ou <strong>Ollama</strong> para resenhas com IA.</p>
      <p>Configure o provider de IA no <code>.env</code>:
         <code>VITE_AI_PROVIDER=gemini</code> ou <code>VITE_AI_PROVIDER=ollama</code>.</p>
    </div>
  `;
  document.getElementById('paginacao').innerHTML = '';
  const sw = document.getElementById('selectWrapper');
  if (sw) sw.classList.add('hidden');
}
