export function estadoParaHash(estado) {
  const p = new URLSearchParams();
  if (estado.termoBusca)      p.set('q',   estado.termoBusca);
  if (estado.categoriaAtiva)  p.set('cat', estado.categoriaAtiva);
  if (estado.paginaAtual > 1) p.set('p',   String(estado.paginaAtual));
  const qs = p.toString();
  return qs ? `#/busca?${qs}` : '#/inicio';
}

export function hashParaEstado() {
  const hash   = window.location.hash || '#/inicio';
  const rota   = hash.split('?')[0];
  const params = new URLSearchParams(hash.split('?')[1] || '');
  return {
    rota,
    termoBusca:     params.get('q')   || '',
    categoriaAtiva: params.get('cat') || '',
    paginaAtual:    Number(params.get('p')) || 1,
  };
}
