import { toggleFavorito } from '../storage.js';
import { emit }           from '../eventBus.js';

export function handleToggleFavorito(id, e) {
  e.stopPropagation();
  const adicionado = toggleFavorito(id);
  const btn = e.currentTarget;
  btn.textContent = adicionado ? '❤️' : '🤍';
  btn.classList.toggle('favoritado', adicionado);
  btn.setAttribute('aria-pressed', String(adicionado));
  btn.setAttribute('aria-label', adicionado ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  emit('favorito:alterado', { id, adicionado });
}
