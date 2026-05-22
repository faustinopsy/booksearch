import { buscarLivros }            from '../api.js';
import { atualizarEstado }         from '../router/state.js';
import { renderizarPaginaAtual }   from '../router/renderer.js';
import { mostrarLoading, mostrarErro } from '../ui/feedback.js';
import { registrarBusca }          from '../storage.js';
import { emit }                    from '../eventBus.js';

export async function executarBusca(termo) {
  if (!termo?.trim()) return;

  mostrarLoading(12);
  registrarBusca(termo);
  emit('busca:inicio', { termo });

  try {
    const ordem  = document.getElementById('selectOrdem')?.value || 'relevance';
    const livros = await buscarLivros(termo, 40, ordem);
    atualizarEstado({ resultados: livros, termoBusca: termo, paginaAtual: 1, erro: null });
    renderizarPaginaAtual();
    document.title = `BookSearch · ${termo}`;
    emit('busca:completa', { termo, total: livros.length });
  } catch (e) {
    mostrarErro(e.message);
    emit('busca:erro', { termo, erro: e.message });
  }
}

export function navegarParaBusca(termo) {
  const hash = `#/busca?q=${encodeURIComponent(termo.trim())}`;
  if (window.location.hash !== hash) window.location.hash = hash;
  else executarBusca(termo);
}
