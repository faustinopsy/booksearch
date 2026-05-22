const KEYS = {
  FAVORITOS: 'bs_favoritos',
  HISTORICO: 'bs_historico',
};

function lerJSON(chave, fallback) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function carregarFavoritos() {
  return lerJSON(KEYS.FAVORITOS, []);
}

export function salvarFavoritos(lista) {
  localStorage.setItem(KEYS.FAVORITOS, JSON.stringify(lista));
}

export function isFavorito(id) {
  return carregarFavoritos().includes(id);
}

export function toggleFavorito(id) {
  const favs = carregarFavoritos();
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  salvarFavoritos(favs);
  return idx === -1;
}

export function carregarHistorico() {
  return lerJSON(KEYS.HISTORICO, []);
}

export function registrarBusca(termo) {
  if (!termo?.trim()) return;
  let hist = carregarHistorico();
  hist = [termo, ...hist.filter(t => t !== termo)].slice(0, 5);
  localStorage.setItem(KEYS.HISTORICO, JSON.stringify(hist));
}
