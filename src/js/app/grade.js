import { estado }               from '../router/state.js';
import { abrirDetalhe }         from '../ui/detalhe.js';
import { handleGerarResenha, handleSugerirSimilares } from './ia.js';
import { handleToggleFavorito } from './favoritos.js';

export function configurarGrade() {
  const grade = document.getElementById('grade-livros');

  grade.addEventListener('click', e => {
    const btnFav = e.target.closest('[data-fav]');
    if (btnFav) { handleToggleFavorito(btnFav.dataset.fav, btnFav); return; }

    const card = e.target.closest('.card-livro');
    if (!card) return;

    const livro = estado.resultados.find(l => l.id === card.dataset.id);
    if (livro) abrirDetalhe(livro, handleGerarResenha, handleSugerirSimilares);
  });

  grade.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.card-livro');
      if (card) { e.preventDefault(); card.click(); }
    }
  });
}
