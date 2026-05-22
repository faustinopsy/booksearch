import { formatarAutores } from '../utils/book.js';
import { escaparHTML }     from '../utils/dom.js';
import { isFavorito }      from '../storage.js';

const CAPA_FALLBACK = 'https://placehold.co/128x192/e5e2d9/6e6b64?text=Sem+Capa';

export function abrirDetalhe(livro, onGerarResenha, onSimilares) {
  const painel = document.getElementById('detalhe-livro');
  const capa   = livro.capa || CAPA_FALLBACK;
  const titulo = escaparHTML(livro.titulo);
  const autor  = escaparHTML(formatarAutores(livro.autores));

  const metaParts = [
    livro.editora && escaparHTML(livro.editora),
    livro.ano,
    livro.paginas && `${livro.paginas} páginas`,
  ].filter(Boolean);

  painel.innerHTML = `
    <div class="detalhe-inner" role="dialog" aria-modal="true" aria-label="Detalhes: ${titulo}">
      <button class="btn-fechar" id="btnFecharDetalhe" aria-label="Fechar painel">✕</button>
      <img class="detalhe-capa" src="${capa}" alt="Capa: ${titulo}">
      <h2 class="detalhe-titulo">${titulo}</h2>
      <p  class="detalhe-autor">${autor}</p>
      ${metaParts.length ? `<p class="detalhe-meta">${metaParts.join(' · ')}</p>` : ''}
      ${livro.descricao ? `<p class="detalhe-desc">${escaparHTML(livro.descricao)}</p>` : ''}
      ${livro.link ? `<a class="detalhe-link" href="${livro.link}" target="_blank" rel="noopener noreferrer">Ver no provedor ↗</a>` : ''}
      <div class="detalhe-actions">
        <button class="btn-ia" id="btnGerarResenha">✨ Gerar resenha com IA</button>
        <button class="btn-ia" id="btnSimilares">📚 Sugerir livros similares</button>
      </div>
      <div id="outputIA"></div>
    </div>
  `;

  painel.classList.remove('hidden');
  const focoAnterior = document.activeElement;
  document.getElementById('btnFecharDetalhe').focus();

  const fechar = () => {
    painel.classList.add('hidden');
    document.removeEventListener('keydown', onEsc);
    focoAnterior?.focus();
  };

  const onEsc = e => { if (e.key === 'Escape') fechar(); };
  document.addEventListener('keydown', onEsc);
  document.getElementById('btnFecharDetalhe').addEventListener('click', fechar);
  painel.addEventListener('click', e => { if (e.target === painel) fechar(); });

  document.getElementById('btnGerarResenha').addEventListener('click', () =>
    onGerarResenha(livro, document.getElementById('outputIA'))
  );

  document.getElementById('btnSimilares').addEventListener('click', () =>
    onSimilares(livro, document.getElementById('outputIA'))
  );
}
