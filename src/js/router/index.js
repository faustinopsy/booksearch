import { hashParaEstado }                              from '../utils/url.js';
import { emit }                                        from '../eventBus.js';
import { atualizarNavAtiva }                           from './renderer.js';
import { rotaInicio, rotaBusca, rotaFavoritos, rotaSobre } from './rotas.js';

export function roteador(onBusca) {
  const { rota, termoBusca, categoriaAtiva, paginaAtual } = hashParaEstado();
  atualizarNavAtiva(rota);
  emit('rota:mudar', { rota });

  switch (rota) {
    case '#/busca':
      rotaBusca({ termoBusca, categoriaAtiva, paginaAtual }, onBusca);
      break;
    case '#/favoritos':
      rotaFavoritos();
      break;
    case '#/sobre':
      rotaSobre();
      break;
    default:
      rotaInicio();
  }
}

export function iniciarRouter(onBusca) {
  window.addEventListener('hashchange', () => roteador(onBusca));
  window.addEventListener('load',       () => roteador(onBusca));
}
