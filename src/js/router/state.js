export const estado = {
  resultados:     [],
  paginaAtual:    1,
  termoBusca:     '',
  categoriaAtiva: '',
  carregando:     false,
};

export function atualizarEstado(dados) {
  Object.assign(estado, dados);
}
