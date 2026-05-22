import { toggleFavorito } from '../storage.js';
import { emit }           from '../eventBus.js';

export function handleToggleFavorito(id, btnEl) {
  const adicionado = toggleFavorito(id);
  btnEl.textContent = adicionado ? '❤️' : '🤍';
  btnEl.classList.toggle('favoritado', adicionado);
  btnEl.setAttribute('aria-pressed', String(adicionado));
  btnEl.setAttribute('aria-label', adicionado ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  emit('favorito:alterado', { id, adicionado });
}
