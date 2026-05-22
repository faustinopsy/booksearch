import { classificarLivro, formatarAutores, traduzirCategoria } from '../utils/book.js';
import { escaparHTML }                                           from '../utils/dom.js';
import { isFavorito }                                            from '../storage.js';

const CAPA_FALLBACK = 'https://placehold.co/128x192/e5e2d9/6e6b64?text=Sem+Capa';

export function criarCardLivro(livro) {
  const badge    = classificarLivro(livro.nota);
  const autor    = formatarAutores(livro.autores);
  const cat      = traduzirCategoria(livro.categoria);
  const capa     = livro.capa || CAPA_FALLBACK;
  const fav      = isFavorito(livro.id);
  const titulo   = escaparHTML(livro.titulo);
  const autorEsc = escaparHTML(autor);

  return `
    <article class="card-livro" data-id="${livro.id}" role="button" tabindex="0"
      aria-label="Ver detalhes de ${titulo}">
      <div class="card-img-wrap">
        <img src="${capa}" alt="Capa: ${titulo}" loading="lazy">
      </div>
      <button class="btn-fav ${fav ? 'favoritado' : ''}"
        data-fav="${livro.id}"
        aria-label="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
        aria-pressed="${fav}">
        ${fav ? '❤️' : '🤍'}
      </button>
      <div class="card-info">
        <span class="card-badge" style="color:${badge.cor};background:${badge.bg}">
          ${badge.label}
        </span>
        <h3 class="card-titulo">${titulo}</h3>
        <p  class="card-autor">${autorEsc}</p>
        ${cat ? `<span class="card-cat">${escaparHTML(cat)}</span>` : ''}
      </div>
    </article>
  `;
}

export function renderizarLivros(lista) {
  const grade = document.getElementById('grade-livros');
  if (!lista?.length) {
    grade.innerHTML = '<p class="grade-vazia">Nenhum livro encontrado.</p>';
    return;
  }
  grade.innerHTML = lista.map(criarCardLivro).join('');
}

export function renderizarSkeletons(n = 12) {
  document.getElementById('grade-livros').innerHTML = Array.from({ length: n }, () => `
    <div class="card-skeleton" aria-hidden="true">
      <div class="card-skeleton-img skeleton"></div>
      <div class="card-skeleton-body">
        <div class="card-skeleton-line skeleton w-2-5"></div>
        <div class="card-skeleton-line skeleton w-full"></div>
        <div class="card-skeleton-line skeleton w-3-4"></div>
        <div class="card-skeleton-line skeleton w-1-2"></div>
      </div>
    </div>
  `).join('');
}
