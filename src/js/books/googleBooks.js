const BASE = 'https://www.googleapis.com/books/v1/volumes';

function normalizar(item) {
  const v = item.volumeInfo || {};
  return {
    id:        item.id,
    titulo:    v.title                                          || 'Sem título',
    autores:   v.authors                                        || [],
    categoria: (v.categories || [])[0]                         || '',
    descricao: v.description                                    || '',
    capa:      v.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    paginas:   v.pageCount                                      || 0,
    ano:       (v.publishedDate || '').slice(0, 4),
    nota:      v.averageRating                                  || 0,
    link:      v.previewLink                                    || '',
    editora:   v.publisher                                      || '',
    idioma:    v.language                                       || '',
  };
}

export function createGoogleBooksProvider() {
  return {
    nome: 'Google Books',

    async buscarLivros(termo, maxResultados = 40, ordenacao = 'relevance') {
      const url = new URL(BASE);
      url.searchParams.set('q',            encodeURIComponent(termo));
      url.searchParams.set('maxResults',   String(maxResultados));
      url.searchParams.set('orderBy',      ordenacao);
      url.searchParams.set('langRestrict', 'pt');
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `Google Books retornou ${res.status}`;
        throw Object.assign(new Error(msg), { status: res.status });
      }
      const data = await res.json();
      return (data.items || []).map(normalizar);
    },

    async buscarDetalhe(id) {
      const res = await fetch(`${BASE}/${id}`);
      if (!res.ok) throw Object.assign(new Error(`Livro ${id} não encontrado`), { status: res.status });
      return normalizar(await res.json());
    },
  };
}
