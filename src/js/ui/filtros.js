import { traduzirCategoria } from '../utils/book.js';

export function popularSelectCategorias(lista, catAtiva) {
  const select = document.getElementById('selectCat');
  if (!select) return;
  const cats = [...new Set(lista.map(l => l.categoria).filter(Boolean))].sort();
  select.innerHTML =
    '<option value="">Todas as categorias</option>' +
    cats.map(c =>
      `<option value="${c}" ${c === catAtiva ? 'selected' : ''}>${traduzirCategoria(c)}</option>`
    ).join('');
}
