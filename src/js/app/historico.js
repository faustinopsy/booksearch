import { carregarHistorico }    from '../storage.js';
import { renderizarHistorico } from '../ui/historico.js';

export function sincronizarHistorico(onNavegar) {
  renderizarHistorico(carregarHistorico(), onNavegar);
}
