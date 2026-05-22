const BASE    = 'https://openlibrary.org';
const COVERS  = 'https://covers.openlibrary.org/b/id';
const ID_PFX  = 'ol:';

function capa(coverId) {
  return coverId ? `${COVERS}/${coverId}-M.jpg` : '';
}

function normalizarBusca(doc) {
  const workId = (doc.key || '').replace('/works/', '');
  const descStr = Array.isArray(doc.first_sentence)
    ? doc.first_sentence[0]
    : (doc.first_sentence?.value || '');

  return {
    id:        ID_PFX + workId,
    titulo:    doc.title                                     || 'Sem título',
    autores:   doc.author_name                               || [],
    categoria: (doc.subject || [])[0]                        || '',
    descricao: descStr,
    capa:      capa(doc.cover_i),
    paginas:   doc.number_of_pages_median                    || 0,
    ano:       String(doc.first_publish_year                 || ''),
    nota:      doc.ratings_average
      ? Math.round(doc.ratings_average * 10) / 10
      : 0,
    link:      `${BASE}${doc.key}`,
    editora:   (doc.publisher || [])[0]                      || '',
    idioma:    (doc.language  || [])[0]                      || '',
  };
}

async function buscarNomeAutor(authorKey) {
  try {
    const res = await fetch(`${BASE}${authorKey}.json`);
    if (!res.ok) return '';
    const a = await res.json();
    return a.name || a.personal_name || '';
  } catch {
    return '';
  }
}

export function createOpenLibraryProvider() {
  return {
    nome: 'Open Library',

    async buscarLivros(termo, maxResultados = 40, ordenacao = 'relevance') {
      const url = new URL(`${BASE}/search.json`);
      url.searchParams.set('q',     termo);
      url.searchParams.set('limit', String(maxResultados));
      if (ordenacao === 'newest') url.searchParams.set('sort', 'new');

      const res = await fetch(url);
      if (!res.ok) throw Object.assign(new Error(`Open Library retornou ${res.status}`), { status: res.status });
      const data = await res.json();
      return (data.docs || []).map(normalizarBusca);
    },

    async buscarDetalhe(id) {
      const workId = id.replace(ID_PFX, '');
      const res = await fetch(`${BASE}/works/${workId}.json`);
      if (!res.ok) throw new Error(`Open Library: obra ${workId} não encontrada`);
      const work = await res.json();

      const desc = typeof work.description === 'string'
        ? work.description
        : (work.description?.value || '');

      let autores = [];
      if (work.authors?.length) {
        const nome = await buscarNomeAutor(work.authors[0].author.key);
        if (nome) autores = [nome];
      }

      return {
        id:        ID_PFX + workId,
        titulo:    work.title                        || 'Sem título',
        autores,
        categoria: (work.subjects || [])[0]          || '',
        descricao: desc,
        capa:      capa(work.covers?.[0]),
        paginas:   0,
        ano:       String(work.first_publish_date    || '').slice(0, 4),
        nota:      0,
        link:      `${BASE}/works/${workId}`,
        editora:   '',
        idioma:    '',
      };
    },
  };
}
